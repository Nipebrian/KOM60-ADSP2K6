import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { pesananAPI, umkmAPI, getImageUrl } from '../services/api';
import { withRouter } from '../utils/withRouter';
import './UploadBuktiPage.css';

const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const STEPS = ['Pesanan Dibuat', 'Upload Bukti', 'Validasi', 'Selesai'];
const PAYMENT_DURATION_SEC = 5 * 60; // 5 menit

class UploadBuktiPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = {
      user,
      pesanan: null,
      umkm: null,
      loading: true,
      activeMethod: null,
      metode: '',
      file: null,
      preview: null,
      dragging: false,
      uploading: false,
      error: '',
      success: false,
      copied: false,
      timeLeft: null,
      expired: false,
      cancelledByStatus: false,
    };
    this.inputRef = React.createRef();
    this.timerInterval = null;
  }

  componentDidMount() {
    if (!this.state.user) return;
    const { pesananId } = this.props.params;
    if (pesananId) this.fetchPesanan(pesananId);
  }

  componentWillUnmount() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  fetchPesanan = async (id) => {
    try {
      const res = await pesananAPI.getById(id);
      const pesanan = res.data;
      this.setState({ pesanan, loading: false });

      if (['ditolak', 'batal'].includes(pesanan.status_pesanan)) {
        this.setState({ expired: true, cancelledByStatus: true });
        return;
      }

      if (['menunggu_validasi', 'diproses', 'siap_diambil', 'selesai'].includes(pesanan.status_pesanan)) {
        this.setState({ success: true });
        return;
      }

      if (pesanan.umkm_id) {
        try {
          const umkmRes = await umkmAPI.getById(pesanan.umkm_id);
          const umkm = umkmRes.data;
          this.setState({ umkm });
          const methods = this.buildMethods(umkm);
          if (methods.length > 0) {
            this.setState({ activeMethod: methods[0].key, metode: methods[0].key });
          }
        } catch { /* silently ignore */ }
      }

      if (pesanan.status_pesanan === 'menunggu_pembayaran' && pesanan.tanggal_pesan) {
        this.startCountdown(pesanan.tanggal_pesan);
      }
    } catch {
      this.setState({ loading: false });
    }
  };

  buildMethods = (umkm) => {
    if (!umkm) return [];
    const methods = [];
    if (umkm.nama_bank && umkm.nomor_rekening) {
      methods.push({
        key: 'bank',
        label: umkm.nama_bank,
        noRek: umkm.nomor_rekening,
        atas: umkm.nama_umkm,
      });
    }
    if (umkm.nomor_ewallet) {
      methods.push({
        key: 'ewallet',
        label: 'E-Wallet',
        noRek: umkm.nomor_ewallet,
        atas: umkm.nama_umkm,
      });
    }
    if (umkm.foto_qris) {
      methods.push({
        key: 'qris',
        label: 'QRIS',
        qrisImage: umkm.foto_qris,
      });
    }
    return methods;
  };

  startCountdown = (tanggalPesan) => {
    // Backend menyimpan waktu UTC tanpa suffix 'Z'; tanpa 'Z', browser mengartikannya
    // sebagai waktu lokal (WIB/UTC+7) sehingga deadline sudah lewat sebelum timer mulai.
    const utcTs = /Z|[+-]\d{2}:\d{2}$/.test(tanggalPesan) ? tanggalPesan : tanggalPesan + 'Z';
    const deadline = new Date(utcTs).getTime() + PAYMENT_DURATION_SEC * 1000;
    const tick = () => {
      const remaining = Math.floor((deadline - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(this.timerInterval);
        this.setState({ timeLeft: 0 });
        this.handleExpired();
      } else {
        this.setState({ timeLeft: remaining });
      }
    };
    tick();
    this.timerInterval = setInterval(tick, 1000);
  };

  handleExpired = async () => {
    const { pesanan } = this.state;
    if (!pesanan) return;
    this.setState({ expired: true });
    try {
      await pesananAPI.batalPesanan(pesanan.pesanan_id);
    } catch { /* ignore */ }
  };

  formatCountdown = (seconds) => {
    if (seconds == null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  handleFileChange = (file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    this.setState({ file, preview, error: '' });
  };

  handleDrop = (e) => {
    e.preventDefault();
    this.setState({ dragging: false });
    const file = e.dataTransfer.files[0];
    if (file) this.handleFileChange(file);
  };

  handleSubmit = async () => {
    const { file, metode, expired } = this.state;
    const { pesananId } = this.props.params;
    if (expired) {
      this.setState({ error: 'Waktu pembayaran telah habis. Pesanan telah dibatalkan.' });
      return;
    }
    if (!file) {
      this.setState({ error: 'Mohon pilih file bukti pembayaran.' });
      return;
    }
    this.setState({ uploading: true, error: '' });
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metode_pembayaran', metode);
      await pesananAPI.uploadBukti(pesananId, formData);
      this.setState({ success: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map(e => e.msg || String(e)).join(', ')
        : (typeof detail === 'string' ? detail : 'Gagal upload bukti. Coba lagi.');
      this.setState({ error: msg });
    } finally {
      this.setState({ uploading: false });
    }
  };

  copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  render() {
    const {
      pesanan, umkm, loading, activeMethod, metode,
      file, preview, dragging, uploading, error, success,
      copied, timeLeft, expired, cancelledByStatus,
    } = this.state;
    const user2 = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user2) return <Navigate to="/login" replace />;
    if (user2.role !== 'mahasiswa') return <Navigate to={user2.role === 'umkm' ? '/dashboard/umkm' : '/dashboard/admin'} replace />;
    if (success) return <Navigate to="/pesanan" replace />;

    const methods = this.buildMethods(umkm);
    const activeMethodData = methods.find(m => m.key === activeMethod) || null;
    const timerDanger = timeLeft !== null && timeLeft <= 60;

    return (
      <div className="ub-page">
        <nav className="ub-navbar">
          <Link to="/" className="ub-logo">
            <span className="ub-logo-icon">🍽️</span> IPB Food Hub
          </Link>
          <div className="ub-navbar-right">
            <span className="ub-nav-icon">🔔</span>
            <span className="ub-nav-icon">❓</span>
            <div className="ub-avatar-circle">
              {user2 ? user2.nama?.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </nav>

        <div className="ub-stepper-wrap">
          <div className="ub-stepper">
            {STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div className={`ub-step ${i === 0 ? 'done' : i === 1 ? 'active' : ''}`}>
                  <div className="ub-step-circle">
                    {i === 0 ? '✓' : i + 1}
                  </div>
                  <div className="ub-step-label">{step}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`ub-step-line ${i === 0 ? 'done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="ub-loading">
            <div className="ub-spinner" /> Memuat data pesanan...
          </div>
        ) : expired ? (
          <div className="ub-expired-card">
            <div className="ub-expired-icon">⏰</div>
            <h2 className="ub-expired-title">
              {cancelledByStatus ? 'Pesanan Telah Dibatalkan' : 'Waktu Pembayaran Habis'}
            </h2>
            <p className="ub-expired-desc">
              {cancelledByStatus
                ? 'Pesanan ini sudah dibatalkan dan tidak dapat menerima bukti pembayaran. Silakan buat pesanan baru.'
                : 'Pesanan Anda telah dibatalkan karena melewati batas waktu pembayaran 5 menit.'}
            </p>
            <Link to="/direktori" className="ub-submit-btn ub-expired-btn">
              Pesan Lagi
            </Link>
          </div>
        ) : (
          <main className="ub-main">
            <div className="ub-left-card">
              <button className="ub-back-btn" onClick={() => this.props.navigate(-1)}>
                ← Kembali
              </button>

              <h2 className="ub-card-title">Transfer Pembayaran</h2>
              <p className="ub-card-sub">Selesaikan pembayaran sesuai instruksi di bawah ini.</p>

              {pesanan && (
                <>
                  <div className="ub-total-label">Total Pembayaran</div>
                  <div className="ub-total-amount">
                    {formatRp(pesanan.total_harga || pesanan.pembayaran?.jumlah_bayar || 0)}
                    <button className="ub-copy-icon" onClick={() => this.copyToClipboard(String(pesanan.total_harga))}>
                      {copied ? '✓' : '📋'}
                    </button>
                  </div>
                  {timeLeft !== null && (
                    <div className={`ub-timer ${timerDanger ? 'danger' : ''}`}>
                      ⏱ Bayar dalam {this.formatCountdown(timeLeft)}
                    </div>
                  )}
                </>
              )}

              {methods.length > 0 ? (
                <>
                  <div className="ub-bank-tabs">
                    {methods.map(m => (
                      <button
                        key={m.key}
                        className={`ub-bank-tab ${activeMethod === m.key ? 'active' : ''}`}
                        onClick={() => this.setState({ activeMethod: m.key, metode: m.key })}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {activeMethodData && (
                    <div className="ub-bank-detail">
                      {activeMethodData.key === 'qris' ? (
                        <div className="ub-qris-wrap">
                          {activeMethodData.qrisImage ? (
                            <img
                              src={getImageUrl(activeMethodData.qrisImage)}
                              alt="QR Code UMKM"
                              className="ub-qris-img"
                            />
                          ) : (
                            <div className="ub-qris-placeholder">📱 QR Code tidak tersedia</div>
                          )}
                          <div className="ub-bank-field-label" style={{ marginTop: 10, textAlign: 'center' }}>
                            Scan QR Code di atas untuk membayar
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="ub-bank-row">
                            <div>
                              <div className="ub-bank-field-label">
                                {activeMethodData.key === 'ewallet' ? 'Nomor E-Wallet' : `Nomor ${activeMethodData.label}`}
                              </div>
                              <div className="ub-bank-field-val">{activeMethodData.noRek}</div>
                            </div>
                            <button className="ub-salin-btn" onClick={() => this.copyToClipboard(activeMethodData.noRek)}>
                              📋 Salin
                            </button>
                          </div>
                          {activeMethodData.atas && (
                            <div className="ub-bank-row" style={{ marginTop: 12 }}>
                              <div>
                                <div className="ub-bank-field-label">Atas Nama</div>
                                <div className="ub-bank-field-val">{activeMethodData.atas}</div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="ub-no-methods">
                  Metode pembayaran belum dikonfigurasi oleh UMKM ini. Hubungi UMKM secara langsung.
                </div>
              )}

              {pesanan?.detail_list && (
                <div className="ub-items-list">
                  <div className="ub-items-title">Rincian Pesanan</div>
                  {pesanan.detail_list.map(d => (
                    <div key={d.detail_id} className="ub-item-row">
                      <span>{d.nama_menu} ×{d.jumlah}</span>
                      <span>{formatRp(d.subtotal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ub-right-card">
              <h2 className="ub-card-title">Upload Bukti Transfer</h2>

              {methods.length > 0 && (
                <div className="ub-field-group">
                  <label className="ub-label">Metode Pembayaran</label>
                  <div className="ub-select-wrap">
                    <select
                      value={metode}
                      onChange={e => this.setState({ metode: e.target.value, activeMethod: e.target.value })}
                      className="ub-select"
                    >
                      {methods.map(m => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                      ))}
                    </select>
                    <span className="ub-select-arrow">▾</span>
                  </div>
                </div>
              )}

              <div
                className={`ub-dropzone ${dragging ? 'dragging' : ''} ${preview ? 'has-file' : ''}`}
                onDragOver={e => { e.preventDefault(); this.setState({ dragging: true }); }}
                onDragLeave={() => this.setState({ dragging: false })}
                onDrop={this.handleDrop}
                onClick={() => this.inputRef.current?.click()}
              >
                <input
                  ref={this.inputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => this.handleFileChange(e.target.files[0])}
                />
                {preview ? (
                  <img src={preview} alt="Preview bukti" className="ub-preview-img" />
                ) : (
                  <>
                    <div className="ub-upload-icon">☁</div>
                    <div className="ub-drop-text">Klik atau tarik file ke sini untuk mengunggah</div>
                    <div className="ub-drop-hint">Format: JPG, PNG (Maks 5MB)</div>
                  </>
                )}
              </div>

              {file && (
                <div className="ub-file-name">📎 {file.name}</div>
              )}

              {error && <div className="ub-error">{error}</div>}

              <button
                className="ub-submit-btn"
                onClick={this.handleSubmit}
                disabled={uploading || expired}
              >
                {uploading ? 'Mengirim...' : 'Kirim Bukti Pembayaran ➤'}
              </button>
            </div>
          </main>
        )}
      </div>
    );
  }
}

export default withRouter(UploadBuktiPage);
