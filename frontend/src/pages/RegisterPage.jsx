import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

class RegisterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nama: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'mahasiswa',
      no_telp: '',
      nim: '',
      fakultas: '',
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
    if (this.state.password !== this.state.confirmPassword) {
      this.setState({ error: 'Password tidak cocok' });
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
        nim: this.state.role === 'mahasiswa' ? this.state.nim : null,
        fakultas: this.state.role === 'mahasiswa' ? this.state.fakultas : null,
      };
      const res = await authAPI.register(payload);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      this.setState({ redirect: true });
    } catch (err) {
      this.setState({
        error: err.response?.data?.detail || 'Registrasi gagal.',
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    if (this.state.redirect) return <Navigate to="/" replace />;

    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-logo">🍔 IPB Food Hub</h1>
            <p className="auth-subtitle">Buat akun baru</p>
          </div>

          {this.state.error && (
            <div className="auth-error">{this.state.error}</div>
          )}

          <form onSubmit={this.handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="role">Daftar sebagai</label>
              <select id="role" name="role" value={this.state.role} onChange={this.handleChange}>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="umkm">Pelaku UMKM</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="nama">Nama Lengkap</label>
              <input id="nama" name="nama" placeholder="Nama lengkap" value={this.state.nama} onChange={this.handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input id="reg-email" type="email" name="email" placeholder="nama@email.com" value={this.state.email} onChange={this.handleChange} required />
            </div>

            {this.state.role === 'mahasiswa' && (
              <>
                <div className="form-group">
                  <label htmlFor="nim">NIM</label>
                  <input id="nim" name="nim" placeholder="G64XXXXXXX" value={this.state.nim} onChange={this.handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="fakultas">Fakultas</label>
                  <input id="fakultas" name="fakultas" placeholder="FMIPA" value={this.state.fakultas} onChange={this.handleChange} />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="no_telp">No. Telepon</label>
              <input id="no_telp" name="no_telp" placeholder="08xxxxxxxxxx" value={this.state.no_telp} onChange={this.handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" name="password" placeholder="Min. 6 karakter" value={this.state.password} onChange={this.handleChange} required minLength={6} />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>
              <input id="confirmPassword" type="password" name="confirmPassword" placeholder="Ulangi password" value={this.state.confirmPassword} onChange={this.handleChange} required />
            </div>

            <button type="submit" className="auth-btn" disabled={this.state.loading}>
              {this.state.loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="auth-switch">
            Sudah punya akun? <Link to="/login">Masuk di sini</Link>
          </p>
        </div>
      </div>
    );
  }
}

export default RegisterPage;
