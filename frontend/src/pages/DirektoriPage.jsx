import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { umkmAPI, getImageUrl } from '../services/api';
import './DirektoriPage.css';

const KATEGORI_OPTIONS = [
  { key: 'makanan_berat', label: 'Makanan Berat' },
  { key: 'minuman',       label: 'Minuman' },
  { key: 'snack',         label: 'Snack' },
  { key: 'dessert',       label: 'Dessert' },
  { key: 'healthy_food',  label: 'Healthy Food' },
];

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

const PER_PAGE = 9;

class DirektoriPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const params = new URLSearchParams(window.location.search);
    const initKat = params.get('kategori') || '';
    const initSearch = params.get('search') || '';

    this.state = {
      user,
      umkms: [],
      total: 0,
      page: 1,
      loading: false,
      // sidebar filters (pending, applied on Terapkan)
      filterKategori: initKat ? [initKat] : [],
      filterStatus: 'semua',
      filterRating: 0,
      // applied filters used in API call
      appliedKategori: initKat ? [initKat] : [],
      appliedStatus: 'semua',
      appliedRating: 0,
      // search
      searchInput: initSearch,
      appliedSearch: initSearch,
      // sort
      sortBy: 'terpopuler',
    };
  }

  componentDidMount() {
    if (!this.state.user) return;
    this.fetchUmkms();
  }

  fetchUmkms = async (page = 1) => {
    this.setState({ loading: true });
    const { appliedKategori, appliedStatus, appliedSearch, sortBy } = this.state;

    const params = {
      page,
      per_page: PER_PAGE,
      search: appliedSearch || undefined,
      kategori: appliedKategori.length === 1 ? appliedKategori[0] : undefined,
      status: appliedStatus !== 'semua' ? appliedStatus : undefined,
    };

    try {
      const res = await umkmAPI.list(params);
      let data = res.data.data || [];

      if (sortBy === 'terpopuler') {
        data = data.sort((a, b) => (b.rating_rata_rata || 0) - (a.rating_rata_rata || 0));
      } else if (sortBy === 'az') {
        data = data.sort((a, b) => a.nama_umkm.localeCompare(b.nama_umkm));
      }

      const { appliedRating } = this.state;
      if (appliedRating > 0) {
        data = data.filter(u => (u.rating_rata_rata || 0) >= appliedRating);
      }

      this.setState({ umkms: data, total: res.data.total || 0, page });
    } catch {
      this.setState({ umkms: [], total: 0 });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleKategoriToggle = (key) => {
    this.setState((prev) => {
      const has = prev.filterKategori.includes(key);
      return {
        filterKategori: has
          ? prev.filterKategori.filter((k) => k !== key)
          : [...prev.filterKategori, key],
      };
    });
  };

  handleApplyFilter = () => {
    this.setState(
      (prev) => ({
        appliedKategori: prev.filterKategori,
        appliedStatus: prev.filterStatus,
        appliedRating: prev.filterRating,
        appliedSearch: prev.searchInput,
        page: 1,
      }),
      () => this.fetchUmkms(1)
    );
  };

  handleSearchSubmit = (e) => {
    e.preventDefault();
    this.setState(
      { appliedSearch: this.state.searchInput, page: 1 },
      () => this.fetchUmkms(1)
    );
  };

  handleSortChange = (e) => {
    this.setState({ sortBy: e.target.value }, () => this.fetchUmkms(this.state.page));
  };

  handlePageChange = (newPage) => {
    this.fetchUmkms(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  getInitial = (nama = '') => nama.charAt(0).toUpperCase() || 'U';

  renderPagination() {
    const { page, total } = this.state;
    const totalPages = Math.ceil(total / PER_PAGE);
    if (totalPages <= 1) return null;

    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="dir-pagination">
        <button
          className="dir-page-btn"
          onClick={() => this.handlePageChange(page - 1)}
          disabled={page === 1}
        >‹</button>

        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} className="dir-page-ellipsis">…</span>
            : (
              <button
                key={p}
                className={`dir-page-btn${p === page ? ' active' : ''}`}
                onClick={() => this.handlePageChange(p)}
              >{p}</button>
            )
        )}

        <button
          className="dir-page-btn"
          onClick={() => this.handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >›</button>
      </div>
    );
  }

  render() {
    const {
      user, umkms, total, loading,
      filterKategori, filterStatus, filterRating,
      searchInput, sortBy,
    } = this.state;

    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'umkm') return <Navigate to="/dashboard/umkm" replace />;
    if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;

    return (
      <div>
        <nav className="dir-navbar">
          <Link to="/" className="dir-nav-logo">🍽️ IPB Food Hub</Link>

          <div className="dir-nav-links">
            <Link to="/" className="dir-nav-link">Home</Link>
            <Link to="/direktori" className="dir-nav-link active">Directory</Link>
            <Link to="/pesanan" className="dir-nav-link">Pesanan Saya</Link>
          </div>

          <div className="dir-nav-right">
            <button className="dir-icon-btn" title="Notifikasi">🔔</button>
            <Link to="/keranjang" style={{ textDecoration: 'none' }}>
              <button className="dir-icon-btn" title="Keranjang">🛒</button>
            </Link>
            <div className="dir-avatar" title={user.nama}>
              {this.getInitial(user.nama)}
            </div>
          </div>
        </nav>

        <div className="dir-page">
          <aside className="dir-sidebar">
            <div className="dir-sidebar-card">
              <div className="dir-sidebar-title">⚙ Filters</div>

              <div className="dir-filter-group">
                <div className="dir-filter-label">Kategori</div>
                {KATEGORI_OPTIONS.map((k) => (
                  <div key={k.key} className="dir-checkbox-item">
                    <input
                      type="checkbox"
                      id={`kat-${k.key}`}
                      checked={filterKategori.includes(k.key)}
                      onChange={() => this.handleKategoriToggle(k.key)}
                    />
                    <label htmlFor={`kat-${k.key}`}>{k.label}</label>
                  </div>
                ))}
              </div>

              <div className="dir-divider" />

              <div className="dir-filter-group">
                <div className="dir-filter-label">Status</div>
                {[
                  { val: 'semua', label: 'Semua' },
                  { val: 'buka',  label: 'Buka Sekarang' },
                  { val: 'tutup', label: 'Tutup' },
                ].map((s) => (
                  <div key={s.val} className="dir-radio-item">
                    <input
                      type="radio"
                      id={`st-${s.val}`}
                      name="status"
                      value={s.val}
                      checked={filterStatus === s.val}
                      onChange={(e) => this.setState({ filterStatus: e.target.value })}
                    />
                    <label htmlFor={`st-${s.val}`}>{s.label}</label>
                  </div>
                ))}
              </div>

              <div className="dir-divider" />

              <div className="dir-filter-group">
                <div className="dir-filter-label">Rating</div>
                {[4, 3, 2, 1].map((r) => (
                  <div
                    key={r}
                    className="dir-rating-row"
                    onClick={() => this.setState({ filterRating: r })}
                    style={{ opacity: filterRating === r ? 1 : 0.6, cursor: 'pointer' }}
                  >
                    <span className="stars">{'★'.repeat(r)}{'☆'.repeat(5 - r)}</span>
                    <span className="up-label">& Up</span>
                  </div>
                ))}
              </div>

              <button className="dir-apply-btn" onClick={this.handleApplyFilter}>
                Terapkan Filter
              </button>
            </div>
          </aside>

          <div className="dir-content">
            <div className="dir-breadcrumb">
              <Link to="/">Home</Link>
              <span className="sep">›</span>
              <span className="current">Direktori UMKM</span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Direktori UMKM</h1>

            <div className="dir-topbar">
              <span className="dir-count">
                {loading ? 'Memuat...' : `Menampilkan ${total} UMKM`}
              </span>

              <div className="dir-topbar-right">
                <form onSubmit={this.handleSearchSubmit}>
                  <div className="dir-search-bar">
                    <span className="si">🔍</span>
                    <input
                      type="text"
                      placeholder="Cari UMKM..."
                      value={searchInput}
                      onChange={(e) => this.setState({ searchInput: e.target.value })}
                    />
                  </div>
                </form>

                <div className="dir-sort">
                  <span>Sort by:</span>
                  <select value={sortBy} onChange={this.handleSortChange}>
                    <option value="terpopuler">Terpopuler</option>
                    <option value="az">A → Z</option>
                    <option value="rating">Rating Tertinggi</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="dir-grid">
              {loading ? (
                <div className="dir-loading">
                  <div className="dir-spinner" />
                  Memuat UMKM...
                </div>
              ) : umkms.length === 0 ? (
                <div className="dir-loading">
                  Tidak ada UMKM yang sesuai filter.
                </div>
              ) : (
                umkms.map((u) => (
                  <Link key={u.umkm_id} to={`/umkm/${u.umkm_id}`} className="dir-card">
                    <div className="dir-card-img">
                      {u.foto_toko
                        ? <img
                            src={getImageUrl(u.foto_toko)}
                            alt={u.nama_umkm}
                            onError={e => {
                              const img = e.currentTarget;
                              img.parentNode.insertBefore(
                                document.createTextNode(FOOD_ICONS[u.kategori] || FOOD_ICONS.default),
                                img
                              );
                              img.remove();
                            }}
                          />
                        : (FOOD_ICONS[u.kategori] || FOOD_ICONS.default)
                      }
                      {u.rating_rata_rata > 0 && (
                        <div className="dir-rating-badge">
                          <span className="star">★</span>
                          {u.rating_rata_rata.toFixed(1)}
                        </div>
                      )}
                    </div>

                    <div className="dir-card-body">
                      <div className="dir-card-header">
                        <div className="dir-card-name">{u.nama_umkm}</div>
                        <div className={`dir-status-badge ${u.status_operasional === 'buka' ? 'buka' : 'tutup'}`}>
                          {u.status_operasional === 'buka' ? 'Buka' : 'Tutup'}
                        </div>
                      </div>

                      <div className="dir-card-address">
                        <span>📍</span>
                        <span>{u.alamat}</span>
                      </div>

                      <div className="dir-card-tags">
                        <span className="dir-tag">
                          {KATEGORI_MAP[u.kategori] || u.kategori}
                        </span>
                      </div>

                      <div className="dir-card-footer">
                        <div className="dir-card-hours">
                          <span>🕐</span>
                          <span>{u.jam_buka} - {u.jam_tutup}</span>
                        </div>
                        <span className="dir-lihat-menu">Lihat Menu</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {!loading && this.renderPagination()}
          </div>
        </div>
      </div>
    );
  }
}

export default DirektoriPage;
