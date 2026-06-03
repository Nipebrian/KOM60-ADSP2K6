import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const HomePage           = lazy(() => import('./pages/HomePage'));
const DirektoriPage      = lazy(() => import('./pages/DirektoriPage'));
const DetailUMKMPage     = lazy(() => import('./pages/DetailUMKMPage'));
const KeranjangPage      = lazy(() => import('./pages/KeranjangPage'));
const UploadBuktiPage    = lazy(() => import('./pages/UploadBuktiPage'));
const PesananPage        = lazy(() => import('./pages/PesananPage'));
const DashboardUMKMPage  = lazy(() => import('./pages/DashboardUMKMPage'));
const KelolaMenuPage     = lazy(() => import('./pages/KelolaMenuPage'));
const PesananMasukPage   = lazy(() => import('./pages/PesananMasukPage'));
const KelolaPromoPage    = lazy(() => import('./pages/KelolaPromoPage'));
const DashboardAdminPage    = lazy(() => import('./pages/DashboardAdminPage'));
const KelolaAkunPage        = lazy(() => import('./pages/KelolaAkunPage'));
const SecurityDashboardPage = lazy(() => import('./pages/SecurityDashboardPage'));
const AuditLogPage          = lazy(() => import('./pages/AuditLogPage'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1rem', color: '#888' }}>Memuat...</div>}>
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
          <Route path="/dashboard/admin"                    element={<DashboardAdminPage />} />
          <Route path="/dashboard/admin/users"              element={<KelolaAkunPage />} />
          <Route path="/dashboard/admin/security"           element={<SecurityDashboardPage />} />
          <Route path="/dashboard/admin/security/logs"      element={<AuditLogPage />} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
