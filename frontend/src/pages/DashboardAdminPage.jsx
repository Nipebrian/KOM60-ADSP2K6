import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';

const formatRp = (n) => {
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1) + ' Jt';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
};

const ACTIVITIES = [
  { dot: 'green',  text: 'UMKM Baru: Dapur Fakultas mendaftar sebagai merchant.', time: '10 menit lalu • by System Admin' },
  { dot: 'blue',   text: 'Pembayaran Masuk: Rp 3.2k dikeluarkan ke 12 UMKM.', time: '2 hours ago • Automated' },
  { dot: 'orange', text: 'Laporan Masuk: Pesanan lambat di area kampus Putra.', time: '3 hours ago • from User App' },
  { dot: 'red',    text: 'Pendaftaran Mahasiswa: 50+ pengguna baru mendaftar.', time: 'Yesterday' },
];

class DashboardAdminPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = { user, stats: null, loading: true };
  }

  componentDidMount() {
    if (!this.state.user || this.state.user.role !== 'admin') return;
    this.fetchStats();
  }

  fetchStats = async () => {
    try {
      const res = await adminAPI.stats();
      this.setState({ stats: res.data });
    } catch { /* silently ignore */ }
    finally { this.setState({ loading: false }); }
  };

  render() {
    const { user, stats, loading } = this.state;
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
                      <div className="da-table-title">UMKM Menunggu Persetujuan</div>
                      <Link to="/dashboard/admin/umkm" className="da-see-all">Lihat Semua →</Link>
                    </div>
                    <table className="da-table">
                      <thead>
                        <tr>
                          <th>UMKM Name</th>
                          <th>Owner</th>
                          <th>Date Applied</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eaf5ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🍛</div>
                              Warung Nasi IPB
                            </div>
                          </td>
                          <td>Budi Santoso</td>
                          <td>Oct 24, 2023</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="da-btn primary sm">✓</button>
                              <button className="da-btn danger sm">✕</button>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eaf5ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>☕</div>
                              Kopi Rektorat
                            </div>
                          </td>
                          <td>Siti Aminah</td>
                          <td>Oct 23, 2023</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="da-btn primary sm">✓</button>
                              <button className="da-btn danger sm">✕</button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Activity Feed */}
                  <div className="da-activity-card">
                    <div className="da-table-header" style={{ padding: '0 0 14px', marginBottom: 10, borderBottom: '1px solid #f3f4f6' }}>
                      <div className="da-table-title">Aktivitas Terbaru</div>
                    </div>
                    {ACTIVITIES.map((a, i) => (
                      <div key={i} className="da-activity-item">
                        <div className={`da-activity-dot ${a.dot}`} />
                        <div>
                          <div className="da-activity-text">{a.text}</div>
                          <div className="da-activity-time">{a.time}</div>
                        </div>
                      </div>
                    ))}
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
