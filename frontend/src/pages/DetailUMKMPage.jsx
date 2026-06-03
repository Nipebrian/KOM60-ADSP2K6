import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { umkmAPI, menuAPI, ratingAPI, promoAPI, getImageUrl } from '../services/api';
import { withRouter } from '../utils/withRouter';
import './DetailUMKMPage.css';

const KATEGORI_MAP = {
  makanan_berat: 'Makanan Berat',
  minuman: 'Minuman',
  snack: 'Snack',
  dessert: 'Dessert',
  healthy_food: 'Healthy Food',
};

const FOOD_ICONS = {
  makanan_berat: '🍛', minuman: '🧋', snack: '🍿',
  dessert: '🍮', healthy_food: '🥗', default: '🍽️',
};

const MENU_CAT_MAP = {
  makanan: 'Makanan',
  minuman: 'Minuman',
  snack: 'Snack',
  dessert: 'Dessert',
};

class DetailUMKMPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = {
      user,
      umkm: null,
      menus: [],
      ratingSummary: null,
      ulasanList: [],
      promos: [],
      loading: true,
      activeTab: 'menu',
      activeMenuCat: 'semua',
      cart: {},        // { [menu_id]: { item, qty } }
      showCartModal: false,
    };
  }

  componentDidMount() {
    if (!this.state.user) return;
    const { umkmId } = this.props.params;
    if (umkmId) this.fetchAll(umkmId);
  }

  fetchAll = async (umkmId) => {
    this.setState({ loading: true });
    try {
      const [umkmRes, menuRes, ratingRes, ulasanRes, promoRes] = await Promise.allSettled([
        umkmAPI.getById(umkmId),
        menuAPI.list(umkmId),
        ratingAPI.summary(umkmId),
        ratingAPI.listByUmkm(umkmId, {}),
        promoAPI.listByUmkm(umkmId),
      ]);

      this.setState({
        umkm: umkmRes.status === 'fulfilled' ? umkmRes.value.data : null,
        menus: menuRes.status === 'fulfilled' ? menuRes.value.data : [],
        ratingSummary: ratingRes.status === 'fulfilled' ? ratingRes.value.data : null,
        ulasanList: ulasanRes.status === 'fulfilled' ? ulasanRes.value.data : [],
        promos: promoRes.status === 'fulfilled' ? promoRes.value.data : [],
      });
    } catch {
      // handled by allSettled
    } finally {
      this.setState({ loading: false });
    }
  };

  syncCartToLocalStorage = (cart) => {
    const { umkm } = this.state;
    const items = Object.values(cart).map(({ item, qty }) => ({
      menu_id: item.menu_id,
      nama_menu: item.nama_menu,
      harga: item.harga,
      jumlah: qty,
      umkm_id: umkm?.umkm_id,
      nama_umkm: umkm?.nama_umkm,
      foto_menu: item.foto_menu || null,
    }));
    localStorage.setItem('cart', JSON.stringify(items));
  };

  addToCart = (menu) => {
    this.setState((prev) => {
      const existing = prev.cart[menu.menu_id];
      return {
        cart: {
          ...prev.cart,
          [menu.menu_id]: {
            item: menu,
            qty: existing ? existing.qty + 1 : 1,
          },
        },
      };
    }, () => this.syncCartToLocalStorage(this.state.cart));
  };

  removeFromCart = (menuId) => {
    this.setState((prev) => {
      const existing = prev.cart[menuId];
      if (!existing) return null;
      if (existing.qty <= 1) {
        const newCart = { ...prev.cart };
        delete newCart[menuId];
        return { cart: newCart };
      }
      return { cart: { ...prev.cart, [menuId]: { ...existing, qty: existing.qty - 1 } } };
    }, () => this.syncCartToLocalStorage(this.state.cart));
  };

  getCartTotal = () => {
    return Object.values(this.state.cart).reduce(
      (sum, { item, qty }) => sum + item.harga * qty, 0
    );
  };

  getCartCount = () => {
    return Object.values(this.state.cart).reduce((sum, { qty }) => sum + qty, 0);
  };

  formatPrice = (price) => `Rp ${price.toLocaleString('id-ID')}`;

  renderStars = (rating, size = 16) => {
    const full = Math.floor(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < full ? '#F5A623' : '#e5e7eb', fontSize: size }}>★</span>
    ));
  };

  getFilteredMenus = () => {
    const { menus, activeMenuCat } = this.state;
    if (activeMenuCat === 'semua') return menus;
    return menus.filter((m) => m.kategori === activeMenuCat);
  };

  getMenuCategories = () => {
    const { menus } = this.state;
    const cats = [...new Set(menus.map((m) => m.kategori))];
    return cats;
  };

  getInitial = (nama = '') => nama.charAt(0).toUpperCase() || 'U';

  renderMenuTab() {
    const { cart } = this.state;
    const menus = this.getFilteredMenus();
    const cats = this.getMenuCategories();

    return (
      <div>
        {/* Category pills */}
        <div className="det-menu-cats">
          <button
            className={`det-cat-pill${this.state.activeMenuCat === 'semua' ? ' active' : ''}`}
            onClick={() => this.setState({ activeMenuCat: 'semua' })}
          >Semua</button>
          {cats.map((cat) => (
            <button
              key={cat}
              className={`det-cat-pill${this.state.activeMenuCat === cat ? ' active' : ''}`}
              onClick={() => this.setState({ activeMenuCat: cat })}
            >
              {MENU_CAT_MAP[cat] || cat}
            </button>
          ))}
        </div>

        {/* Menu list */}
        <div className="det-menu-list">
          {menus.length === 0 ? (
            <div className="det-ulasan-empty">Belum ada menu tersedia.</div>
          ) : (
            menus.map((menu) => {
              const cartEntry = cart[menu.menu_id];
              const inCart = !!cartEntry;

              return (
                <div
                  key={menu.menu_id}
                  className={`det-menu-item${!menu.status_ketersediaan ? ' unavailable' : ''}`}
                >
                  {/* Thumb */}
                  <div className="det-menu-thumb">
                    {menu.foto_menu
                      ? <img
                          src={getImageUrl(menu.foto_menu)}
                          alt={menu.nama_menu}
                          onError={e => {
                            const img = e.currentTarget;
                            img.parentNode.insertBefore(
                              document.createTextNode(FOOD_ICONS[menu.kategori] || FOOD_ICONS.default),
                              img
                            );
                            img.remove();
                          }}
                        />
                      : (FOOD_ICONS[menu.kategori] || FOOD_ICONS.default)
                    }
                  </div>

                  {/* Info */}
                  <div className="det-menu-info">
                    <div className="det-menu-name">{menu.nama_menu}</div>
                    {menu.deskripsi && (
                      <div className="det-menu-desc">{menu.deskripsi}</div>
                    )}
                    <div className="det-menu-bottom">
                      <span className="det-menu-price">{this.formatPrice(menu.harga)}</span>

                      {!menu.status_ketersediaan ? (
                        <span className="det-habis-badge">Habis</span>
                      ) : inCart ? (
                        <div className="det-qty-ctrl">
                          <button
                            className="det-qty-btn"
                            onClick={() => this.removeFromCart(menu.menu_id)}
                          >−</button>
                          <span className="det-qty-num">{cartEntry.qty}</span>
                          <button
                            className="det-qty-btn"
                            onClick={() => this.addToCart(menu)}
                          >+</button>
                        </div>
                      ) : (
                        <button
                          className="det-add-btn"
                          onClick={() => this.addToCart(menu)}
                        >+</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  renderUlasanTab() {
    const { ulasanList, ratingSummary } = this.state;

    return (
      <div>
        {/* Summary */}
        {ratingSummary && (
          <div style={{
            display: 'flex', gap: 20, padding: '16px',
            background: '#f9fafb', borderRadius: 12,
            marginBottom: 16, alignItems: 'center',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800 }}>
                {(ratingSummary.rata_rata || 0).toFixed(1)}
              </div>
              <div style={{ color: '#F5A623', fontSize: 18, margin: '4px 0' }}>
                {this.renderStars(ratingSummary.rata_rata || 0)}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {ratingSummary.total_ulasan} ulasan
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="det-ulasan-list">
          {ulasanList.length === 0 ? (
            <div className="det-ulasan-empty">Belum ada ulasan untuk UMKM ini.</div>
          ) : (
            ulasanList.map((u) => (
              <div key={u.rating_id} className="det-ulasan-item">
                <div className="det-ulasan-header">
                  <div className="det-ulasan-avatar">{this.getInitial(u.nama_user || 'A')}</div>
                  <div className="det-ulasan-meta">
                    <div className="det-ulasan-name">{u.nama_mahasiswa || 'Pengguna'}</div>
                    <div className="det-ulasan-date">
                      {new Date(u.tanggal_rating).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="det-ulasan-stars">{'★'.repeat(u.nilai)}{'☆'.repeat(5 - u.nilai)}</div>
                </div>
                {u.komentar && <div className="det-ulasan-text">{u.komentar}</div>}
                {u.balasan && (
                  <div className="det-ulasan-reply">
                    <strong>Balasan pemilik:</strong> {u.balasan}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  renderPromoTab() {
    const { promos } = this.state;

    if (promos.length === 0) {
      return <div className="det-ulasan-empty">Tidak ada promo aktif saat ini.</div>;
    }

    return (
      <div className="det-promo-list">
        {promos.map((p) => (
          <div key={p.promo_id} className="det-promo-item">
            <div className="det-promo-icon">🏷️</div>
            <div>
              <div className="det-promo-title">{p.judul}</div>
              {p.deskripsi && <div className="det-promo-desc">{p.deskripsi}</div>}
              {p.diskon_persen && (
                <div className="det-promo-desc">Diskon {p.diskon_persen}%</div>
              )}
              <div className="det-promo-dates">
                Berlaku: {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} –{' '}
                {new Date(p.tanggal_berakhir).toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { user, umkm, loading, activeTab, ratingSummary } = this.state;

    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'umkm') return <Navigate to="/dashboard/umkm" replace />;
    if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;

    const cartCount = this.getCartCount();
    const cartTotal = this.getCartTotal();

    if (loading) {
      return (
        <div>
          <nav className="det-navbar">
            <Link to="/direktori" className="det-back-btn">←</Link>
            <Link to="/" className="det-nav-brand">IPB Food Hub</Link>
          </nav>
          <div className="det-loading">
            <div className="det-spinner" />
            Memuat data UMKM...
          </div>
        </div>
      );
    }

    if (!umkm) {
      return (
        <div>
          <nav className="det-navbar">
            <Link to="/direktori" className="det-back-btn">←</Link>
            <Link to="/" className="det-nav-brand">IPB Food Hub</Link>
          </nav>
          <div className="det-loading">UMKM tidak ditemukan.</div>
        </div>
      );
    }

    const isBuka = umkm.status_operasional === 'buka';
    const ratingVal = ratingSummary?.rata_rata || umkm.rating_rata_rata || 0;

    return (
      <div>
        <nav className="det-navbar">
          <Link to="/direktori" className="det-back-btn" title="Kembali">←</Link>
          <Link to="/" className="det-nav-brand">IPB Food Hub</Link>
          <div className="det-nav-right">
            <button className="det-icon-btn" title="Keranjang" onClick={() => this.props.navigate('/keranjang')}>🛒</button>
            <button className="det-icon-btn" title="Notifikasi">🔔</button>
            <div className="det-avatar">{this.getInitial(user.nama)}</div>
          </div>
        </nav>

        <div className="det-banner">
          {umkm.foto_toko
            ? <img
                src={getImageUrl(umkm.foto_toko)}
                alt={umkm.nama_umkm}
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            : (FOOD_ICONS[umkm.kategori] || FOOD_ICONS.default)
          }
        </div>

        <div className="det-content">
          <div className="det-info-card">
            <div className="det-info-left">
              <div className="det-info-tags">
                <span className="det-tag">{KATEGORI_MAP[umkm.kategori] || umkm.kategori}</span>
              </div>

              {ratingVal > 0 && (
                <div className="det-rating-row">
                  <div className="det-stars">{this.renderStars(ratingVal)}</div>
                  <span className="det-rating-num">{ratingVal.toFixed(1)}</span>
                  {ratingSummary?.total_ulasan > 0 && (
                    <span className="det-rating-count">({ratingSummary.total_ulasan.toLocaleString()} Ulasan)</span>
                  )}
                </div>
              )}

              <div className="det-info-name">{umkm.nama_umkm}</div>

              <div className="det-info-meta">
                <span>📍 {umkm.alamat}</span>
                <span>
                  <span className={isBuka ? 'det-status-open' : 'det-status-close'}>
                    {isBuka ? '● Buka' : '● Tutup'}
                  </span>
                  &nbsp;· {umkm.jam_buka} - {umkm.jam_tutup}
                </span>
              </div>
            </div>

            <button className="det-share-btn" onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Link disalin!');
            }}>
              🔗 Bagikan
            </button>
          </div>

          <div className="det-main-grid">
            <div className="det-tabs">
              <div className="det-tab-bar">
                {['menu', 'ulasan', 'promo'].map((tab) => (
                  <button
                    key={tab}
                    className={`det-tab-btn${activeTab === tab ? ' active' : ''}`}
                    onClick={() => this.setState({ activeTab: tab })}
                  >
                    {tab === 'menu' ? 'Menu' : tab === 'ulasan' ? 'Ulasan' : 'Promo'}
                  </button>
                ))}
              </div>

              <div className="det-tab-content">
                {activeTab === 'menu'   && this.renderMenuTab()}
                {activeTab === 'ulasan' && this.renderUlasanTab()}
                {activeTab === 'promo'  && this.renderPromoTab()}
              </div>
            </div>

            <div className="det-sidebar">
              <div className="det-sidebar-card">
                <div className="det-sidebar-title">Informasi Warung</div>

                {umkm.nama_pemilik && (
                  <div className="det-info-row">
                    <span className="di">🏪</span>
                    <div>
                      <div className="dl">Dikelola oleh</div>
                      <div className="dv">{umkm.nama_pemilik}</div>
                    </div>
                  </div>
                )}

                <div className="det-info-row">
                  <span className="di">🕐</span>
                  <div>
                    <div className="dl">Jam Operasional</div>
                    <div className="dv">{umkm.jam_buka} – {umkm.jam_tutup}</div>
                  </div>
                </div>

                <div className="det-info-row">
                  <span className="di">📍</span>
                  <div>
                    <div className="dl">Lokasi</div>
                    <div className="dv">{umkm.alamat}</div>
                  </div>
                </div>

                <div className="det-info-row">
                  <span className="di">✅</span>
                  <div>
                    <div className="dl">Status UMKM</div>
                    <div className="dv" style={{ color: '#006B3F', fontWeight: 600 }}>
                      Terverifikasi IPB Food Hub
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {cartCount > 0 && (
          <div className="det-cart-bar">
            <div className="det-cart-info">
              <div className="det-cart-label">Total Pesanan</div>
              <div className="det-cart-summary">
                {cartCount} item &bull; {this.formatPrice(cartTotal)}
              </div>
            </div>
            <button
              className="det-cart-btn"
              onClick={() => this.props.navigate('/keranjang')}
            >
              Lihat Keranjang →
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(DetailUMKMPage);
