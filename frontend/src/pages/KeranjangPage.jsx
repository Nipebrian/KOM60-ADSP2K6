import React, { Component } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { pesananAPI } from '../services/api';
import './KeranjangPage.css';

const formatRp = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

class KeranjangPage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.state = {
      user,
      cart,
      catatan: '',
      waktu: '',
      loading: false,
      error: '',
      redirect: null,
    };
  }

  getUmkmId() {
    const { cart } = this.state;
    if (!cart.length) return null;
    const first = cart[0].umkm_id;
    return cart.every(i => i.umkm_id === first) ? first : null;
  }

  getTotal = () =>
    this.state.cart.reduce((s, i) => s + i.harga * i.jumlah, 0);

  updateJumlah = (menuId, delta) => {
    const cart = this.state.cart
      .map(i => i.menu_id === menuId ? { ...i, jumlah: i.jumlah + delta } : i)
      .filter(i => i.jumlah > 0);
    localStorage.setItem('cart', JSON.stringify(cart));
    this.setState({ cart });
  };

  removeItem = (menuId) => {
    const cart = this.state.cart.filter(i => i.menu_id !== menuId);
    localStorage.setItem('cart', JSON.stringify(cart));
    this.setState({ cart });
  };

  handleSubmit = async () => {
    const { cart, catatan, waktu } = this.state;
    const umkmId = this.getUmkmId();

    if (!umkmId) {
      this.setState({ error: 'Item di keranjang berasal dari UMKM berbeda. Harap pesan dari satu UMKM.' });
      return;
    }
    if (!waktu) {
      this.setState({ error: 'Mohon pilih waktu pengambilan.' });
      return;
    }

    this.setState({ loading: true, error: '' });
    try {
      const res = await pesananAPI.create({
        umkm_id: umkmId,
        items: cart.map(i => ({ menu_id: i.menu_id, jumlah: i.jumlah })),
        catatan_pesanan: catatan,
        waktu_pengambilan: waktu,
      });
      localStorage.removeItem('cart');
      this.setState({ redirect: `/pesanan/${res.data.pesanan_id}/bayar` });
    } catch (err) {
      this.setState({ error: err.response?.data?.detail || 'Gagal membuat pesanan. Coba lagi.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { user, cart, catatan, waktu, loading, error, redirect } = this.state;
    if (!user) return <Navigate to="/login" replace />;
    if (redirect) return <Navigate to={redirect} replace />;

    const total = this.getTotal();
    const umkmId = this.getUmkmId();
    const namaUmkm = cart.length > 0 ? cart[0].nama_umkm : '';
    const multiUmkm = cart.length > 0 && !umkmId;

    return (
      <div className="kr-page">
        {/* ── NAVBAR ── */}
        <nav className="kr-navbar">
          <Link to="/" className="kr-logo">
            <span className="kr-logo-icon">🍽️</span>
            IPB Food Hub
          </Link>
          <div className="kr-nav-links">
            <Link to="/">Home</Link>
            <span className="kr-nav-sep">›</span>
            <Link to="/direktori">Restaurants</Link>
            <span className="kr-nav-sep">›</span>
            <span className="kr-nav-current">Keranjang Pesanan</span>
          </div>
          <Link to="/pesanan" style={{ textDecoration: 'none', fontSize: 14, fontWeight: 600, color: '#006B3F' }}>
            📋 Pesanan Saya
          </Link>
        </nav>

        <main className="kr-main">
          <h1 className="kr-heading">Keranjang Pesanan</h1>

          {cart.length === 0 ? (
            <div className="kr-empty">
              <div className="kr-empty-icon">🛒</div>
              <p>Keranjang kamu masih kosong.</p>
              <Link to="/direktori" className="kr-btn-primary">Jelajahi UMKM</Link>
            </div>
          ) : (
            <div className="kr-layout">
              {/* ═══ LEFT ═══ */}
              <div className="kr-left">

                {/* UMKM header bar */}
                <div className="kr-umkm-bar">
                  <span className="kr-umkm-icon">🏪</span>
                  <div className="kr-umkm-info">
                    <div className="kr-umkm-name">{namaUmkm}</div>
                    {multiUmkm && (
                      <div className="kr-warn">
                        ⚠️ Item dari beberapa UMKM berbeda—hapus salah satunya untuk melanjutkan.
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="kr-items-card">
                  {cart.map(item => (
                    <div key={item.menu_id} className="kr-item">
                      <div className="kr-item-img">
                        {item.foto_menu
                          ? <img src={item.foto_menu} alt={item.nama_menu} />
                          : <span>🍽️</span>}
                      </div>
                      <div className="kr-item-body">
                        <div className="kr-item-name">{item.nama_menu}</div>
                        <div className="kr-item-price">{formatRp(item.harga)}</div>
                      </div>
                      <div className="kr-item-controls">
                        <div className="kr-qty-row">
                          <button className="kr-qty-btn" onClick={() => this.updateJumlah(item.menu_id, -1)}>−</button>
                          <span className="kr-qty-val">{item.jumlah}</span>
                          <button className="kr-qty-btn" onClick={() => this.updateJumlah(item.menu_id, 1)}>+</button>
                        </div>
                        <button className="kr-delete-btn" onClick={() => this.removeItem(item.menu_id)} title="Hapus item">
                          🗑
                        </button>
                      </div>
                      <div className="kr-item-subtotal">{formatRp(item.harga * item.jumlah)}</div>
                    </div>
                  ))}
                </div>

                {/* Detail Pengambilan */}
                <div className="kr-detail-card">
                  <h3 className="kr-section-title">Detail Pengambilan</h3>
                  <div className="kr-form-group">
                    <label>Waktu Pengambilan</label>
                    <div className="kr-input-wrap">
                      <span className="kr-input-icon">🕐</span>
                      <input
                        type="datetime-local"
                        value={waktu}
                        onChange={e => this.setState({ waktu: e.target.value })}
                        className="kr-input"
                      />
                    </div>
                  </div>
                  <div className="kr-form-group">
                    <label>Catatan Pesanan (Opsional)</label>
                    <textarea
                      className="kr-textarea"
                      placeholder="Contoh: Sambel dipisah, minta sendok plastik..."
                      value={catatan}
                      onChange={e => this.setState({ catatan: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* ═══ RIGHT ═══ */}
              <div className="kr-right">
                <div className="kr-summary-card">
                  <h3 className="kr-section-title">Ringkasan Pesanan</h3>

                  <div className="kr-summary-rows">
                    {cart.map(item => (
                      <div key={item.menu_id} className="kr-summary-row">
                        <span className="kr-sum-label">{item.nama_menu} x{item.jumlah}</span>
                        <span className="kr-sum-val">{formatRp(item.harga * item.jumlah)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="kr-divider" />

                  <div className="kr-total-row">
                    <span>Total</span>
                    <span className="kr-total-price">{formatRp(total)}</span>
                  </div>

                  <div className="kr-metode-label">Metode Pembayaran</div>
                  <div className="kr-metode-box">
                    <label className="kr-radio-label">
                      <input type="radio" name="metode" defaultChecked />
                      Transfer Manual (Bank / E-Wallet / QRIS)
                    </label>
                  </div>

                  {error && <div className="kr-error">{error}</div>}

                  <button
                    className="kr-btn-submit"
                    onClick={this.handleSubmit}
                    disabled={loading || multiUmkm}
                  >
                    {loading ? 'Memproses...' : 'Buat Pesanan →'}
                  </button>

                  <p className="kr-note">
                    Dengan memesan, Anda menyetujui syarat dan ketentuan serta kebijakan privasi kami.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="kr-footer">
          <div className="kr-footer-inner">
            <div className="kr-footer-brand">
              <strong>IPB Food Hub</strong>
              <p>Bridging academic prestige and modern culinary convenience.</p>
            </div>
            <div className="kr-footer-col">
              <p>About Us</p><p>Contact Support</p><p>Terms of Service</p>
            </div>
            <div className="kr-footer-col">
              <p>Privacy Policy</p><p>Merchant Portal</p>
            </div>
          </div>
          <div className="kr-footer-bottom">
            © 2026 IPB FoodHub, Bridging academic heritage and modern convenience.
          </div>
        </footer>
      </div>
    );
  }
}

export default KeranjangPage;
