import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../pages/DashboardUMKM.css';

const NAV_ITEMS = [
  { icon: '▦', label: 'Dashboard',    path: '/dashboard/umkm' },
  { icon: '🍽', label: 'Kelola Menu',  path: '/dashboard/umkm/menu' },
  { icon: '📋', label: 'Pesanan Masuk', path: '/dashboard/umkm/pesanan' },
  { icon: '🏷', label: 'Kelola Promo', path: '/dashboard/umkm/promo' },
  { icon: '⚙', label: 'Pengaturan',   path: '/dashboard/umkm', settingsLink: true },
];

class UMKMSidebar extends Component {
  handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  render() {
    const { activePath, namaUmkm } = this.props;
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    return (
      <aside className="du-sidebar">
        <div className="du-sidebar-brand">
          <span className="du-brand-logo">🍽️</span>
          <div>
            <div className="du-brand-name">IPB Food Hub</div>
            <div className="du-brand-sub">Merchant Dashboard</div>
          </div>
        </div>

        <nav className="du-sidebar-nav">
          {NAV_ITEMS.map(item => {
            const isActive = item.settingsLink ? false : activePath === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                state={item.settingsLink ? { openProfile: true } : undefined}
                className={`du-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="du-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="du-sidebar-bottom">
          <button
            className="du-nav-item"
            onClick={this.handleLogout}
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontFamily: 'Inter, sans-serif' }}
          >
            <span className="du-nav-icon">🚪</span>
            Keluar
          </button>
        </div>
      </aside>
    );
  }
}

export default UMKMSidebar;
