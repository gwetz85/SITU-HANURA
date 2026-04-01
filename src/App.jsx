import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SuratMenyurat from './pages/SuratMenyurat';
import KasOffice from './pages/KasOffice';
import Karyawan from './pages/Karyawan';
import Pustaka from './pages/Pustaka';
import ManajemenUser from './pages/ManajemenUser';
import Pengaturan from './pages/Pengaturan';
import About from './pages/About';
import RekapanKas from './pages/RekapanKas';
import ManajemenKegiatan from './pages/ManajemenKegiatan';
import ArsipKegiatan from './pages/ArsipKegiatan';
import Inventaris from './pages/Inventaris';
import PelayananMasyarakat from './pages/PelayananMasyarakat';
import RegistrasiNIB from './pages/RegistrasiNIB';
import RegistrasiHalal from './pages/RegistrasiHalal';
import DataPekerjaan from './pages/DataPekerjaan';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/pelayanan" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><PelayananMasyarakat /></ProtectedRoute>} />
      <Route path="/pelayanan/nib" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><RegistrasiNIB /></ProtectedRoute>} />
      <Route path="/pelayanan/halal" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><RegistrasiHalal /></ProtectedRoute>} />
      <Route path="/pelayanan/data" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><DataPekerjaan /></ProtectedRoute>} />
      
      <Route path="/surat" element={<Navigate to="/surat/masuk" replace />} />
      <Route path="/surat/masuk" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><SuratMenyurat type="masuk" /></ProtectedRoute>} />
      <Route path="/surat/keluar" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><SuratMenyurat type="keluar" /></ProtectedRoute>} />
      <Route path="/kas" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><KasOffice /></ProtectedRoute>} />
      <Route path="/kas/rekapan" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><RekapanKas /></ProtectedRoute>} />
      <Route path="/admin/kegiatan" element={<ProtectedRoute allowedRoles={['Admin']}><ManajemenKegiatan /></ProtectedRoute>} />
      <Route path="/admin/kegiatan/arsip" element={<ProtectedRoute allowedRoles={['Admin']}><ArsipKegiatan /></ProtectedRoute>} />
      <Route path="/karyawan" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><Karyawan /></ProtectedRoute>} />
      <Route path="/pustaka" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><Pustaka /></ProtectedRoute>} />
      <Route path="/inventaris" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas', 'Verifikator']}><Inventaris /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['Admin']}><ManajemenUser /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><Pengaturan /></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute allowedRoles={['Admin', 'Petugas']}><About /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
