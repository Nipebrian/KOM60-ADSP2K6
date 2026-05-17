import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { pesananAPI, ratingAPI, umkmAPI } from '../services/api';
import UMKMSidebar from '../components/UMKMSidebar';
import './DashboardUMKM.css';

const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const formatDate = (s) => {
  if (!s) return '-';
  const d = new Date(s);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const STATUS_BADGE = {
  menunggu_pembayaran: { label: 'Menunggu Bayar', cls: 'orange' },
  menunggu_validasi:   { label: 'Menunggu Validasi', cls: 'yellow' },
  diproses:            { label: 'Diproses', cls: 'blue' },
  siap_diambil:        { label: 'Siap Diambil', cls: 'green' },
  selesai:             { label: 'Selesai', cls: 'gray' },
  ditolak:             { label: 'Ditolak', cls: 'red' },
};

class DashboardUMKMPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = {
      user,
      toko: null,
      pesananList: [],
      ulasanList: [],
      loading: true,
    };
  }

  componentDidMount() {
    if (!this.state.user || this.state.user.role !== 'umkm') return;
    this.fetchAll();
  }

  fetchAll = async () => {
    try {
      const [tokoRes, pesananRes] = await Promise.all([
        umkmAPI.getMyToko(),
        pesananAPI.getMasuk({ per_page: 5 }),
      ]);
      const toko = tokoRes.data;
      this.setState({ toko });

      let ulasanList = [];
      if (toko?.umkm_id) {
        try {
          const ulasanRes = await ratingAPI.listByUmkm(toko.umkm_id, { per_page: 3 });
          ulasanList = ulasanRes.data?.data || ulasanRes.data || [];
        } catch { /* no ratings yet */ }
      }

      this.setState({ pesananList: pesananRes.data?.data || pesananRes.data || [], ulasanList });
    } catch { /* silently ignore */ }
    finally { this.setState({ loading: false }); }
  };

  render() {
    const { user, toko, pesananList, ulasanList, loading } = this.state;

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'umkm') return <Navigate to="/" replace />;

    const pesananHariIni = pesananList.filter(p => {
      if (!p.created_at) return false;
      const d = new Date(p.created_at);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length;

    return (
      <div className="du-wrapper">
        <UMKMSidebar activePath="/dashboard/umkm" namaUmkm={toko?.nama_umkm} />

        <div className="du-content">
          {/* ── TOPBAR ── */}
          <header className="du-topbar">
            <div className="du-topbar-title">Dashboard</div>
            <div className="du-topbar-right">
              <span className="du-topbar-icon">🔍</span>
              <span className="du-topbar-icon">🔔</span>
              <span className="du-topbar-icon">📅</span>
              <div className="du-topbar-user">
                <div>
                  <div className="du-topbar-greeting">Halo, {user.nama?.split(' ')[0]}!</div>
                  <div className="du-topbar-sub">{toko?.nama_umkm || 'UMKM Saya'}</div>
                </div>
                <div className="du-topbar-avatar">{user.nama?.charAt(0).toUpperCase()}</div>
              </div>
            </div>
          </header>

          <div className="du-body">
            {loading ? (
              <div className="du-loading"><div className="du-spinner" /> Memuat dashboard...</div>
            ) : (
              <>
                {/* ── STATS ── */}
                <div className="du-stats-grid">
                  <div className="du-stat-card">
                    <div>
                      <div className="du-stat-label">Pesanan Hari Ini</div>
                      <div className="du-stat-val">{pesananHariIni}</div>
                      <div className="du-stat-delta">+2 dari kemarin</div>
                    </div>
                    <div className="du-stat-icon orange">📦</div>
                  </div>
                  <div className="du-stat-card">
                    <div>
                      <div className="du-stat-label">Pendapatan Hari Ini</div>
                      <div className="du-stat-val">
                        {formatRp(pesananList.filter(p => {
                          if (!p.created_at) return false;
                          const d = new Date(p.created_at);
                          return d.toDateString() === new Date().toDateString() && p.status_pesanan === 'selesai';
                        }).reduce((s, p) => s + (p.total_harga || 0), 0))}
                      </div>
                      <div className="du-stat-delta">+15% dari kemarin</div>
                    </div>
                    <div className="du-stat-icon green">💰</div>
                  </div>
                  <div className="du-stat-card">
                    <div>
                      <div className="du-stat-label">Rating</div>
                      <div className="du-stat-val">{toko?.rating_rata_rata?.toFixed(1) || '—'}</div>
                      <div className="du-stat-delta">{ulasanList.length} ulasan</div>
                    </div>
                    <div className="du-stat-icon yellow">⭐</div>
                  </div>
                  <div className="du-stat-card">
                    <div>
                      <div className="du-stat-label">Menu Aktif</div>
                      <div className="du-stat-val">—</div>
                      <div className="du-stat-delta">dari total menu</div>
                    </div>
                    <div className="du-stat-icon blue">🍽️</div>
                  </div>
                </div>

                {/* ── MAIN CONTENT ── */}
                <div className="du-two-col">
                  {/* Pesanan Terbaru */}
                  <div className="du-table-card">
                    <div className="du-table-header">
                      <div className="du-table-title">Pesanan Terbaru</div>
                      <Link to="/dashboard/umkm/pesanan" className="du-see-all">Lihat Semua →</Link>
                    </div>
                    {pesananList.length === 0 ? (
                      <div style={{ padding: 28, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                        Belum ada pesanan masuk.
                      </div>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>ORDER ID</th>
                            <th>CUSTOMER</th>
                            <th>ITEMS</th>
                            <th>TOTAL</th>
                            <th>STATUS</th>
                            <th>ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pesananList.slice(0, 5).map(p => {
                            const badge = STATUS_BADGE[p.status_pesanan] || { label: p.status_pesanan, cls: 'gray' };
                            const items = p.detail_list?.map(d => `${d.nama_menu} x${d.jumlah}`).join(', ') || '—';
                            return (
                              <tr key={p.pesanan_id}>
                                <td style={{ fontWeight: 600, color: '#006B3F' }}>#{p.pesanan_id?.slice(0,6).toUpperCase()}</td>
                                <td>{p.nama_mahasiswa || '—'}</td>
                                <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{items}</td>
                                <td style={{ fontWeight: 600 }}>{formatRp(p.total_harga)}</td>
                                <td><span className={`du-badge ${badge.cls}`}>{badge.label}</span></td>
                                <td>
                                  <Link to="/dashboard/umkm/pesanan" className="du-btn primary sm">Detail</Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Ulasan Terbaru */}
                  <div className="du-review-card">
                    <div className="du-table-header" style={{ padding: '0 0 14px' }}>
                      <div className="du-table-title">Ulasan Terbaru</div>
                    </div>
                    {ulasanList.length === 0 ? (
                      <div style={{ color: '#6b7280', fontSize: 14, padding: '12px 0' }}>Belum ada ulasan.</div>
                    ) : (
                      ulasanList.map(u => (
                        <div key={u.rating_id} className="du-review-item">
                          <div className="du-review-header">
                            <div className="du-reviewer-name">{u.nama_pengguna || 'Mahasiswa'}</div>
                            <div className="du-review-stars">{'★'.repeat(u.nilai)}{'☆'.repeat(5 - u.nilai)}</div>
                          </div>
                          <div className="du-review-text">{u.komentar || '-'}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default DashboardUMKMPage;
