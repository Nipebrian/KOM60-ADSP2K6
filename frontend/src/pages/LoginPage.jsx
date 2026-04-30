import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
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
      const res = await authAPI.login({
        email: this.state.email,
        password: this.state.password,
      });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      this.setState({ redirect: true });
    } catch (err) {
      this.setState({
        error: err.response?.data?.detail || 'Login gagal. Coba lagi.',
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    if (this.state.redirect || localStorage.getItem('token')) {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-logo">🍔 IPB Food Hub</h1>
            <p className="auth-subtitle">Masuk ke akunmu</p>
          </div>

          {this.state.error && (
            <div className="auth-error">{this.state.error}</div>
          )}

          <form onSubmit={this.handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="nama@email.com"
                value={this.state.email}
                onChange={this.handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={this.state.password}
                onChange={this.handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={this.state.loading}
            >
              {this.state.loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="auth-switch">
            Belum punya akun? <Link to="/register">Daftar di sini</Link>
          </p>
        </div>
      </div>
    );
  }
}

export default LoginPage;
