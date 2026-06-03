import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { umkmAPI, promoAPI } from '../services/api';
import { withRouter } from '../utils/withRouter';
import './HomePage.css';

const KATEGORI_MAP = {
  makanan_berat: 'Makanan Berat',
  minuman: 'Minuman',
  snack: 'Snack',
  dessert: 'Dessert',
  healthy_food: 'Healthy Food',
};

const KATEGORI_LIST = [
  { key: 'makanan_berat', label: 'Makanan Berat', icon: '🍛' },
  { key: 'minuman',       label: 'Minuman',       icon: '☕' },
  { key: 'snack',         label: 'Snack',         icon: '🍿' },
  { key: 'dessert',       label: 'Dessert',       icon: '🍨' },
  { key: 'healthy_food',  label: 'Healthy Food',  icon: '🥗' },
];

const FOOD_ICONS = { makanan_berat: '🍛', minuman: '🧋', snack: '🍿', dessert: '🍮', healthy_food: '🥗', default: '🍽️' };

class HomePage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = {
      user,
      promos: [],
      umkms: [],
      loadingPromo: true,
      loadingUmkm: true,
      searchQuery: '',
      redirectLogin: false,
      redirectDirektori: false,
      searchRedirect: false,
    };
  }

  componentDidMount() {
    if (!this.state.user) return;
    this.fetchPromos();
    this.fetchUmkms();
  }

  fetchPromos = async () => {
    try {
      const res = await promoAPI.listAll();
      this.setState({ promos: res.data.slice(0, 3) });
    } catch {
      this.setState({ promos: [] });
    } finally {
      this.setState({ loadingPromo: false });
    }
  };

  fetchUmkms = async () => {
    try {
      const res = await umkmAPI.list({ per_page: 4, page: 1 });
      this.setState({ umkms: res.data.data || [] });
    } catch {
      this.setState({ umkms: [] });
    } finally {
      this.setState({ loadingUmkm: false });
    }
  };

  handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setState({ user: null, redirectLogin: true });
  };

  handleSearch = (e) => {
    e.preventDefault();
    if (this.state.searchQuery.trim()) {
      this.props.navigate(`/direktori?search=${encodeURIComponent(this.state.searchQuery)}`);
    }
  };

  handleKategori = (key) => {
    this.props.navigate(`/direktori?kategori=${key}`);
  };

  getInitial = (nama = '') => nama.charAt(0).toUpperCase() || 'U';

  renderStars = (rating) => {
    const rounded = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="star">{i < rounded ? '★' : '☆'}</span>
    ));
  };

  render() {
    const { user, promos, umkms, loadingPromo, loadingUmkm, redirectLogin, searchQuery } = this.state;

    if (redirectLogin || !user) return <Navigate to="/login" replace />;
    if (user.role === 'umkm') return <Navigate to="/dashboard/umkm" replace />;
    if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;

    return (
      <div>
        <nav className="hp-navbar">
          <div className="hp-nav-logo">
            <span className="logo-icon">🍽️</span>
            IPB Food Hub
          </div>

          <div className="hp-search-wrap">
            <form onSubmit={this.handleSearch}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Cari UMKM atau menu..."
                value={searchQuery}
                onChange={(e) => this.setState({ searchQuery: e.target.value })}
              />
            </form>
          </div>

          <div className="hp-nav-right">
            <Link to="/pesanan" style={{ textDecoration: 'none', fontSize: 14, fontWeight: 600, color: '#006B3F', marginRight: 4 }}>
              📋 Pesanan
            </Link>
            <Link to="/keranjang" style={{ textDecoration: 'none' }}>
              <button className="hp-icon-btn" title="Keranjang">🛒</button>
            </Link>
            <button className="hp-icon-btn" title="Notifikasi">🔔</button>

            <div className="hp-user-chip">
              <div className="hp-avatar">{this.getInitial(user.nama)}</div>
              <span className="hp-user-name">Halo, {user.nama.split(' ')[0]}!</span>
            </div>

            <button className="hp-logout-btn" onClick={this.handleLogout}>Keluar</button>
          </div>
        </nav>

        <main className="hp-main">
          <section className="hp-hero">
            <span className="hp-hero-deco">🍔</span>
            <div className="hp-hero-content">
              <h1>Temukan UMKM Favorit di Kampus IPB 🍔</h1>
              <p>Pesan makanan dari kantin dan UMKM mahasiswa, tanpa antri!</p>
              <Link to="/direktori" className="hp-hero-btn">
                Jelajahi UMKM →
              </Link>
            </div>
          </section>

          <section className="hp-section">
            <div className="hp-section-header">
              <h2 className="hp-section-title">
                <span>🏷️</span> Promo Hari Ini
              </h2>
            </div>

            {loadingPromo ? (
              <div className="hp-loading">
                <div className="hp-spinner" />
                Memuat promo...
              </div>
            ) : (
              <div className="hp-promo-grid">
                {promos.length === 0 ? (
                  <p className="hp-promo-empty">Belum ada promo aktif saat ini.</p>
                ) : (
                  promos.map((promo) => (
                    <div key={promo.promo_id} className="hp-promo-card">
                      <div>
                        <div className="hp-promo-badge">
                          {promo.diskon_persen ? `Diskon ${promo.diskon_persen}%` : promo.judul}
                        </div>
                        <div className="hp-promo-name">{promo.judul}</div>
                      </div>
                      <button className="hp-promo-btn">Klaim</button>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          <section className="hp-section">
            <div className="hp-section-header">
              <h2 className="hp-section-title">Kategori</h2>
            </div>
            <div className="hp-kategori-row">
              {KATEGORI_LIST.map((kat) => (
                <div
                  key={kat.key}
                  className="hp-kategori-item"
                  onClick={() => this.handleKategori(kat.key)}
                >
                  <div className="hp-kat-icon">{kat.icon}</div>
                  <span className="hp-kat-label">{kat.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="hp-section">
            <div className="hp-section-header">
              <h2 className="hp-section-title">
                <span>⭐</span> UMKM Populer
              </h2>
              <Link to="/direktori" className="hp-see-all">Lihat Semua →</Link>
            </div>

            {loadingUmkm ? (
              <div className="hp-loading">
                <div className="hp-spinner" />
                Memuat UMKM...
              </div>
            ) : (
              <div className="hp-umkm-grid">
                {umkms.length === 0 ? (
                  <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#6b7280', padding: 24 }}>
                    Belum ada UMKM terdaftar.
                  </p>
                ) : (
                  umkms.map((u) => (
                    <Link
                      key={u.umkm_id}
                      to={`/umkm/${u.umkm_id}`}
                      className="hp-umkm-card"
                    >
                      <div className="hp-card-img-wrap">
                        {u.foto_toko
                          ? <img src={u.foto_toko} alt={u.nama_umkm} />
                          : (FOOD_ICONS[u.kategori] || FOOD_ICONS.default)
                        }
                        <div className={`hp-card-status ${u.status_operasional === 'buka' ? 'buka' : 'tutup'}`}>
                          🏪 {u.status_operasional === 'buka' ? 'Buka' : 'Tutup'}
                        </div>
                      </div>
                      <div className="hp-card-body">
                        <div className="hp-card-name">{u.nama_umkm}</div>
                        <div className="hp-card-address">
                          <span>📍</span>
                          <span>{u.alamat}</span>
                        </div>
                        <div className="hp-card-footer">
                          <span className="hp-card-badge">
                            {KATEGORI_MAP[u.kategori] || u.kategori}
                          </span>
                          <div className="hp-card-rating">
                            <span className="star">★</span>
                            {u.rating_rata_rata ? u.rating_rata_rata.toFixed(1) : '—'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </section>
        </main>

        <footer className="hp-footer">
          <div className="hp-footer-inner">
            <div className="hp-footer-brand">
              <h3>IPB Food Hub</h3>
              <p>Bridging academic prestige and modern culinary convenience.</p>
            </div>
            <div className="hp-footer-col">
              <h4>Platform</h4>
              <ul>
                <li>About IPB Food Hub</li>
                <li>Campus Partners</li>
              </ul>
            </div>
            <div className="hp-footer-col">
              <h4>Layanan</h4>
              <ul>
                <li>Sustainability</li>
                <li>Help Center</li>
              </ul>
            </div>
            <div className="hp-footer-col">
              <h4>Legal</h4>
              <ul>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="hp-footer-bottom">
            © 2026 IPB Food Hub. Bridging academic prestige and modern culinary convenience.
          </div>
        </footer>
      </div>
    );
  }
}

export default withRouter(HomePage);
