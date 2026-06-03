import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { pesananAPI, ratingAPI } from '../services/api';
import './PesananPage.css';

const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const formatDate = (s) => {
  if (!s) return '';
  const d = new Date(s);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const STATUS_STEPS = ['Dipesan', 'Dibayar', 'Diproses', 'Siap', 'Selesai'];
const STATUS_MAP = {
  menunggu_pembayaran: 0,
  menunggu_validasi: 1,
  diproses: 2,
  siap_diambil: 3,
  selesai: 4,
  ditolak: -1,
};
const STATUS_BADGE = {
  menunggu_pembayaran: { label: 'Menunggu Pembayaran', cls: 'badge-orange' },
  menunggu_validasi: { label: 'Menunggu Validasi', cls: 'badge-orange' },
  diproses: { label: 'Diproses', cls: 'badge-yellow' },
  siap_diambil: { label: 'Siap Diambil', cls: 'badge-green' },
  selesai: { label: 'Selesai', cls: 'badge-gray' },
  ditolak: { label: 'Ditolak', cls: 'badge-red' },
};
const AKTIF_STATUS = ['menunggu_pembayaran', 'menunggu_validasi', 'diproses', 'siap_diambil'];

class PesananPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = {
      user,
      activeTab: 'aktif',
      pesananList: [],
      loading: true,
      ratingModal: null,  // pesanan object
      ratingNilai: 5,
      ratingKomentar: '',
      ratingLoading: false,
      ratingError: '',
      ratingDone: new Set(),
    };
  }

  componentDidMount() {
    if (!this.state.user) return;
    this.fetchPesanan();
  }

  fetchPesanan = async () => {
    this.setState({ loading: true });
    try {
      const res = await pesananAPI.getMy();
      this.setState({ pesananList: res.data || [] });
    } catch {
      this.setState({ pesananList: [] });
    } finally {
      this.setState({ loading: false });
    }
  };

  getFiltered = () => {
    const { pesananList, activeTab } = this.state;
    if (activeTab === 'aktif') return pesananList.filter(p => AKTIF_STATUS.includes(p.status_pesanan));
    return pesananList.filter(p => !AKTIF_STATUS.includes(p.status_pesanan));
  };

  openRating = (pesanan) => this.setState({ ratingModal: pesanan, ratingNilai: 5, ratingKomentar: '', ratingError: '' });
  closeRating = () => this.setState({ ratingModal: null });

  submitRating = async () => {
    const { ratingModal, ratingNilai, ratingKomentar } = this.state;
    this.setState({ ratingLoading: true, ratingError: '' });
    try {
      await ratingAPI.create({
        umkm_id: ratingModal.umkm_id,
        nilai: ratingNilai,
        komentar: ratingKomentar,
      });
      this.setState(prev => ({
        ratingDone: new Set([...prev.ratingDone, ratingModal.pesanan_id]),
        ratingModal: null,
      }));
    } catch (err) {
      this.setState({ ratingError: err.response?.data?.detail || 'Gagal mengirim rating.' });
    } finally {
      this.setState({ ratingLoading: false });
    }
  };

  renderProgress = (status) => {
    const step = STATUS_MAP[status] ?? 0;
    if (step === -1) return (
      <div className="ps-progress-bar">
        <div className="ps-progress-fill" style={{ width: '20%', background: '#ef4444' }} />
      </div>
    );
    return (
      <div className="ps-steps-row">
        {STATUS_STEPS.map((s, i) => (
          <div key={s} className={`ps-step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`}>
            <div className="ps-dot-circle">
              {i < step ? '✓' : i === step ? <span className="ps-dot-ring" /> : ''}
            </div>
            <span className="ps-dot-label">{s}</span>
          </div>
        ))}
      </div>
    );
  };

  render() {
    const { user, activeTab, loading, ratingModal, ratingNilai, ratingKomentar, ratingLoading, ratingError, ratingDone } = this.state;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'mahasiswa') return <Navigate to={user.role === 'umkm' ? '/dashboard/umkm' : '/dashboard/admin'} replace />;

    const filtered = this.getFiltered();
    const aktifCount = this.state.pesananList.filter(p => AKTIF_STATUS.includes(p.status_pesanan)).length;

    return (
      <div className="ps-page">
        <nav className="ps-navbar">
          <Link to="/" className="ps-logo">
            <span>🍽️</span> IPB Food Hub
          </Link>
          <div className="ps-navbar-right">
            <span className="ps-nav-icon">🔔</span>
            <div className="ps-avatar">{user.nama?.charAt(0).toUpperCase()}</div>
          </div>
        </nav>

        <main className="ps-main">
          <div className="ps-heading-area">
            <h1 className="ps-heading">Pesanan Saya</h1>
            <p className="ps-subheading">Pantau status pesanan dan lihat riwayat transaksi Anda.</p>
          </div>

          <div className="ps-tabs">
            <button
              className={`ps-tab ${activeTab === 'aktif' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'aktif' })}
            >
              Aktif {aktifCount > 0 && `(${aktifCount})`}
            </button>
            <button
              className={`ps-tab ${activeTab === 'riwayat' ? 'active' : ''}`}
              onClick={() => this.setState({ activeTab: 'riwayat' })}
            >
              Riwayat
            </button>
          </div>
          <div className="ps-tab-underline" />

          {loading ? (
            <div className="ps-loading"><div className="ps-spinner" /> Memuat pesanan...</div>
          ) : filtered.length === 0 ? (
            <div className="ps-empty">
              <div className="ps-empty-icon">📋</div>
              <p>{activeTab === 'aktif' ? 'Tidak ada pesanan aktif.' : 'Belum ada riwayat pesanan.'}</p>
              <Link to="/direktori" className="ps-btn-primary">Pesan Sekarang</Link>
            </div>
          ) : (
            <div className="ps-cards">
              {filtered.map(p => {
                const badge = STATUS_BADGE[p.status_pesanan] || { label: p.status_pesanan, cls: 'badge-gray' };
                const isSelesai = p.status_pesanan === 'selesai';
                const sudahRating = ratingDone.has(p.pesanan_id);
                const items = p.detail_list?.map(d => `${d.nama_menu} x${d.jumlah}`).join(', ') || '';

                return (
                  <div key={p.pesanan_id} className="ps-card">
                    <div className="ps-card-header">
                      <div className="ps-card-umkm">
                        <div className="ps-umkm-img">🏪</div>
                        <div>
                          <div className="ps-umkm-name">{p.nama_umkm}</div>
                          <div className="ps-order-meta">
                            {formatDate(p.tanggal_pesan)} • ID: {p.pesanan_id?.slice(0, 8).toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <span className={`ps-badge ${badge.cls}`}>{badge.label}</span>
                    </div>

                    <div className="ps-card-items">
                      <span className="ps-items-label">Pesanan:</span> {items}
                    </div>

                    {this.renderProgress(p.status_pesanan)}

                    <div className="ps-card-footer">
                      <div>
                        <div className="ps-total-label">Total Pembayaran</div>
                        <div className="ps-total-val">{formatRp(p.total_harga)}</div>
                      </div>
                      <div className="ps-footer-actions">
                        {p.status_pesanan === 'menunggu_pembayaran' && (
                          <Link to={`/pesanan/${p.pesanan_id}/bayar`} className="ps-btn-pay">
                            Bayar Sekarang
                          </Link>
                        )}
                        {isSelesai && !sudahRating && (
                          <button className="ps-btn-rating" onClick={() => this.openRating(p)}>
                            ⭐ Beri Rating
                          </button>
                        )}
                        <button className="ps-btn-detail">Lihat Detail</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {ratingModal && (
          <div className="ps-modal-overlay" onClick={this.closeRating}>
            <div className="ps-modal" onClick={e => e.stopPropagation()}>
              <div className="ps-modal-header">
                <h3>Beri Rating</h3>
                <button className="ps-modal-close" onClick={this.closeRating}>✕</button>
              </div>
              <div className="ps-modal-umkm">{ratingModal.nama_umkm}</div>

              <div className="ps-star-row">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    className={`ps-star ${s <= ratingNilai ? 'active' : ''}`}
                    onClick={() => this.setState({ ratingNilai: s })}
                  >★</button>
                ))}
              </div>
              <div className="ps-rating-hint">{ratingNilai} / 5</div>

              <textarea
                className="ps-rating-textarea"
                placeholder="Tuliskan pengalaman kamu (opsional)..."
                value={ratingKomentar}
                onChange={e => this.setState({ ratingKomentar: e.target.value })}
                rows={4}
              />

              {ratingError && <div className="ps-modal-error">{ratingError}</div>}

              <div className="ps-modal-actions">
                <button className="ps-btn-cancel" onClick={this.closeRating}>Batal</button>
                <button className="ps-btn-submit-rating" onClick={this.submitRating} disabled={ratingLoading}>
                  {ratingLoading ? 'Mengirim...' : 'Kirim Rating'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default PesananPage;
