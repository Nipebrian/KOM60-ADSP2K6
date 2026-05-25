import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { pesananAPI } from '../services/api';
import { withRouter } from '../utils/withRouter';
import './UploadBuktiPage.css';

const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const STEPS = ['Pesanan Dibuat', 'Upload Bukti', 'Validasi', 'Selesai'];

const PAYMENT_INFO = {
  BCA: { label: 'BCA', noRek: '1234567890', atas: 'IPB Food Hub' },
  Mandiri: { label: 'Mandiri', noRek: '0987654321', atas: 'IPB Food Hub' },
  GoPay: { label: 'GoPay', noRek: '0812-3456-7890', atas: 'a.n. UMKM Partner' },
  QRIS: { label: 'QRIS', noRek: 'Scan QR di kasir UMKM', atas: '' },
};

class UploadBuktiPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = {
      user,
      pesanan: null,
      loading: true,
      activeBank: 'GoPay',
      metode: 'GoPay',
      file: null,
      preview: null,
      dragging: false,
      uploading: false,
      error: '',
      success: false,
      copied: false,
    };
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    if (!this.state.user) return;
    const { pesananId } = this.props.params;
    if (pesananId) this.fetchPesanan(pesananId);
  }

  fetchPesanan = async (id) => {
    try {
      const res = await pesananAPI.getById(id);
      this.setState({ pesanan: res.data, loading: false });
    } catch {
      this.setState({ loading: false });
    }
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
    const { file, metode } = this.state;
    const { pesananId } = this.props.params;
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
    const { user, pesanan, loading, activeBank, metode, file, preview, dragging, uploading, error, success, copied } = this.state;
    const user2 = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user2) return <Navigate to="/login" replace />;
    if (success) return <Navigate to="/pesanan" replace />;

    const bankInfo = PAYMENT_INFO[activeBank];

    return (
      <div className="ub-page">
        {/* ── NAVBAR ── */}
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

        {/* ── STEPPER ── */}
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
        ) : (
          <main className="ub-main">
            {/* ═══ LEFT: Payment Info ═══ */}
            <div className="ub-left-card">
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
                  <div className="ub-timer">⏱ Bayar dalam 23:59:00</div>
                </>
              )}

              {/* Bank tabs */}
              <div className="ub-bank-tabs">
                {Object.keys(PAYMENT_INFO).map(bank => (
                  <button
                    key={bank}
                    className={`ub-bank-tab ${activeBank === bank ? 'active' : ''}`}
                    onClick={() => this.setState({ activeBank: bank, metode: bank })}
                  >
                    {bank}
                  </button>
                ))}
              </div>

              <div className="ub-bank-detail">
                <div className="ub-bank-row">
                  <div>
                    <div className="ub-bank-field-label">
                      {activeBank === 'QRIS' ? 'Cara Pembayaran' : `Nomor ${bankInfo.label}`}
                    </div>
                    <div className="ub-bank-field-val">{bankInfo.noRek}</div>
                  </div>
                  {activeBank !== 'QRIS' && (
                    <button className="ub-salin-btn" onClick={() => this.copyToClipboard(bankInfo.noRek)}>
                      📋 Salin
                    </button>
                  )}
                </div>
                {bankInfo.atas && (
                  <div className="ub-bank-row" style={{ marginTop: 12 }}>
                    <div>
                      <div className="ub-bank-field-label">Atas Nama</div>
                      <div className="ub-bank-field-val">
                        {pesanan?.nama_umkm ? `a.n. ${pesanan.nama_umkm}` : bankInfo.atas}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Items list */}
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

            {/* ═══ RIGHT: Upload ═══ */}
            <div className="ub-right-card">
              <h2 className="ub-card-title">Upload Bukti Transfer</h2>

              <div className="ub-field-group">
                <label className="ub-label">Metode Pembayaran</label>
                <div className="ub-select-wrap">
                  <select
                    value={metode}
                    onChange={e => this.setState({ metode: e.target.value, activeBank: e.target.value })}
                    className="ub-select"
                  >
                    {Object.keys(PAYMENT_INFO).map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  <span className="ub-select-arrow">▾</span>
                </div>
              </div>

              {/* Drop zone */}
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
                disabled={uploading}
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
