import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import HomePage           from './pages/HomePage';
import DirektoriPage      from './pages/DirektoriPage';
import DetailUMKMPage     from './pages/DetailUMKMPage';
import KeranjangPage      from './pages/KeranjangPage';
import UploadBuktiPage    from './pages/UploadBuktiPage';
import PesananPage        from './pages/PesananPage';
import DashboardUMKMPage  from './pages/DashboardUMKMPage';
import KelolaMenuPage     from './pages/KelolaMenuPage';
import PesananMasukPage   from './pages/PesananMasukPage';
import KelolaPromoPage    from './pages/KelolaPromoPage';
import DashboardAdminPage from './pages/DashboardAdminPage';
import KelolaAkunPage     from './pages/KelolaAkunPage';

class App extends Component {
  render() {
    return (
      <Router basename="/KOM60-ADSP2K6">
        <Routes>
          {/* ── Auth ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Mahasiswa ── */}
          <Route path="/"                              element={<HomePage />} />
          <Route path="/direktori"                     element={<DirektoriPage />} />
          <Route path="/umkm/:umkmId"                  element={<DetailUMKMPage />} />
          <Route path="/keranjang"                     element={<KeranjangPage />} />
          <Route path="/pesanan"                       element={<PesananPage />} />
          <Route path="/pesanan/:pesananId/bayar"      element={<UploadBuktiPage />} />

          {/* ── UMKM Dashboard ── */}
          <Route path="/dashboard/umkm"                element={<DashboardUMKMPage />} />
          <Route path="/dashboard/umkm/menu"           element={<KelolaMenuPage />} />
          <Route path="/dashboard/umkm/pesanan"        element={<PesananMasukPage />} />
          <Route path="/dashboard/umkm/promo"          element={<KelolaPromoPage />} />

          {/* ── Admin Dashboard ── */}
          <Route path="/dashboard/admin"               element={<DashboardAdminPage />} />
          <Route path="/dashboard/admin/users"         element={<KelolaAkunPage />} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }
}

export default App;
