import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { securityAPI } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';
import './SecurityDashboard.css';

const PER_PAGE = 20;

const fmtTime = (s) => {
  if (!s) return '-';
  return new Date(s).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

const STATUS_COLOR = (code) => {
  if (code >= 200 && code < 300) return 'green';
  if (code === 401 || code === 403) return 'red';
  if (code >= 400) return 'yellow';
  if (code >= 500) return 'orange';
  return 'gray';
};

const METHOD_COLOR = {
  GET: '#3b82f6', POST: '#22c55e', PUT: '#f59e0b',
  DELETE: '#ef4444', PATCH: '#8b5cf6',
};

const METHOD_OPTS = ['', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const STATUS_OPTS = [
  { label: 'Semua Status', value: '' },
  { label: '200 OK', value: 200 },
  { label: '201 Created', value: 201 },
  { label: '401 Unauthorized', value: 401 },
  { label: '403 Forbidden', value: 403 },
  { label: '404 Not Found', value: 404 },
  { label: '422 Unprocessable', value: 422 },
  { label: '500 Server Error', value: 500 },
];

class AuditLogPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = {
      user,
      logs: [],
      total: 0,
      loading: true,
      error: null,
      page: 1,
      filterMethod: '',
      filterStatus: '',
      filterEndpoint: '',
    };
  }

  componentDidMount() {
    if (!this.state.user || this.state.user.role !== 'admin') return;
    this.fetchLogs();
  }

  fetchLogs = async () => {
    const { page, filterMethod, filterStatus, filterEndpoint } = this.state;
    this.setState({ loading: true, error: null });
    try {
      const params = { page, page_size: PER_PAGE };
      if (filterMethod) params.method = filterMethod;
      if (filterStatus) params.status_code = filterStatus;
      if (filterEndpoint) params.endpoint = filterEndpoint;
      const res = await securityAPI.getAuditLogs(params);
      this.setState({ logs: res.data.items || [], total: res.data.total || 0 });
    } catch {
      this.setState({ error: 'Gagal memuat audit log.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleFilter = () => {
    this.setState({ page: 1 }, this.fetchLogs);
  };

  handleReset = () => {
    this.setState({ filterMethod: '', filterStatus: '', filterEndpoint: '', page: 1 }, this.fetchLogs);
  };

  setPage = (p) => {
    this.setState({ page: p }, this.fetchLogs);
  };

  render() {
    const { user, logs, total, loading, error, page,
            filterMethod, filterStatus, filterEndpoint } = this.state;

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;

    const totalPages = Math.ceil(total / PER_PAGE);

    return (
      <div className="da-wrapper">
        <AdminSidebar activePath="/dashboard/admin/security" />

        <div className="da-content">
          <header className="da-topbar">
            <div className="da-topbar-title">Audit Log</div>
            <div className="da-topbar-right">
              <Link to="/dashboard/admin/security" className="da-btn outline sm">
                ← Kembali ke Security Dashboard
              </Link>
              <div className="da-topbar-avatar">{user.nama?.charAt(0).toUpperCase()}</div>
            </div>
          </header>

          <div className="da-body">
            <div style={{ marginBottom: 20 }}>
              <div className="da-page-title">Audit Log Lengkap</div>
              <div className="da-page-sub">
                Catatan lengkap seluruh aktivitas API — {total.toLocaleString()} entri tersimpan
              </div>
            </div>

            {/* ── FILTER BAR ── */}
            <div className="sec-filter-row">
              <div className="da-select-wrap">
                <select
                  className="da-select"
                  value={filterMethod}
                  onChange={(e) => this.setState({ filterMethod: e.target.value })}
                >
                  <option value="">Semua Method</option>
                  {METHOD_OPTS.filter(m => m).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <span className="da-select-arrow">▾</span>
              </div>

              <div className="da-select-wrap">
                <select
                  className="da-select"
                  value={filterStatus}
                  onChange={(e) => this.setState({ filterStatus: e.target.value })}
                >
                  {STATUS_OPTS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <span className="da-select-arrow">▾</span>
              </div>

              <input
                className="sec-input"
                placeholder="Filter endpoint (mis: /api/auth)"
                value={filterEndpoint}
                onChange={(e) => this.setState({ filterEndpoint: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && this.handleFilter()}
                style={{ minWidth: 220 }}
              />

              <button className="da-btn primary sm" onClick={this.handleFilter}>
                🔍 Filter
              </button>
              <button className="da-btn outline sm" onClick={this.handleReset}>
                Reset
              </button>
            </div>

            {/* ── TABLE ── */}
            <div className="da-table-card">
              {loading ? (
                <div className="da-loading"><div className="da-spinner" /> Memuat log...</div>
              ) : error ? (
                <div className="sec-alert-error" style={{ margin: 20 }}>{error}</div>
              ) : logs.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                  Tidak ada log yang cocok dengan filter.
                </div>
              ) : (
                <>
                  <table className="da-table">
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>User</th>
                        <th>Peran</th>
                        <th>Method</th>
                        <th>Endpoint</th>
                        <th>Status</th>
                        <th>IP Address</th>
                        <th>Durasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>
                            {fmtTime(log.created_at)}
                          </td>
                          <td>
                            {log.user_nama ? (
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{log.user_nama}</div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>{log.user_email}</div>
                              </div>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                            )}
                          </td>
                          <td>
                            {log.user_role ? (
                              <span className={`da-badge ${log.user_role}`}>{log.user_role}</span>
                            ) : (
                              <span className="da-badge gray">anon</span>
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
                          <td style={{ fontFamily: 'monospace', fontSize: 12, maxWidth: 280 }}>
                            <span title={log.endpoint}>
                              {log.endpoint.length > 40 ? log.endpoint.slice(0, 40) + '…' : log.endpoint}
                            </span>
                          </td>
                          <td>
                            <span className={`da-badge ${STATUS_COLOR(log.status_code)}`}>
                              {log.status_code}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: '#6b7280' }}>{log.ip_address || '-'}</td>
                          <td style={{ fontSize: 12, color: '#6b7280' }}>
                            {log.duration_ms != null ? `${log.duration_ms} ms` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* ── PAGINATION ── */}
                  <div className="da-pagination">
                    <span>
                      Menampilkan {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, total)} dari{' '}
                      {total.toLocaleString()} entri
                    </span>
                    <div className="da-page-btns">
                      <button
                        className="da-page-btn"
                        disabled={page <= 1}
                        onClick={() => this.setPage(page - 1)}
                      >‹</button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        return (
                          <button
                            key={p}
                            className={`da-page-btn ${p === page ? 'active' : ''}`}
                            onClick={() => this.setPage(p)}
                          >{p}</button>
                        );
                      })}
                      <button
                        className="da-page-btn"
                        disabled={page >= totalPages}
                        onClick={() => this.setPage(page + 1)}
                      >›</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AuditLogPage;
