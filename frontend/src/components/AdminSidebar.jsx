import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../pages/DashboardAdmin.css';

const NAV_ITEMS = [
  { icon: '▦', label: 'Dashboard',           path: '/dashboard/admin' },
  { icon: '👥', label: 'Kelola Akun',         path: '/dashboard/admin/users' },
  { icon: '🏪', label: 'Kelola UMKM',         path: '/dashboard/admin/umkm' },
  { icon: '📊', label: 'Monitor Transaksi',   path: '/dashboard/admin/transaksi' },
  { icon: '🛡️', label: 'Keamanan (AAA)',       path: '/dashboard/admin/security' },
  { icon: '⚙', label: 'Settings',            path: '/dashboard/admin/settings' },
];

class AdminSidebar extends Component {
  handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  render() {
    const { activePath } = this.props;
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    return (
      <aside className="da-sidebar">
        <div className="da-sidebar-brand">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span className="da-brand-icon">🍽️</span>
              <span className="da-brand-name">IPB Food Hub</span>
            </div>
            <div className="da-brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="da-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`da-nav-item ${activePath === item.path ? 'active' : ''}`}
            >
              <span className="da-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="da-sidebar-bottom">
          <div style={{ padding: '8px 12px', marginBottom: 4 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Login sebagai</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{user?.nama || 'Admin'}</div>
          </div>
          <button className="da-nav-item da-logout" onClick={this.handleLogout}>
            <span className="da-nav-icon">🚪</span>
            Keluar
          </button>
        </div>
      </aside>
    );
  }
}

export default AdminSidebar;
