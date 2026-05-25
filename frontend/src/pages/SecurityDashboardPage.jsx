
import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { securityAPI } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';
import './SecurityDashboard.css';

const fmtTime = (s) => {
  if (!s) return '-';
  return new Date(s).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

const STATUS_COLOR = (code) => {
  if (code >= 200 && code < 300) return 'green';
  if (code >= 400 && code < 500) return 'red';
  if (code >= 500) return 'orange';
  return 'gray';
};

const METHOD_COLOR = {
  GET: '#3b82f6', POST: '#22c55e', PUT: '#f59e0b',
  DELETE: '#ef4444', PATCH: '#8b5cf6',
};

class SecurityDashboardPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = { user, stats: null, recentLogs: [], loading: true, error: null };
  }

  componentDidMount() {
    if (!this.state.user || this.state.user.role !== 'admin') return;
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const [statsRes, logsRes] = await Promise.all([
        securityAPI.getStats(),
        securityAPI.getAuditLogs({ page: 1, page_size: 8 }),
      ]);
      this.setState({ stats: statsRes.data, recentLogs: logsRes.data.items || [] });
    } catch (err) {
      this.setState({ error: 'Gagal memuat data keamanan. Pastikan server berjalan.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { user, stats, recentLogs, loading, error } = this.state;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;

    const today = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const auth = stats?.auth;
    const authz = stats?.authz;
    const acct = stats?.accounting;
    const roles = stats?.role_distribution;

    const totalUsers = (roles?.mahasiswa || 0) + (roles?.umkm || 0) + (roles?.admin || 0);
    const rolePct = (n) => totalUsers > 0 ? Math.round((n / totalUsers) * 100) : 0;

    return (
      <div className="da-wrapper">
        <AdminSidebar activePath="/dashboard/admin/security" />

        <div className="da-content">
          {/* ── TOPBAR ── */}
          <header className="da-topbar">
            <div className="da-topbar-title">Security Console</div>
            <div className="da-topbar-right">
              <span className="sec-shield-icon">🛡️</span>
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Modul Keamanan AAA</span>
              <div className="da-topbar-avatar">{user.nama?.charAt(0).toUpperCase()}</div>
            </div>
          </header>

          <div className="da-body">
            {/* ── PAGE HEADER ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div className="da-page-title">Dashboard Keamanan (AAA)</div>
                <div className="da-page-sub">
                  Monitoring Authentication • Authorization • Accounting — {today}
                </div>
              </div>
              <button className="da-btn outline sm" onClick={this.fetchData}>
                ↻ Refresh
              </button>
            </div>

            {loading && (
              <div className="da-loading"><div className="da-spinner" /> Memuat data keamanan...</div>
            )}

            {error && (
              <div className="sec-alert-error">{error}</div>
            )}

            {!loading && !error && stats && (
              <>
                {/* ══════════════════════════════════
                    AUTHENTICATION
                ══════════════════════════════════ */}
                <div className="sec-section-header">
                  <span className="sec-section-icon auth">🔐</span>
                  <div>
                    <div className="sec-section-title">Authentication</div>
                    <div className="sec-section-sub">Verifikasi identitas pengguna melalui JWT + bcrypt</div>
                  </div>
                </div>

                <div className="da-stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 12 }}>
                  <div className="da-stat-card">
                    <div className="da-stat-label">🔑 Total Percobaan Login</div>
                    <div className="da-stat-val">{auth?.total_login_attempts?.toLocaleString() || '0'}</div>
                    <div className="da-stat-sub">sejak server berjalan</div>
                  </div>
                  <div className="da-stat-card">
                    <div className="da-stat-label">✅ Login Berhasil</div>
                    <div className="da-stat-val" style={{ color: '#16a34a' }}>{auth?.successful_logins?.toLocaleString() || '0'}</div>
                    <div className="da-stat-sub">autentikasi sukses</div>
                  </div>
                  <div className="da-stat-card">
                    <div className="da-stat-label">❌ Login Gagal</div>
                    <div className="da-stat-val" style={{ color: '#dc2626' }}>{auth?.failed_logins?.toLocaleString() || '0'}</div>
                    <div className="da-stat-sub">kredensial salah / ditolak</div>
                  </div>
                </div>

                {/* Success Rate Bar */}
                <div className="sec-rate-card">
                  <div className="sec-rate-row">
                    <span className="sec-rate-label">Tingkat Keberhasilan Login</span>
                    <span className="sec-rate-value" style={{ color: auth?.success_rate >= 80 ? '#16a34a' : '#dc2626' }}>
                      {auth?.success_rate || 0}%
                    </span>
                  </div>
                  <div className="sec-rate-bar-bg">
                    <div
                      className="sec-rate-bar-fill"
                      style={{
                        width: `${auth?.success_rate || 0}%`,
                        background: auth?.success_rate >= 80 ? '#22c55e' : '#ef4444',
                      }}
                    />
                  </div>
                  <div className="sec-rate-row" style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      Hari ini: <strong>{auth?.logins_today || 0}</strong> berhasil,{' '}
                      <strong style={{ color: '#dc2626' }}>{auth?.failed_today || 0}</strong> gagal
                    </span>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      Algoritma: HS256 · Token: JWT · Hash: bcrypt
                    </span>
                  </div>
                </div>

                {/* ══════════════════════════════════
                    AUTHORIZATION
                ══════════════════════════════════ */}
                <div className="sec-section-header" style={{ marginTop: 28 }}>
                  <span className="sec-section-icon authz">🛡️</span>
                  <div>
                    <div className="sec-section-title">Authorization</div>
                    <div className="sec-section-sub">Kontrol akses berbasis peran (RBAC): mahasiswa · umkm · admin</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 8 }}>
                  {/* Authz Stats */}
                  <div className="da-stats-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
                    <div className="da-stat-card">
                      <div className="da-stat-label">📡 Request Hari Ini</div>
                      <div className="da-stat-val">{authz?.total_requests_today?.toLocaleString() || '0'}</div>
                      <div className="da-stat-sub">total panggilan API</div>
                    </div>
                    <div className="da-stat-card">
                      <div className="da-stat-label">🚫 Akses Ditolak</div>
                      <div className="da-stat-val" style={{ color: '#dc2626' }}>{authz?.access_denied_today || '0'}</div>
                      <span className="da-stat-badge red">{authz?.access_denied_today > 0 ? 'Perlu Perhatian' : 'Aman'}</span>
                    </div>
                    <div className="da-stat-card">
                      <div className="da-stat-label">👤 Pengguna Aktif Hari Ini</div>
                      <div className="da-stat-val">{authz?.active_users_today || '0'}</div>
                      <div className="da-stat-sub">sesi terautentikasi</div>
                    </div>
                    <div className="da-stat-card">
                      <div className="da-stat-label">📊 Total Request</div>
                      <div className="da-stat-val">{authz?.total_requests_all?.toLocaleString() || '0'}</div>
                      <div className="da-stat-sub">kumulatif semua waktu</div>
                    </div>
                  </div>

                  {/* Role Distribution */}
                  <div className="da-table-card" style={{ padding: '18px 22px' }}>
                    <div className="da-table-title" style={{ marginBottom: 16 }}>Distribusi Peran (Role)</div>
                    <div className="sec-role-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="da-badge mahasiswa">Mahasiswa</span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {roles?.mahasiswa || 0}
                          <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280', marginLeft: 4 }}>
                            ({rolePct(roles?.mahasiswa || 0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="sec-role-bar-bg">
                        <div className="sec-role-bar-fill blue" style={{ width: `${rolePct(roles?.mahasiswa || 0)}%` }} />
                      </div>
                    </div>
                    <div className="sec-role-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="da-badge umkm">UMKM</span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {roles?.umkm || 0}
                          <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280', marginLeft: 4 }}>
                            ({rolePct(roles?.umkm || 0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="sec-role-bar-bg">
                        <div className="sec-role-bar-fill yellow" style={{ width: `${rolePct(roles?.umkm || 0)}%` }} />
                      </div>
                    </div>
                    <div className="sec-role-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="da-badge admin">Admin</span>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                          {roles?.admin || 0}
                          <span style={{ fontSize: 12, fontWeight: 400, color: '#6b7280', marginLeft: 4 }}>
                            ({rolePct(roles?.admin || 0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="sec-role-bar-bg">
                        <div className="sec-role-bar-fill purple" style={{ width: `${rolePct(roles?.admin || 0)}%` }} />
                      </div>
                    </div>
                    <div style={{ marginTop: 16, padding: '10px 0', borderTop: '1px solid #f3f4f6' }}>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Total Pengguna Terdaftar</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{totalUsers}</div>
                    </div>
                  </div>
                </div>

                {/* ══════════════════════════════════
                    ACCOUNTING / AUDIT LOG
                ══════════════════════════════════ */}
                <div className="sec-section-header" style={{ marginTop: 28 }}>
                  <span className="sec-section-icon acct">📋</span>
                  <div>
                    <div className="sec-section-title">Accounting (Audit Log)</div>
                    <div className="sec-section-sub">Pencatatan setiap aktivitas API secara otomatis</div>
                  </div>
                </div>

                <div className="da-stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
                  <div className="da-stat-card">
                    <div className="da-stat-label">📝 Total Entri Log</div>
                    <div className="da-stat-val">{acct?.total_logs?.toLocaleString() || '0'}</div>
                    <div className="da-stat-sub">semua aktivitas tercatat</div>
                  </div>
                  <div className="da-stat-card">
                    <div className="da-stat-label">📅 Log Hari Ini</div>
                    <div className="da-stat-val">{acct?.logs_today?.toLocaleString() || '0'}</div>
                    <div className="da-stat-sub">aktivitas 24 jam terakhir</div>
                  </div>
                  <div className="da-stat-card">
                    <div className="da-stat-label">📆 Log Minggu Ini</div>
                    <div className="da-stat-val">{acct?.logs_this_week?.toLocaleString() || '0'}</div>
                    <div className="da-stat-sub">sejak Senin minggu ini</div>
                  </div>
                </div>

                {/* Recent Audit Log Table */}
                <div className="da-table-card">
                  <div className="da-table-header">
                    <div className="da-table-title">Audit Log Terbaru</div>
                    <Link to="/dashboard/admin/security/logs" className="da-see-all">
                      Lihat Semua →
                    </Link>
                  </div>

                  {recentLogs.length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                      Belum ada log. Log akan muncul setelah ada aktivitas API.
                    </div>
                  ) : (
                    <table className="da-table">
                      <thead>
                        <tr>
                          <th>Waktu</th>
                          <th>User</th>
                          <th>Method</th>
                          <th>Endpoint</th>
                          <th>Status</th>
                          <th>Durasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentLogs.map((log) => (
                          <tr key={log.id}>
                            <td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                              {fmtTime(log.created_at)}
                            </td>
                            <td>
                              {log.user_nama ? (
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{log.user_nama}</div>
                                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{log.user_role}</div>
                                </div>
                              ) : (
                                <span style={{ color: '#9ca3af', fontSize: 12 }}>Anonymous</span>
                              )}
                            </td>
                            <td>
                              <span
                                className="sec-method-badge"
                                style={{ background: METHOD_COLOR[log.method] || '#6b7280' }}
                              >
                                {log.method}
                              </span>
                            </td>
                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.endpoint}</td>
                            <td>
                              <span className={`da-badge ${STATUS_COLOR(log.status_code)}`}>
                                {log.status_code}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: '#6b7280' }}>
                              {log.duration_ms != null ? `${log.duration_ms} ms` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {!loading && !error && !stats && (
              <div className="sec-alert-info">
                Data statistik belum tersedia. Pastikan backend berjalan dengan{' '}
                <code>uvicorn main:app --reload</code> di folder <code>backend/</code>.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default SecurityDashboardPage;
