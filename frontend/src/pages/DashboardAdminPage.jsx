import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { adminAPI, umkmAPI } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';

const formatRp = (n) => {
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1) + ' Jt';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
};

const ROLE_DOT = { mahasiswa: 'green', umkm: 'orange', admin: 'red' };

class DashboardAdminPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = { user, stats: null, umkmList: [], userList: [], loading: true };
  }

  componentDidMount() {
    if (!this.state.user || this.state.user.role !== 'admin') return;
    this.fetchStats();
  }

  fetchStats = async () => {
    try {
      const [statsRes, umkmRes, userRes] = await Promise.allSettled([
        adminAPI.stats(),
        umkmAPI.list({ per_page: 5, page: 1 }),
        adminAPI.listUsers({ per_page: 4, page: 1 }),
      ]);
      this.setState({
        stats: statsRes.status === 'fulfilled' ? statsRes.value.data : null,
        umkmList: umkmRes.status === 'fulfilled' ? (umkmRes.value.data.data || []) : [],
        userList: userRes.status === 'fulfilled' ? (userRes.value.data || []) : [],
      });
    } catch { /* silently ignore */ }
    finally { this.setState({ loading: false }); }
  };

  render() {
    const { user, stats, umkmList, userList, loading } = this.state;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;

    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
      <div className="da-wrapper">
        <AdminSidebar activePath="/dashboard/admin" />

        <div className="da-content">
          <header className="da-topbar">
            <div className="da-topbar-title">Admin Console</div>
            <div className="da-topbar-right">
              <div className="da-search">
                <span className="da-search-icon">🔍</span>
                <input placeholder="Search..." />
              </div>
              <span className="da-topbar-icon">🔔</span>
              <span className="da-topbar-icon">❓</span>
              <div className="da-topbar-avatar">{user.nama?.charAt(0).toUpperCase()}</div>
            </div>
          </header>

          <div className="da-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div className="da-page-title">Dashboard Admin</div>
                <div className="da-page-sub">Welcome back, {user.nama?.split(' ')[0]}. Here's your platform overview for today.</div>
              </div>
              <div className="da-date-chip">📅 {today}</div>
            </div>

            {loading ? (
              <div className="da-loading"><div className="da-spinner" /> Memuat data...</div>
            ) : (
              <>
                {/* ── STATS ── */}
                <div className="da-stats-grid">
                  <div className="da-stat-card">
                    <div className="da-stat-label">👥 Total Mahasiswa</div>
                    <div className="da-stat-val">{stats?.total_mahasiswa?.toLocaleString() || '0'}</div>
                    <div className="da-stat-sub">pengguna terdaftar</div>
                  </div>
                  <div className="da-stat-card">
                    <div className="da-stat-label">🏪 Total UMKM</div>
                    <div className="da-stat-val">{stats?.total_umkm?.toLocaleString() || '0'}</div>
                    <div className="da-stat-sub">mitra aktif</div>
                  </div>
                  <div className="da-stat-card">
                    <div className="da-stat-label">📦 Transaksi Hari Ini</div>
                    <div className="da-stat-val">{stats?.pesanan_hari_ini || '0'}</div>
                    <div className="da-stat-sub">pesanan masuk</div>
                  </div>
                  <div className="da-stat-card">
                    <div className="da-stat-label">💰 Total Pendapatan</div>
                    <div className="da-stat-val">{formatRp(stats?.total_pendapatan || 0)}</div>
                    <div className="da-stat-sub">kumulatif</div>
                  </div>
                  <div className="da-stat-card">
                    <div className="da-stat-label">⏳ UMKM Pending</div>
                    <div className="da-stat-val" style={{ color: '#ef4444' }}>
                      {stats?.umkm_pending || 0}
                    </div>
                    <span className="da-stat-badge red">Action Needed</span>
                  </div>
                </div>

                {/* ── CONTENT ── */}
                <div className="da-two-col">
                  {/* UMKM Table */}
                  <div className="da-table-card">
                    <div className="da-table-header">
                      <div className="da-table-title">UMKM Terdaftar Terbaru</div>
                      <Link to="/dashboard/admin" className="da-see-all">Lihat Semua →</Link>
                    </div>
                    <table className="da-table">
                      <thead>
                        <tr>
                          <th>Nama UMKM</th>
                          <th>Pemilik</th>
                          <th>Kategori</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {umkmList.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>
                              Belum ada UMKM terdaftar.
                            </td>
                          </tr>
                        ) : (
                          umkmList.map((u) => (
                            <tr key={u.umkm_id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eaf5ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏪</div>
                                  {u.nama_umkm}
                                </div>
                              </td>
                              <td>{u.nama_pemilik || '—'}</td>
                              <td>{u.kategori || '—'}</td>
                              <td>
                                <span className={`da-stat-badge ${u.status_operasional === 'buka' ? 'green' : 'red'}`}>
                                  {u.status_operasional === 'buka' ? 'Buka' : 'Tutup'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Activity Feed */}
                  <div className="da-activity-card">
                    <div className="da-table-header" style={{ padding: '0 0 14px', marginBottom: 10, borderBottom: '1px solid #f3f4f6' }}>
                      <div className="da-table-title">Pengguna Terdaftar Terbaru</div>
                    </div>
                    {userList.length === 0 ? (
                      <div style={{ color: '#9ca3af', fontSize: 13, padding: '12px 0' }}>Belum ada pengguna terdaftar.</div>
                    ) : (
                      userList.map((u) => (
                        <div key={u.user_id} className="da-activity-item">
                          <div className={`da-activity-dot ${ROLE_DOT[u.role] || 'green'}`} />
                          <div>
                            <div className="da-activity-text">
                              {u.nama} mendaftar sebagai <strong>{u.role}</strong>
                            </div>
                            <div className="da-activity-time">
                              {u.tanggal_daftar
                                ? new Date(u.tanggal_daftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '—'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Stats Transaksi Chart placeholder */}
                <div className="da-table-card" style={{ marginTop: 0 }}>
                  <div className="da-table-header">
                    <div className="da-table-title">Statistik Transaksi Bulanan</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="da-btn outline sm">This Month</button>
                    </div>
                  </div>
                  <div style={{ padding: '24px 20px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14, minHeight: 120 }}>
                    {stats?.total_pesanan > 0
                      ? `${stats.total_pesanan} total pesanan tercatat.`
                      : 'Belum ada transaksi.'}
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

export default DashboardAdminPage;
