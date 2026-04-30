import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import './HomePage.css';

class HomePage extends Component {
  constructor(props) {
    super(props);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.state = { user };
  }

  handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setState({ user: null });
  };

  render() {
    if (!this.state.user) return <Navigate to="/login" replace />;

    const { user } = this.state;

    return (
      <div className="home-container">
        <nav className="navbar">
          <div className="nav-brand">🍔 IPB Food Hub</div>
          <div className="nav-right">
            <span className="nav-user">Halo, {user.nama}!</span>
            <span className="nav-role">{user.role}</span>
            <button className="nav-logout" onClick={this.handleLogout}>Keluar</button>
          </div>
        </nav>

        <main className="home-main">
          <section className="hero">
            <h1>Selamat Datang di IPB Food Hub 🎉</h1>
            <p>Platform informasi dan pemesanan UMKM makanan di kampus IPB</p>
          </section>

          <section className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏪</div>
              <h3>Direktori UMKM</h3>
              <p>Jelajahi semua UMKM makanan di kampus IPB</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Pre-order</h3>
              <p>Pesan makanan lebih dulu, tanpa antri</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Pembayaran Digital</h3>
              <p>Bayar via transfer, e-wallet, atau QRIS</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Rating & Ulasan</h3>
              <p>Beri penilaian dan baca ulasan UMKM</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏷️</div>
              <h3>Promo</h3>
              <p>Temukan promo dan diskon menarik</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Dashboard</h3>
              <p>Kelola toko dan pantau penjualanmu</p>
            </div>
          </section>
        </main>
      </div>
    );
  }
}

export default HomePage;
