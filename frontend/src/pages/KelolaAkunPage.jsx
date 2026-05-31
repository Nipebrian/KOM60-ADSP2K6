import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';

const formatDate = (s) => {
  if (!s) return '-';
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ROLE_OPTS = ['Semua Role', 'mahasiswa', 'umkm', 'admin'];
const STATUS_OPTS = ['Semua Status', 'aktif', 'suspended'];
const PER_PAGE = 10;

class KelolaAkunPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = {
      user,
      users: [],
      loading: true,
      search: '',
      filterRole: '',
      filterStatus: '',
      page: 1,
      total: 0,
      confirmModal: null,
    };
  }

  componentDidMount() {
    if (!this.state.user || this.state.user.role !== 'admin') return;
    this.fetchUsers();
  }

  fetchUsers = async () => {
    const { search, filterRole, filterStatus, page } = this.state;
    this.setState({ loading: true });
    try {
      const params = { page, per_page: PER_PAGE };
      if (search) params.search = search;
      if (filterRole) params.role = filterRole;
      if (filterStatus) params.status = filterStatus;
      const res = await adminAPI.listUsers(params);
      const data = res.data;
      this.setState({
        users: data?.data || data || [],
        total: data?.total || (data?.length ?? 0),
      });
    } catch { this.setState({ users: [] }); }
    finally { this.setState({ loading: false }); }
  };

  handleSearch = (e) => {
    this.setState({ search: e.target.value, page: 1 }, () => {
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this.fetchUsers(), 400);
    });
  };

  handleFilter = (field, val) => {
    const v = val === 'Semua Role' || val === 'Semua Status' ? '' : val;
    this.setState({ [field]: v, page: 1 }, this.fetchUsers);
  };

  handleSuspend = async (u) => {
    const newStatus = u.status === 'aktif' ? 'suspended' : 'aktif';
    try {
      await adminAPI.updateUserStatus(u.user_id, newStatus);
      this.setState({ confirmModal: null });
      await this.fetchUsers();
    } catch { alert('Gagal update status user.'); }
  };

  handleDelete = async (u) => {
    try {
      await adminAPI.deleteUser(u.user_id);
      this.setState({ confirmModal: null });
      await this.fetchUsers();
    } catch { alert('Gagal menghapus user.'); }
  };

  openConfirm = (user, action) => this.setState({ confirmModal: { user, action } });
  closeConfirm = () => this.setState({ confirmModal: null });

  getInitials = (nama = '') => nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  render() {
    const { user, users, loading, search, filterRole, filterStatus, page, total, confirmModal } = this.state;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/" replace />;

    const totalPages = Math.ceil(total / PER_PAGE) || 1;

    return (
      <div className="da-wrapper">
        <AdminSidebar activePath="/dashboard/admin/users" />

        <div className="da-content">
          <header className="da-topbar">
            <div className="da-topbar-title">Kelola Akun Pengguna</div>
            <div className="da-topbar-right">
              <span className="da-topbar-icon">🔔</span>
              <span className="da-topbar-icon">⚙️</span>
              <span className="da-topbar-icon">❓</span>
              <div className="da-topbar-avatar">{user.nama?.charAt(0).toUpperCase()}</div>
            </div>
          </header>

          <div className="da-body">
            {/* Filter bar */}
            <div className="da-filter-bar">
              <div className="da-search" style={{ flex: 1, maxWidth: 320 }}>
                <span className="da-search-icon">🔍</span>
                <input
                  value={search}
                  onChange={this.handleSearch}
                  placeholder="Cari nama, email..."
                  style={{ width: '100%' }}
                />
              </div>
              <div className="da-select-wrap">
                <select
                  className="da-select"
                  value={filterRole || 'Semua Role'}
                  onChange={e => this.handleFilter('filterRole', e.target.value)}
                >
                  {ROLE_OPTS.map(r => <option key={r}>{r}</option>)}
                </select>
                <span className="da-select-arrow">▾</span>
              </div>
              <div className="da-select-wrap">
                <select
                  className="da-select"
                  value={filterStatus || 'Semua Status'}
                  onChange={e => this.handleFilter('filterStatus', e.target.value)}
                >
                  {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                </select>
                <span className="da-select-arrow">▾</span>
              </div>
              <button className="da-btn outline">⬇ Export CSV</button>
            </div>

            <div className="da-table-card">
              {loading ? (
                <div className="da-loading"><div className="da-spinner" /></div>
              ) : (
                <>
                  <table className="da-table">
                    <thead>
                      <tr>
                        <th>Profil</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Tanggal Daftar</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>
                            Tidak ada pengguna ditemukan.
                          </td>
                        </tr>
                      ) : (
                        users.map(u => (
                          <tr key={u.user_id}>
                            <td>
                              <div className="da-user-avatar" style={{ background: u.role === 'admin' ? '#7c3aed' : u.role === 'umkm' ? '#d97706' : '#006B3F' }}>
                                {u.foto ? <img src={u.foto} alt={u.nama} /> : this.getInitials(u.nama)}
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{u.nama}</td>
                            <td style={{ color: '#6b7280', fontSize: 13 }}>{u.email}</td>
                            <td>
                              <span className={`da-badge ${u.role}`}>{u.role}</span>
                            </td>
                            <td>
                              <div className="da-status-dot">
                                <div className={`da-dot ${u.status === 'aktif' ? 'green' : 'red'}`} />
                                <span style={{ color: u.status === 'aktif' ? '#15803d' : '#dc2626', fontWeight: 600 }}>
                                  {u.status === 'aktif' ? 'Aktif' : 'Suspended'}
                                </span>
                              </div>
                            </td>
                            <td style={{ color: '#6b7280', fontSize: 13 }}>{formatDate(u.tanggal_daftar)}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  className={`da-btn sm ${u.status === 'aktif' ? 'warn' : 'primary'}`}
                                  onClick={() => this.openConfirm(u, u.status === 'aktif' ? 'suspend' : 'activate')}
                                >
                                  {u.status === 'aktif' ? 'Suspend' : 'Aktifkan'}
                                </button>
                                <button
                                  className="da-btn danger sm"
                                  onClick={() => this.openConfirm(u, 'delete')}
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div className="da-pagination">
                    <span>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total.toLocaleString()}</span>
                    <div className="da-page-btns">
                      <button className="da-page-btn" onClick={() => this.setState(p => ({ page: Math.max(1, p.page - 1) }), this.fetchUsers)} disabled={page === 1}>‹</button>
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        const p = Math.max(1, Math.min(page - 1 + i, totalPages - 2 + i));
                        return <button key={p} className={`da-page-btn ${page === p ? 'active' : ''}`} onClick={() => this.setState({ page: p }, this.fetchUsers)}>{p}</button>;
                      })}
                      {totalPages > 3 && <span style={{ padding: '0 4px' }}>...</span>}
                      {totalPages > 3 && <button className={`da-page-btn ${page === totalPages ? 'active' : ''}`} onClick={() => this.setState({ page: totalPages }, this.fetchUsers)}>{totalPages}</button>}
                      <button className="da-page-btn" onClick={() => this.setState(p => ({ page: Math.min(totalPages, p.page + 1) }), this.fetchUsers)} disabled={page === totalPages}>›</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── CONFIRM MODAL ── */}
        {confirmModal && (
          <div className="da-modal-overlay" onClick={this.closeConfirm}>
            <div className="da-modal" onClick={e => e.stopPropagation()}>
              <div className="da-modal-title">
                {confirmModal.action === 'delete' ? '🗑 Hapus Pengguna' :
                 confirmModal.action === 'suspend' ? '⏸ Suspend Pengguna' : '▶ Aktifkan Pengguna'}
              </div>
              <div className="da-modal-body">
                {confirmModal.action === 'delete'
                  ? `Apakah Anda yakin ingin menghapus akun "${confirmModal.user.nama}"? Tindakan ini tidak dapat dibatalkan.`
                  : confirmModal.action === 'suspend'
                  ? `Akun "${confirmModal.user.nama}" akan disuspend dan tidak dapat login.`
                  : `Akun "${confirmModal.user.nama}" akan diaktifkan kembali.`
                }
              </div>
              <div className="da-modal-actions">
                <button className="da-btn outline" onClick={this.closeConfirm}>Batal</button>
                {confirmModal.action === 'delete' ? (
                  <button className="da-btn danger" onClick={() => this.handleDelete(confirmModal.user)}>Hapus</button>
                ) : (
                  <button className="da-btn primary" onClick={() => this.handleSuspend(confirmModal.user)}>
                    {confirmModal.action === 'suspend' ? 'Suspend' : 'Aktifkan'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default KelolaAkunPage;
