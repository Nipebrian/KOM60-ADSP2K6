import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { pesananAPI, getImageUrl } from '../services/api';
import UMKMSidebar from '../components/UMKMSidebar';
import './DashboardUMKM.css';

const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const formatDate = (s) => {
  if (!s) return '-';
  const d = new Date(s);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) +
    ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const TABS = [
  { key: 'menunggu_validasi', label: 'Menunggu Validasi' },
  { key: 'diproses',          label: 'Diproses' },
  { key: 'siap_diambil',      label: 'Siap Diambil' },
  { key: 'selesai',           label: 'Selesai' },
  { key: 'ditolak',           label: 'Ditolak' },
];

class PesananMasukPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = {
      user,
      activeTab: 'menunggu_validasi',
      pesananList: [],
      loading: true,
      search: '',
      tolakModal: null,
      catatanTolak: '',
      actionLoading: null,
      buktiModal: null,
    };
  }

  componentDidMount() {
    if (!this.state.user || this.state.user.role !== 'umkm') return;
    this.fetchPesanan();
  }

  fetchPesanan = async () => {
    this.setState({ loading: true });
    try {
      const res = await pesananAPI.getMasuk();
      this.setState({ pesananList: res.data?.data || res.data || [] });
    } catch { this.setState({ pesananList: []  }); }
    finally { this.setState({ loading: false }); }
  };

  getFiltered = () => {
    const { pesananList, activeTab, search } = this.state;
    let list = pesananList.filter(p => p.status_pesanan === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.pesanan_id?.toLowerCase().includes(q) ||
        p.nama_mahasiswa?.toLowerCase().includes(q)
      );
    }
    return list;
  };

  getCounts = () => {
    const { pesananList } = this.state;
    const counts = {};
    TABS.forEach(t => { counts[t.key] = pesananList.filter(p => p.status_pesanan === t.key).length; });
    return counts;
  };

  handleTerima = async (pesananId) => {
    this.setState({ actionLoading: pesananId });
    try {
      await pesananAPI.verifikasiBukti(pesananId, { status_verifikasi: 'terverifikasi' });
      await this.fetchPesanan();
    } catch { alert('Gagal menerima pesanan.'); }
    finally { this.setState({ actionLoading: null }); }
  };

  openTolak = (p) => this.setState({ tolakModal: p, catatanTolak: '' });
  closeTolak = () => this.setState({ tolakModal: null });

  handleTolak = async () => {
    const { tolakModal, catatanTolak } = this.state;
    this.setState({ actionLoading: tolakModal.pesanan_id });
    try {
      await pesananAPI.verifikasiBukti(tolakModal.pesanan_id, {
        status_verifikasi: 'ditolak',
        catatan_verifikasi: catatanTolak,
      });
      this.setState({ tolakModal: null });
      await this.fetchPesanan();
    } catch { alert('Gagal menolak pesanan.'); }
    finally { this.setState({ actionLoading: null }); }
  };

  handleUpdateStatus = async (pesananId, status) => {
    this.setState({ actionLoading: pesananId });
    try {
      await pesananAPI.updateStatus(pesananId, { status_pesanan: status });
      await this.fetchPesanan();
    } catch { alert('Gagal update status.'); }
    finally { this.setState({ actionLoading: null }); }
  };

  render() {
    const { user, activeTab, loading, search, tolakModal, catatanTolak, actionLoading, buktiModal } = this.state;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'umkm') return <Navigate to="/" replace />;

    const filtered = this.getFiltered();
    const counts = this.getCounts();

    return (
      <div className="du-wrapper">
        <UMKMSidebar activePath="/dashboard/umkm/pesanan" />

        <div className="du-content">
          <header className="du-topbar">
            <div className="du-topbar-title">Merchant Hub</div>
            <div className="du-topbar-right">
              <div className="du-search-bar">
                <span className="du-search-icon">🔍</span>
                <input
                  value={search}
                  onChange={e => this.setState({ search: e.target.value })}
                  placeholder="Cari Order ID..."
                />
              </div>
              <span className="du-topbar-icon">⚙️</span>
              <div className="du-topbar-avatar">{user.nama?.charAt(0).toUpperCase()}</div>
            </div>
          </header>

          <div className="du-body">
            <div className="du-page-title" style={{ marginBottom: 20 }}>Pesanan Masuk</div>

            {/* Tabs */}
            <div className="du-cat-tabs">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`du-cat-tab ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => this.setState({ activeTab: t.key })}
                >
                  {t.label} {counts[t.key] > 0 ? `(${counts[t.key]})` : ''}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="du-loading"><div className="du-spinner" /></div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Tidak ada pesanan.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filtered.map(p => {
                  const items = p.detail_list?.map(d => `${d.nama_menu} x${d.jumlah}`).join(', ') || '—';
                  const isLoading = actionLoading === p.pesanan_id;
                  return (
                    <div key={p.pesanan_id} className="du-table-card" style={{ padding: '18px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        {/* Left: order info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                            <div style={{ fontWeight: 700, color: '#006B3F', fontSize: 15 }}>
                              #{p.pesanan_id?.slice(0, 8).toUpperCase()}
                            </div>
                            <span className={`du-badge ${activeTab === 'menunggu_validasi' ? 'yellow' : activeTab === 'diproses' ? 'blue' : activeTab === 'siap_diambil' ? 'green' : activeTab === 'ditolak' ? 'red' : 'gray'}`}>
                              {TABS.find(t => t.key === activeTab)?.label}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eaf5ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#006B3F', fontSize: 14 }}>
                              {p.nama_mahasiswa?.charAt(0).toUpperCase() || 'M'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{p.nama_mahasiswa || 'Mahasiswa'}</div>
                              <div style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(p.tanggal_pesan)}</div>
                            </div>
                          </div>
                          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13.5, color: '#374151' }}>
                            {items}
                          </div>
                          {p.catatan_pesanan && (
                            <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 6 }}>📝 {p.catatan_pesanan}</div>
                          )}
                        </div>

                        {/* Right: total + actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, minWidth: 160 }}>
                          <div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>Total Belanja</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{formatRp(p.total_harga)}</div>
                          </div>

                          {p.pembayaran?.bukti?.foto_url && (
                            <button
                              onClick={() => this.setState({ buktiModal: getImageUrl(p.pembayaran.bukti.foto_url) })}
                              style={{ fontSize: 13, color: '#006B3F', fontWeight: 600, background: 'none', border: '1.5px solid #006B3F', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                              🖼 Lihat Bukti
                            </button>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                            {activeTab === 'menunggu_validasi' && (
                              <>
                                <button className="du-btn primary" onClick={() => this.handleTerima(p.pesanan_id)} disabled={isLoading} style={{ width: '100%' }}>
                                  {isLoading ? '...' : 'Terima'}
                                </button>
                                <button className="du-btn" style={{ background: '#fff', color: '#ef4444', border: '1.5px solid #ef4444', borderRadius: 10, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                                  onClick={() => this.openTolak(p)} disabled={isLoading}>
                                  Tolak
                                </button>
                              </>
                            )}
                            {activeTab === 'diproses' && (
                              <button className="du-btn primary" onClick={() => this.handleUpdateStatus(p.pesanan_id, 'siap_diambil')} disabled={isLoading} style={{ width: '100%' }}>
                                {isLoading ? '...' : 'Tandai Siap Diambil'}
                              </button>
                            )}
                            {activeTab === 'siap_diambil' && (
                              <button className="du-btn primary" onClick={() => this.handleUpdateStatus(p.pesanan_id, 'selesai')} disabled={isLoading} style={{ width: '100%' }}>
                                {isLoading ? '...' : 'Tandai Selesai'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── BUKTI MODAL ── */}
        {buktiModal && (
          <div className="du-modal-overlay" onClick={() => this.setState({ buktiModal: null })} style={{ zIndex: 1000 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 20, maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Bukti Pembayaran</div>
                <button onClick={() => this.setState({ buktiModal: null })} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>✕</button>
              </div>
              <img src={buktiModal} alt="Bukti Pembayaran" style={{ maxWidth: '80vw', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }} />
              <a href={buktiModal} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#006B3F', fontWeight: 600 }}>
                Buka di tab baru ↗
              </a>
            </div>
          </div>
        )}

        {/* ── TOLAK MODAL ── */}
        {tolakModal && (
          <div className="du-modal-overlay" onClick={this.closeTolak}>
            <div className="du-modal" onClick={e => e.stopPropagation()}>
              <div className="du-modal-header">
                <div className="du-modal-title">Tolak Pesanan</div>
                <button className="du-modal-close" onClick={this.closeTolak}>✕</button>
              </div>
              <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 16 }}>
                Pesanan #{tolakModal.pesanan_id?.slice(0, 8).toUpperCase()} akan ditolak.
              </p>
              <div className="du-field">
                <label>Alasan Penolakan</label>
                <textarea
                  value={catatanTolak}
                  onChange={e => this.setState({ catatanTolak: e.target.value })}
                  placeholder="Jelaskan alasan penolakan..."
                  rows={3}
                />
              </div>
              <div className="du-modal-actions">
                <button className="du-btn outline" onClick={this.closeTolak}>Batal</button>
                <button className="du-btn" style={{ background: '#ef4444', color: '#fff' }} onClick={this.handleTolak}>
                  Konfirmasi Tolak
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default PesananMasukPage;
