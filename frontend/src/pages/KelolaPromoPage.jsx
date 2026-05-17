import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { promoAPI, umkmAPI } from '../services/api';
import UMKMSidebar from '../components/UMKMSidebar';
import './DashboardUMKM.css';

const formatDate = (s) => {
  if (!s) return '-';
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isActive = (p) => {
  const now = new Date();
  const start = p.tanggal_mulai ? new Date(p.tanggal_mulai) : null;
  const end = p.tanggal_berakhir ? new Date(p.tanggal_berakhir) : null;
  return (!start || now >= start) && (!end || now <= end);
};

const EMPTY_FORM = { judul: '', deskripsi: '', diskon_persen: '', tanggal_mulai: '', tanggal_berakhir: '', syarat_ketentuan: '' };

class KelolaPromoPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = {
      user, toko: null,
      promos: [], loading: true,
      activeTab: 'aktif',
      showModal: false, editPromo: null,
      form: { ...EMPTY_FORM },
      formLoading: false, formError: '',
    };
  }

  componentDidMount() {
    if (!this.state.user || this.state.user.role !== 'umkm') return;
    this.fetchAll();
  }

  fetchAll = async () => {
    try {
      const tokoRes = await umkmAPI.getMyToko();
      const toko = tokoRes.data;
      this.setState({ toko });
      const promoRes = await promoAPI.listByUmkm(toko.umkm_id);
      this.setState({ promos: promoRes.data || [] });
    } catch { /* no promos */ }
    finally { this.setState({ loading: false }); }
  };

  openAdd = () => this.setState({ showModal: true, editPromo: null, form: { ...EMPTY_FORM }, formError: '' });
  openEdit = (p) => this.setState({
    showModal: true, editPromo: p,
    form: { judul: p.judul, deskripsi: p.deskripsi || '', diskon_persen: p.diskon_persen || '', tanggal_mulai: p.tanggal_mulai?.slice(0, 10) || '', tanggal_berakhir: p.tanggal_berakhir?.slice(0, 10) || '', syarat_ketentuan: p.syarat_ketentuan || '' },
    formError: '',
  });
  closeModal = () => this.setState({ showModal: false, formError: '' });

  handleSave = async () => {
    const { form, editPromo, toko } = this.state;
    if (!form.judul.trim()) { this.setState({ formError: 'Judul promo wajib diisi.' }); return; }
    this.setState({ formLoading: true, formError: '' });
    try {
      const payload = { ...form, umkm_id: toko.umkm_id, diskon_persen: form.diskon_persen ? Number(form.diskon_persen) : null };
      if (editPromo) {
        await promoAPI.update(editPromo.promo_id, payload);
      } else {
        await promoAPI.create(payload);
      }
      this.setState({ showModal: false });
      await this.fetchAll();
    } catch (err) {
      this.setState({ formError: err.response?.data?.detail || 'Gagal menyimpan promo.' });
    } finally {
      this.setState({ formLoading: false });
    }
  };

  handleDelete = async (promoId) => {
    if (!window.confirm('Hapus promo ini?')) return;
    try { await promoAPI.delete(promoId); await this.fetchAll(); }
    catch { alert('Gagal menghapus promo.'); }
  };

  render() {
    const { user, promos, loading, activeTab, showModal, editPromo, form, formLoading, formError } = this.state;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'umkm') return <Navigate to="/" replace />;

    const filtered = activeTab === 'aktif' ? promos.filter(isActive) : promos.filter(p => !isActive(p));

    return (
      <div className="du-wrapper">
        <UMKMSidebar activePath="/dashboard/umkm/promo" />

        <div className="du-content">
          <header className="du-topbar">
            <div className="du-topbar-title">Kelola Promo</div>
            <div className="du-topbar-right">
              <button className="du-btn primary" onClick={this.openAdd}>+ Buat Promo</button>
            </div>
          </header>

          <div className="du-body">
            <div className="du-cat-tabs">
              <button className={`du-cat-tab ${activeTab === 'aktif' ? 'active' : ''}`} onClick={() => this.setState({ activeTab: 'aktif' })}>
                Aktif ({promos.filter(isActive).length})
              </button>
              <button className={`du-cat-tab ${activeTab === 'berakhir' ? 'active' : ''}`} onClick={() => this.setState({ activeTab: 'berakhir' })}>
                Berakhir ({promos.filter(p => !isActive(p)).length})
              </button>
            </div>

            {loading ? (
              <div className="du-loading"><div className="du-spinner" /></div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏷️</div>
                <p style={{ color: '#6b7280', marginBottom: 20 }}>Belum ada promo {activeTab}.</p>
                <button className="du-btn primary" onClick={this.openAdd}>+ Buat Promo Baru</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {filtered.map(p => (
                  <div key={p.promo_id} className="du-table-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        {p.diskon_persen && (
                          <div style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', borderRadius: 99, padding: '3px 12px', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                            Diskon {p.diskon_persen}%
                          </div>
                        )}
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{p.judul}</div>
                      </div>
                      <span className={`du-badge ${isActive(p) ? 'green' : 'gray'}`}>{isActive(p) ? 'Aktif' : 'Berakhir'}</span>
                    </div>
                    {p.deskripsi && <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>{p.deskripsi}</p>}
                    <div style={{ fontSize: 12.5, color: '#9ca3af', marginBottom: 14 }}>
                      📅 {formatDate(p.tanggal_mulai)} — {formatDate(p.tanggal_berakhir)}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="du-btn outline sm" onClick={() => this.openEdit(p)}>✏️ Edit</button>
                      <button className="du-btn danger sm" onClick={() => this.handleDelete(p.promo_id)}>🗑 Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── MODAL ── */}
        {showModal && (
          <div className="du-modal-overlay" onClick={this.closeModal}>
            <div className="du-modal" onClick={e => e.stopPropagation()}>
              <div className="du-modal-header">
                <div className="du-modal-title">{editPromo ? 'Edit Promo' : 'Buat Promo Baru'}</div>
                <button className="du-modal-close" onClick={this.closeModal}>✕</button>
              </div>

              <div className="du-field">
                <label>Judul Promo</label>
                <input value={form.judul} onChange={e => this.setState(p => ({ form: { ...p.form, judul: e.target.value } }))} placeholder="Masukkan judul promo" />
              </div>
              <div className="du-field">
                <label>Deskripsi</label>
                <textarea value={form.deskripsi} onChange={e => this.setState(p => ({ form: { ...p.form, deskripsi: e.target.value } }))} placeholder="Jelaskan detail promo..." rows={3} />
              </div>
              <div className="du-field">
                <label>Diskon (%)</label>
                <input type="number" value={form.diskon_persen} onChange={e => this.setState(p => ({ form: { ...p.form, diskon_persen: e.target.value } }))} placeholder="0" min="0" max="100" />
              </div>
              <div className="du-field-row">
                <div className="du-field">
                  <label>Tanggal Mulai</label>
                  <input type="date" value={form.tanggal_mulai} onChange={e => this.setState(p => ({ form: { ...p.form, tanggal_mulai: e.target.value } }))} />
                </div>
                <div className="du-field">
                  <label>Tanggal Berakhir</label>
                  <input type="date" value={form.tanggal_berakhir} onChange={e => this.setState(p => ({ form: { ...p.form, tanggal_berakhir: e.target.value } }))} />
                </div>
              </div>
              <div className="du-field">
                <label>Syarat &amp; Ketentuan</label>
                <textarea value={form.syarat_ketentuan} onChange={e => this.setState(p => ({ form: { ...p.form, syarat_ketentuan: e.target.value } }))} placeholder="Masukkan syarat dan ketentuan yang berlaku..." rows={3} />
              </div>

              {formError && <div className="du-modal-error">{formError}</div>}

              <div className="du-modal-actions">
                <button className="du-btn outline" onClick={this.closeModal}>Batal</button>
                <button className="du-btn primary" onClick={this.handleSave} disabled={formLoading}>
                  {formLoading ? 'Menyimpan...' : 'Simpan Promo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default KelolaPromoPage;
