import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import heroImg from '../assets/hero.png';
import './Auth.css';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      showPassword: false,
      error: '',
      loading: false,
      redirect: false,
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '' });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: '' });
    try {
      const res = await authAPI.login({ email: this.state.email, password: this.state.password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      this.setState({ redirect: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      this.setState({
        error: typeof detail === 'string' && detail
          ? detail
          : 'Email atau password salah.',
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    if (this.state.redirect || localStorage.getItem('token')) {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user?.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
      if (user?.role === 'umkm') return <Navigate to="/dashboard/umkm" replace />;
      return <Navigate to="/" replace />;
    }

    const { email, password, showPassword, error, loading } = this.state;

    return (
      <div className="auth-wrapper">
        <div className="auth-left">
          <div className="auth-left-logo">
            <span className="logo-icon">🍽️</span>
            IPB Food Hub
          </div>
          <div className="auth-left-img-area">
            <img src={heroImg} alt="IPB Food Hub" />
          </div>
          <div className="auth-left-text">
            <h2>Pesan makan tanpa antre.</h2>
            <p>Nikmati kemudahan memesan makanan dari kantin-kantin terbaik di lingkungan kampus dengan cepat dan praktis.</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <h1>Selamat Datang!</h1>
            <p className="auth-subtitle">Masuk ke akun IPB Food Hub kamu</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrap">
                  <span className="iicon">✉</span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="username@apps.ipb.ac.id"
                    value={email}
                    onChange={this.handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <span className="iicon">🔒</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={this.handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => this.setState({ showPassword: !showPassword })}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="auth-forgot">
                <a href="#">Lupa password?</a>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="auth-divider">ATAU</div>

            <p className="auth-link-row">
              Belum punya akun? <Link to="/register">Daftar di sini</Link>
            </p>
          </div>

          <p className="auth-copyright">© 2026 IPB Food Hub — Kelompok 6 P2</p>
        </div>
      </div>
    );
  }
}

export default LoginPage;
