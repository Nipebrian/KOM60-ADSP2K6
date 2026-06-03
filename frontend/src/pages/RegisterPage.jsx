import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import heroImg from '../assets/hero.png';
import './Auth.css';

const FAKULTAS_OPTIONS = [
  'FAPERTA', 'SKHB', 'FPIK', 'FAPET', 'FAHUTAN',
  'FTT', 'FMIPA', 'FEM', 'FEMA', 'FK', 'SSMI',
];

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

class RegisterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      role: 'mahasiswa',
      nama: '',
      email: '',
      no_telp: '',
      nim: '',
      fakultas: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirm: false,
      error: '',
      loading: false,
      redirect: false,
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '' });
  };

  setRole = (role) => {
    this.setState({ role, nim: '', fakultas: '' });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = this.state;

    if (password.length < 8) {
      this.setState({ error: 'Password minimal 8 karakter.' });
      return;
    }
    if (password !== confirmPassword) {
      this.setState({ error: 'Konfirmasi password tidak cocok.' });
      return;
    }

    this.setState({ loading: true, error: '' });
    try {
      const payload = {
        nama: this.state.nama,
        email: this.state.email,
        password: this.state.password,
        role: this.state.role,
        no_telp: this.state.no_telp || null,
        nim: this.state.role === 'mahasiswa' ? this.state.nim || null : null,
        fakultas: this.state.role === 'mahasiswa' ? this.state.fakultas || null : null,
      };
      const res = await authAPI.register(payload);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      this.setState({ redirect: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      this.setState({ error: typeof detail === 'string' ? detail : 'Registrasi gagal. Coba lagi.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    if (this.state.redirect || localStorage.getItem('token')) {
          const user = JSON.parse(localStorage.getItem('user') || 'null');
          if (user?.role === 'mahasiswa') return <Navigate to="/" replace />;
          if (user?.role === 'umkm') return <Navigate to="/dashboard/umkm" replace />;
          return <Navigate to="/" replace />;
    }

    const {
      role, nama, email, no_telp, nim, fakultas,
      password, confirmPassword, showPassword, showConfirm, error, loading,
    } = this.state;

    const pwStrength = getPasswordStrength(password);
    const strengthLabel = ['', 'Lemah', 'Cukup', 'Bagus', 'Kuat'][pwStrength] || '';

    return (
      <div className="auth-wrapper register-mode">
        <div className="auth-left">
          <div className="auth-left-logo">
            <span className="logo-icon">🍽️</span>
            IPB Food Hub
          </div>
          <div className="auth-left-img-area">
            <img src={heroImg} alt="IPB Food Hub" />
          </div>
          <div className="auth-left-text">
            <h2>Bergabung dengan komunitas kuliner IPB 🎉</h2>
            <p>Daftarkan diri dan nikmati layanan pemesanan makanan dari ratusan UMKM kampus terbaik.</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <h1>Buat Akun Baru</h1>
            <p className="auth-subtitle" style={{ marginBottom: 20 }}>Pilih tipe akun Anda</p>

            <div className="role-toggle">
              <button
                type="button"
                className={`role-btn${role === 'mahasiswa' ? ' active' : ''}`}
                onClick={() => this.setRole('mahasiswa')}
              >
                <span className="role-icon">🎓</span>
                Mahasiswa
              </button>
              <button
                type="button"
                className={`role-btn${role === 'umkm' ? ' active' : ''}`}
                onClick={() => this.setRole('umkm')}
              >
                <span className="role-icon">🏪</span>
                Pelaku UMKM
              </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <div className="input-wrap">
                  <span className="iicon">👤</span>
                  <input
                    name="nama" type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    value={nama} onChange={this.handleChange} required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <div className="input-wrap">
                  <span className="iicon">✉</span>
                  <input
                    name="email" type="email"
                    placeholder="contoh@apps.ipb.ac.id"
                    value={email} onChange={this.handleChange} required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>No. Telepon</label>
                <div className="input-wrap">
                  <span className="iicon">📱</span>
                  <input
                    name="no_telp" type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={no_telp} onChange={this.handleChange}
                  />
                </div>
              </div>

              {role === 'mahasiswa' && (
                <>
                  <div className="form-group">
                    <label>NIM</label>
                    <div className="input-wrap">
                      <span className="iicon">🪪</span>
                      <input
                        name="nim" type="text"
                        placeholder="Masukkan NIM Anda"
                        value={nim} onChange={this.handleChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Fakultas</label>
                    <div className="input-wrap select-wrap">
                      <select
                        name="fakultas" value={fakultas}
                        onChange={this.handleChange} className="no-icon"
                        style={{ paddingLeft: 13 }}
                      >
                        <option value="">Pilih Fakultas</option>
                        {FAKULTAS_OPTIONS.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <span className="iicon">🔒</span>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter"
                    value={password} onChange={this.handleChange} required minLength={8}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn"
                    onClick={() => this.setState({ showPassword: !showPassword })}>
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {password && (
                  <div className="pw-strength">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`pw-bar${
                        i <= pwStrength
                          ? pwStrength <= 1 ? ' weak' : pwStrength <= 2 ? ' medium' : ' strong'
                          : ''
                      }`} />
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Konfirmasi Password</label>
                <div className="input-wrap">
                  <span className="iicon">🔒</span>
                  <input
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={confirmPassword} onChange={this.handleChange} required
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn"
                    onClick={() => this.setState({ showConfirm: !showConfirm })}>
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>

            <p className="auth-link-row" style={{ marginTop: 16 }}>
              Sudah punya akun? <Link to="/login">Masuk</Link>
            </p>
          </div>

          <p className="auth-copyright">© 2026 IPB Food Hub — Kelompok 6 P2</p>
        </div>
      </div>
    );
  }
}

export default RegisterPage;
