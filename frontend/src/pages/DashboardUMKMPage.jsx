import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { pesananAPI, ratingAPI, umkmAPI, menuAPI, getImageUrl } from '../services/api';
import { withRouter } from '../utils/withRouter';
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
      menus: [],
      loading: true,
      // Profile modal
      showProfileModal: false,
      profileForm: {
        nama_umkm: '', alamat: '', kategori: 'makanan_berat', deskripsi: '',
        jam_buka: '08:00', jam_tutup: '21:00', status_operasional: 'buka',
        nomor_rekening: '', nama_bank: '', nomor_ewallet: '',
      },
      fotoTokoFile: null, fotoTokoPreview: null,
      fotoQrisFile: null, fotoQrisPreview: null,
      profileLoading: false, profileError: '',
      replyingTo: null, replyText: '', replyLoading: false,
    };
  }

  componentDidMount() {
    if (!this.state.user || this.state.user.role !== 'umkm') return;
    this.fetchAll().then(() => {
      if (this.props.location?.state?.openProfile) this.openProfileModal();
    });
  }

  componentDidUpdate(prevProps) {
    const wasOpen = prevProps.location?.state?.openProfile;
    const isOpen  = this.props.location?.state?.openProfile;
    if (isOpen && !wasOpen && !this.state.showProfileModal) {
      this.openProfileModal();
    }
  }

  fetchAll = async () => {
    try {
      let toko = null;
      try {
        const tokoRes = await umkmAPI.getMyToko();
        toko = tokoRes.data;
      } catch (err) {
        if (err.response?.status !== 404) throw err;
      }
      this.setState({ toko });

      let pesananList = [], ulasanList = [], menus = [];
      if (toko?.umkm_id) {
        const [pesananRes, ulasanRes, menuRes] = await Promise.allSettled([
          pesananAPI.getMasuk({ per_page: 5 }),
          ratingAPI.listByUmkm(toko.umkm_id, { per_page: 3 }),
          menuAPI.list(toko.umkm_id),
        ]);
        pesananList = pesananRes.status === 'fulfilled' ? (pesananRes.value.data?.data || pesananRes.value.data || []) : [];
        ulasanList = ulasanRes.status === 'fulfilled' ? (ulasanRes.value.data?.data || ulasanRes.value.data || []) : [];
        menus = menuRes.status === 'fulfilled' ? (menuRes.value.data || []) : [];
      }

      this.setState({ pesananList, ulasanList, menus });
    } catch { /* silently ignore */ }
    finally { this.setState({ loading: false }); }
  };

  openProfileModal = () => {
    const { toko } = this.state;
    this.setState({
      showProfileModal: true,
      profileError: '',
      fotoTokoFile: null,
      fotoTokoPreview: getImageUrl(toko?.foto_toko) || null,
      fotoQrisFile: null,
      fotoQrisPreview: getImageUrl(toko?.foto_qris) || null,
      profileForm: {
        nama_umkm: toko?.nama_umkm || '',
        alamat: toko?.alamat || '',
        kategori: toko?.kategori || 'makanan_berat',
        deskripsi: toko?.deskripsi || '',
        jam_buka: toko?.jam_buka || '08:00',
        jam_tutup: toko?.jam_tutup || '21:00',
        status_operasional: toko?.status_operasional || 'buka',
        nomor_rekening: toko?.nomor_rekening || '',
        nama_bank: toko?.nama_bank || '',
        nomor_ewallet: toko?.nomor_ewallet || '',
      },
    });
  };

  closeProfileModal = () => this.setState({ showProfileModal: false, profileError: '' });

  handleBalasUlasan = async (ratingId) => {
    const { replyText } = this.state;
    if (!replyText.trim()) return;
    this.setState({ replyLoading: true });
    try {
      const res = await ratingAPI.balas(ratingId, { balasan: replyText });
      this.setState(prev => ({
        ulasanList: prev.ulasanList.map(u =>
          u.rating_id === ratingId ? { ...u, balasan: res.data.balasan } : u
        ),
        replyingTo: null, replyText: '',
      }));
    } catch { alert('Gagal mengirim balasan.'); }
    finally { this.setState({ replyLoading: false }); }
  };

  handleFotoToko = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    this.setState({ fotoTokoFile: file, fotoTokoPreview: URL.createObjectURL(file) });
  };

  handleFotoQris = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    this.setState({ fotoQrisFile: file, fotoQrisPreview: URL.createObjectURL(file) });
  };

  handleProfileSave = async () => {
    const { profileForm, toko, fotoTokoFile, fotoQrisFile } = this.state;
    if (!profileForm.nama_umkm.trim() || !profileForm.alamat.trim() || !profileForm.kategori) {
      this.setState({ profileError: 'Nama UMKM, alamat, dan kategori wajib diisi.' });
      return;
    }
    if (!toko && !fotoTokoFile) {
      this.setState({ profileError: 'Foto toko wajib diupload saat pertama kali mendaftar.' });
      return;
    }
    this.setState({ profileLoading: true, profileError: '' });
    try {
      let updatedToko;
      if (toko) {
        const res = await umkmAPI.update(toko.umkm_id, profileForm);
        updatedToko = res.data;
      } else {
        const res = await umkmAPI.create(profileForm);
        updatedToko = res.data;
      }
      if (fotoTokoFile) {
        const fd = new FormData();
        fd.append('file', fotoTokoFile);
        const r = await umkmAPI.uploadFotoToko(updatedToko.umkm_id, fd);
        updatedToko = r.data;
      }
      if (fotoQrisFile) {
        const fd = new FormData();
        fd.append('file', fotoQrisFile);
        const r = await umkmAPI.uploadQris(updatedToko.umkm_id, fd);
        updatedToko = r.data;
      }
      this.setState({ toko: updatedToko, showProfileModal: false });
      await this.fetchAll();
    } catch (err) {
      this.setState({ profileError: err.response?.data?.detail || 'Gagal menyimpan profil toko.' });
    } finally {
      this.setState({ profileLoading: false });
    }
  };

  render() {
    const {
      user, toko, pesananList, ulasanList, menus, loading,
      showProfileModal, profileForm, profileLoading, profileError,
      fotoTokoPreview, fotoQrisPreview,
      replyingTo, replyText, replyLoading,
    } = this.state;

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'umkm') return <Navigate to="/" replace />;

    const today = new Date().toDateString();
    const pesananHariIni = pesananList.filter(p => {
      if (!p.tanggal_pesan) return false;
      return new Date(p.tanggal_pesan).toDateString() === today;
    }).length;
    const menuAktif = menus.filter(m => m.status_ketersediaan).length;

    return (
      <>
      <div className="du-wrapper">
        <UMKMSidebar activePath="/dashboard/umkm" namaUmkm={toko?.nama_umkm} />

        <div className="du-content">
          {/* ── TOPBAR ── */}
          <header className="du-topbar">
            <div className="du-topbar-title">Dashboard</div>
            <div className="du-topbar-right">
              <button className="du-btn outline sm" onClick={this.openProfileModal} style={{ marginRight: 8 }}>
                ⚙️ {toko ? 'Edit Profil Toko' : 'Setup Toko'}
              </button>
              <span className="du-topbar-icon">🔔</span>
              <div className="du-topbar-user">
                <div>
                  <div className="du-topbar-greeting">Halo, {user.nama?.split(' ')[0]}!</div>
                  <div className="du-topbar-sub">{toko?.nama_umkm || 'Belum ada toko'}</div>
                </div>
                <div className="du-topbar-avatar">{user.nama?.charAt(0).toUpperCase()}</div>
              </div>
            </div>
          </header>

          <div className="du-body">
            {loading ? (
              <div className="du-loading"><div className="du-spinner" /> Memuat dashboard...</div>
            ) : !toko ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🏪</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Toko Anda Belum Terdaftar</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 28, maxWidth: 400 }}>
                  Lengkapi profil toko Anda terlebih dahulu, termasuk foto toko, lokasi, dan metode pembayaran yang tersedia.
                </div>
                <button className="du-btn primary" onClick={this.openProfileModal} style={{ fontSize: 15, padding: '12px 32px' }}>
                  + Daftarkan Toko Saya
                </button>
              </div>
            ) : (
              <>
                {/* ── STATS ── */}
                <div className="du-stats-grid">
                  <div className="du-stat-card">
                    <div>
                      <div className="du-stat-label">Pesanan Hari Ini</div>
                      <div className="du-stat-val">{pesananHariIni}</div>
                      <div className="du-stat-delta">total pesanan masuk hari ini</div>
                    </div>
                    <div className="du-stat-icon orange">📦</div>
                  </div>
                  <div className="du-stat-card">
                    <div>
                      <div className="du-stat-label">Pendapatan Hari Ini</div>
                      <div className="du-stat-val">
                        {formatRp(pesananList.filter(p => {
                          if (!p.tanggal_pesan) return false;
                          return new Date(p.tanggal_pesan).toDateString() === today && p.status_pesanan === 'selesai';
                        }).reduce((s, p) => s + (p.total_harga || 0), 0))}
                      </div>
                      <div className="du-stat-delta">dari pesanan selesai hari ini</div>
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
                      <div className="du-stat-val">{menuAktif}</div>
                      <div className="du-stat-delta">dari {menus.length} total menu</div>
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
                            <div className="du-reviewer-name">{u.nama_mahasiswa || 'Mahasiswa'}</div>
                            <div className="du-review-stars">{'★'.repeat(u.nilai)}{'☆'.repeat(5 - u.nilai)}</div>
                          </div>
                          <div className="du-review-text">{u.komentar || '-'}</div>
                          {u.balasan ? (
                            <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fdf4', borderLeft: '3px solid #006B3F', borderRadius: 6, fontSize: 13, color: '#374151' }}>
                              <strong style={{ color: '#006B3F' }}>Balasan Anda:</strong> {u.balasan}
                            </div>
                          ) : replyingTo === u.rating_id ? (
                            <div style={{ marginTop: 8 }}>
                              <textarea
                                value={replyText}
                                onChange={e => this.setState({ replyText: e.target.value })}
                                placeholder="Tulis balasan..."
                                rows={2}
                                style={{ width: '100%', borderRadius: 8, border: '1.5px solid #d1d5db', padding: '8px 10px', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                              />
                              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                <button className="du-btn primary sm" onClick={() => this.handleBalasUlasan(u.rating_id)} disabled={replyLoading}>
                                  {replyLoading ? '...' : 'Kirim'}
                                </button>
                                <button className="du-btn outline sm" onClick={() => this.setState({ replyingTo: null, replyText: '' })}>Batal</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => this.setState({ replyingTo: u.rating_id, replyText: '' })}
                              style={{ marginTop: 6, fontSize: 12, color: '#006B3F', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              💬 Balas ulasan
                            </button>
                          )}
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

      {/* ── MODAL PROFIL TOKO ── */}

      {showProfileModal && (
        <div className="du-modal-overlay" onClick={this.closeProfileModal}>
          <div className="du-modal" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="du-modal-header">
              <div className="du-modal-title">{toko ? 'Edit Profil Toko' : 'Daftarkan Toko'}</div>
              <button className="du-modal-close" onClick={this.closeProfileModal}>✕</button>
            </div>

            {/* Foto Toko */}
            <div className="du-field">
              <label>Foto Toko {!toko && <span style={{ color: '#ef4444' }}>*</span>}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, border: '2px dashed #d1d5db', flexShrink: 0 }}>
                  {fotoTokoPreview
                    ? <img src={fotoTokoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🏪'}
                </div>
                <label style={{ cursor: 'pointer' }}>
                  <span className="du-btn outline sm">📷 Pilih Foto</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={this.handleFotoToko} />
                </label>
              </div>
            </div>

            {/* Info Dasar */}
            <div className="du-field">
              <label>Nama UMKM <span style={{ color: '#ef4444' }}>*</span></label>
              <input value={profileForm.nama_umkm} onChange={e => this.setState(p => ({ profileForm: { ...p.profileForm, nama_umkm: e.target.value } }))} placeholder="Contoh: Warung Nasi Bu Siti" />
            </div>
            <div className="du-field">
              <label>Alamat / Lokasi <span style={{ color: '#ef4444' }}>*</span></label>
              <input value={profileForm.alamat} onChange={e => this.setState(p => ({ profileForm: { ...p.profileForm, alamat: e.target.value } }))} placeholder="Contoh: Gedung Rektorat Lt. 1, Kampus IPB" />
            </div>
            <div className="du-field-row">
              <div className="du-field">
                <label>Kategori <span style={{ color: '#ef4444' }}>*</span></label>
                <select value={profileForm.kategori} onChange={e => this.setState(p => ({ profileForm: { ...p.profileForm, kategori: e.target.value } }))}>
                  <option value="makanan_berat">Makanan Berat</option>
                  <option value="minuman">Minuman</option>
                  <option value="snack">Snack</option>
                  <option value="dessert">Dessert</option>
                  <option value="healthy_food">Healthy Food</option>
                </select>
              </div>
              <div className="du-field">
                <label>Status Operasional</label>
                <select value={profileForm.status_operasional} onChange={e => this.setState(p => ({ profileForm: { ...p.profileForm, status_operasional: e.target.value } }))}>
                  <option value="buka">Buka</option>
                  <option value="tutup">Tutup</option>
                  <option value="libur">Libur</option>
                </select>
              </div>
            </div>
            <div className="du-field-row">
              <div className="du-field">
                <label>Jam Buka</label>
                <input type="time" value={profileForm.jam_buka} onChange={e => this.setState(p => ({ profileForm: { ...p.profileForm, jam_buka: e.target.value } }))} />
              </div>
              <div className="du-field">
                <label>Jam Tutup</label>
                <input type="time" value={profileForm.jam_tutup} onChange={e => this.setState(p => ({ profileForm: { ...p.profileForm, jam_tutup: e.target.value } }))} />
              </div>
            </div>
            <div className="du-field">
              <label>Deskripsi</label>
              <textarea value={profileForm.deskripsi} onChange={e => this.setState(p => ({ profileForm: { ...p.profileForm, deskripsi: e.target.value } }))} placeholder="Ceritakan tentang toko Anda..." rows={2} />
            </div>

            {/* Metode Pembayaran */}
            <div style={{ marginTop: 12, marginBottom: 8, fontWeight: 700, fontSize: 14, color: '#111827', borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
              💳 Metode Pembayaran
            </div>

            <div className="du-field-row">
              <div className="du-field">
                <label>Nama Bank</label>
                <input value={profileForm.nama_bank} onChange={e => this.setState(p => ({ profileForm: { ...p.profileForm, nama_bank: e.target.value } }))} placeholder="BCA / BRI / Mandiri..." />
              </div>
              <div className="du-field">
                <label>Nomor Rekening</label>
                <input value={profileForm.nomor_rekening} onChange={e => this.setState(p => ({ profileForm: { ...p.profileForm, nomor_rekening: e.target.value } }))} placeholder="0123456789" />
              </div>
            </div>
            <div className="du-field">
              <label>Nomor E-Wallet (GoPay / OVO / Dana / dll)</label>
              <input value={profileForm.nomor_ewallet} onChange={e => this.setState(p => ({ profileForm: { ...p.profileForm, nomor_ewallet: e.target.value } }))} placeholder="08xxxxxxxxxx" />
            </div>
            <div className="du-field">
              <label>Foto QR Code (QRIS)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
                <div style={{ width: 80, height: 80, borderRadius: 8, background: '#f3f4f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, border: '2px dashed #d1d5db', flexShrink: 0 }}>
                  {fotoQrisPreview
                    ? <img src={fotoQrisPreview} alt="qris" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '📱'}
                </div>
                <label style={{ cursor: 'pointer' }}>
                  <span className="du-btn outline sm">📷 Pilih Foto QRIS</span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={this.handleFotoQris} />
                </label>
              </div>
            </div>

            {profileError && <div className="du-modal-error">{profileError}</div>}

            <div className="du-modal-actions">
              <button className="du-btn outline" onClick={this.closeProfileModal}>Batal</button>
              <button className="du-btn primary" onClick={this.handleProfileSave} disabled={profileLoading}>
                {profileLoading ? 'Menyimpan...' : toko ? 'Simpan Perubahan' : 'Daftarkan Toko'}
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }
}

export default withRouter(DashboardUMKMPage);
