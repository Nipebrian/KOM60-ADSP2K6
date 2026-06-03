import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { umkmAPI, menuAPI, getImageUrl } from '../services/api';
import UMKMSidebar from '../components/UMKMSidebar';
import './DashboardUMKM.css';

const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const CAT_OPTS = [
  { key: 'semua', label: 'Semua' },
  { key: 'makanan', label: 'Makanan' },
  { key: 'minuman', label: 'Minuman' },
  { key: 'snack', label: 'Snack' },
  { key: 'dessert', label: 'Dessert' },
];

const EMPTY_FORM = { nama_menu: '', kategori: 'makanan', harga: '', deskripsi: '', status_ketersediaan: true };

class KelolaMenuPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = {
      user,
      toko: null,
      menus: [],
      loading: true,
      activecat: 'semua',
      showModal: false,
      editMenu: null,
      form: { ...EMPTY_FORM },
      fotoMenuFile: null,
      fotoMenuPreview: null,
      formLoading: false,
      formError: '',
      page: 1,
    };
  }

  componentDidMount() {
    if (!this.state.user || this.state.user.role !== 'umkm') return;
    this.fetchToko();
  }

  fetchToko = async () => {
    try {
      const res = await umkmAPI.getMyToko();
      const toko = res.data;
      this.setState({ toko });
      if (toko?.umkm_id) await this.fetchMenus(toko.umkm_id);
    } catch { this.setState({ loading: false }); }
  };

  fetchMenus = async (umkmId) => {
    try {
      const res = await menuAPI.list(umkmId);
      this.setState({ menus: res.data || [], loading: false });
    } catch { this.setState({ loading: false }); }
  };

  openAdd = () => this.setState({ showModal: true, editMenu: null, form: { ...EMPTY_FORM }, fotoMenuFile: null, fotoMenuPreview: null, formError: '' });
  openEdit = (m) => this.setState({
    showModal: true, editMenu: m,
    form: { nama_menu: m.nama_menu, kategori: m.kategori, harga: m.harga, deskripsi: m.deskripsi || '', status_ketersediaan: m.status_ketersediaan },
    fotoMenuFile: null, fotoMenuPreview: m.foto_menu || null, formError: '',
  });
  closeModal = () => this.setState({ showModal: false, formError: '', fotoMenuFile: null, fotoMenuPreview: null });

  handleFormChange = (field, val) => this.setState(prev => ({ form: { ...prev.form, [field]: val } }));

  handleFotoMenu = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    this.setState({ fotoMenuFile: file, fotoMenuPreview: URL.createObjectURL(file) });
  };

  handleSave = async () => {
    const { form, editMenu, toko, fotoMenuFile } = this.state;
    if (!form.nama_menu.trim() || !form.harga) {
      this.setState({ formError: 'Nama menu dan harga wajib diisi.' });
      return;
    }
    this.setState({ formLoading: true, formError: '' });
    try {
      const payload = {
        nama_menu: form.nama_menu,
        kategori: form.kategori,
        harga: Number(form.harga),
        deskripsi: form.deskripsi,
        status_ketersediaan: form.status_ketersediaan,
      };
      let savedMenu;
      if (editMenu) {
        const res = await menuAPI.update(toko.umkm_id, editMenu.menu_id, payload);
        savedMenu = res.data;
      } else {
        const res = await menuAPI.create(toko.umkm_id, payload);
        savedMenu = res.data;
      }
      if (fotoMenuFile) {
        const fd = new FormData();
        fd.append('file', fotoMenuFile);
        await menuAPI.uploadFoto(toko.umkm_id, savedMenu.menu_id, fd);
      }
      this.setState({ showModal: false, fotoMenuFile: null, fotoMenuPreview: null });
      await this.fetchMenus(toko.umkm_id);
    } catch (err) {
      this.setState({ formError: err.response?.data?.detail || 'Gagal menyimpan menu.' });
    } finally {
      this.setState({ formLoading: false });
    }
  };

  handleDelete = async (menuId) => {
    if (!window.confirm('Hapus menu ini?')) return;
    const { toko } = this.state;
    try {
      await menuAPI.delete(toko.umkm_id, menuId);
      await this.fetchMenus(toko.umkm_id);
    } catch { alert('Gagal menghapus menu.'); }
  };

  handleToggle = async (m) => {
    const { toko } = this.state;
    const newStatus = !m.status_ketersediaan;
    // Optimistic update — langsung tampilkan perubahan tanpa tunggu API
    this.setState(prev => ({
      menus: prev.menus.map(menu =>
        menu.menu_id === m.menu_id ? { ...menu, status_ketersediaan: newStatus } : menu
      ),
    }));
    try {
      await menuAPI.update(toko.umkm_id, m.menu_id, { status_ketersediaan: newStatus });
    } catch {
      // Revert jika API gagal
      this.setState(prev => ({
        menus: prev.menus.map(menu =>
          menu.menu_id === m.menu_id ? { ...menu, status_ketersediaan: m.status_ketersediaan } : menu
        ),
      }));
      alert('Gagal update status.');
    }
  };

  render() {
    const { user, menus, loading, activecat, showModal, editMenu, form, formLoading, formError, page } = this.state;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'umkm') return <Navigate to="/" replace />;

    const filtered = activecat === 'semua' ? menus : menus.filter(m => m.kategori === activecat);
    const PER = 8;
    const totalPages = Math.ceil(filtered.length / PER);
    const paginated = filtered.slice((page - 1) * PER, page * PER);

    const catCounts = {};
    menus.forEach(m => { catCounts[m.kategori] = (catCounts[m.kategori] || 0) + 1; });

    return (
      <div className="du-wrapper">
        <UMKMSidebar activePath="/dashboard/umkm/menu" />

        <div className="du-content">
          <header className="du-topbar">
            <div className="du-topbar-title">Kelola Menu</div>
            <div className="du-topbar-right">
              <span className="du-topbar-icon">🔔</span>
              <span className="du-topbar-icon">💬</span>
              <span className="du-topbar-icon">❓</span>
              <div className="du-topbar-user">
                <div>
                  <div className="du-topbar-greeting">Halo, {user.nama?.split(' ')[0]}!</div>
                  <div className="du-topbar-sub">{this.state.toko?.nama_umkm}</div>
                </div>
                <div className="du-topbar-avatar">{user.nama?.charAt(0).toUpperCase()}</div>
              </div>
            </div>
          </header>

          <div className="du-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div className="du-page-title">Daftar Menu</div>
                <div className="du-page-sub">Kelola hidangan yang tersedia untuk pelanggan.</div>
              </div>
              <button className="du-btn primary" onClick={this.openAdd}>+ Tambah Menu</button>
            </div>

            {/* Category filter tabs */}
            <div className="du-cat-tabs">
              {CAT_OPTS.map(c => {
                const count = c.key === 'semua' ? menus.length : (catCounts[c.key] || 0);
                return (
                  <button
                    key={c.key}
                    className={`du-cat-tab ${activecat === c.key ? 'active' : ''}`}
                    onClick={() => this.setState({ activecat: c.key, page: 1 })}
                  >
                    {c.label} {count > 0 ? `(${count})` : ''}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="du-loading"><div className="du-spinner" /></div>
            ) : (
              <div className="du-table-card">
                {paginated.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                    Tidak ada menu. <button className="du-btn primary" onClick={this.openAdd} style={{ marginLeft: 10 }}>+ Tambah</button>
                  </div>
                ) : (
                  <>
                    <table>
                      <thead>
                        <tr>
                          <th>Menu</th>
                          <th>Kategori</th>
                          <th>Harga</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map(m => (
                          <tr key={m.menu_id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden' }}>
                                  {m.foto_menu ? <img src={getImageUrl(m.foto_menu)} alt={m.nama_menu} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍽️'}
                                </div>
                                <span style={{ fontWeight: 600 }}>{m.nama_menu}</span>
                              </div>
                            </td>
                            <td style={{ textTransform: 'capitalize' }}>{m.kategori}</td>
                            <td style={{ fontWeight: 600 }}>{formatRp(m.harga)}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <label className="du-toggle">
                                  <input type="checkbox" checked={m.status_ketersediaan} onChange={() => this.handleToggle(m)} />
                                  <div className="du-toggle-track" />
                                  <div className="du-toggle-thumb" />
                                </label>
                                <span style={{ fontSize: 13, fontWeight: 600, color: m.status_ketersediaan ? '#15803d' : '#6b7280' }}>
                                  {m.status_ketersediaan ? 'Tersedia' : 'Habis'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="du-btn outline sm" onClick={() => this.openEdit(m)}>✏️</button>
                                <button className="du-btn danger sm" onClick={() => this.handleDelete(m.menu_id)}>🗑</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="du-pagination">
                      <span>Menampilkan {(page - 1) * PER + 1}–{Math.min(page * PER, filtered.length)} dari {filtered.length} menu</span>
                      <div className="du-page-btns">
                        <button className="du-page-btn" onClick={() => this.setState(p => ({ page: Math.max(1, p.page - 1) }))} disabled={page === 1}>‹</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button key={i + 1} className={`du-page-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => this.setState({ page: i + 1 })}>{i + 1}</button>
                        ))}
                        <button className="du-page-btn" onClick={() => this.setState(p => ({ page: Math.min(totalPages, p.page + 1) }))} disabled={page === totalPages}>›</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── MODAL ── */}
        {showModal && (
          <div className="du-modal-overlay" onClick={this.closeModal}>
            <div className="du-modal" onClick={e => e.stopPropagation()}>
              <div className="du-modal-header">
                <div className="du-modal-title">{editMenu ? 'Edit Menu' : 'Tambah Menu Baru'}</div>
                <button className="du-modal-close" onClick={this.closeModal}>✕</button>
              </div>

              {/* Foto Menu */}
              <div className="du-field">
                <label>Foto Menu</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
                  <div style={{ width: 70, height: 70, borderRadius: 10, background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '2px dashed #d1d5db', flexShrink: 0 }}>
                    {this.state.fotoMenuPreview
                      ? <img src={this.state.fotoMenuPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🍽️'}
                  </div>
                  <label style={{ cursor: 'pointer' }}>
                    <span className="du-btn outline sm">📷 Pilih Foto</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={this.handleFotoMenu} />
                  </label>
                </div>
              </div>

              <div className="du-field">
                <label>Nama Menu</label>
                <input value={form.nama_menu} onChange={e => this.handleFormChange('nama_menu', e.target.value)} placeholder="Nama hidangan" />
              </div>
              <div className="du-field-row">
                <div className="du-field">
                  <label>Kategori</label>
                  <select value={form.kategori} onChange={e => this.handleFormChange('kategori', e.target.value)}>
                    <option value="makanan">Makanan</option>
                    <option value="minuman">Minuman</option>
                    <option value="snack">Snack</option>
                    <option value="dessert">Dessert</option>
                  </select>
                </div>
                <div className="du-field">
                  <label>Harga (Rp)</label>
                  <input type="number" value={form.harga} onChange={e => this.handleFormChange('harga', e.target.value)} placeholder="0" min="0" />
                </div>
              </div>
              <div className="du-field">
                <label>Deskripsi</label>
                <textarea value={form.deskripsi} onChange={e => this.handleFormChange('deskripsi', e.target.value)} placeholder="Deskripsi singkat menu..." rows={2} />
              </div>
              <div className="du-field">
                <label>
                  <input type="checkbox" checked={form.status_ketersediaan} onChange={e => this.handleFormChange('status_ketersediaan', e.target.checked)} style={{ marginRight: 8 }} />
                  Tersedia
                </label>
              </div>

              {formError && <div className="du-modal-error">{formError}</div>}

              <div className="du-modal-actions">
                <button className="du-btn outline" onClick={this.closeModal}>Batal</button>
                <button className="du-btn primary" onClick={this.handleSave} disabled={formLoading}>
                  {formLoading ? 'Menyimpan...' : 'Simpan Menu'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default KelolaMenuPage;
