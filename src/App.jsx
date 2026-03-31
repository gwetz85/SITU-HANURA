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

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/surat/masuk" element={<ProtectedRoute><SuratMenyurat type="masuk" /></ProtectedRoute>} />
      <Route path="/surat/keluar" element={<ProtectedRoute><SuratMenyurat type="keluar" /></ProtectedRoute>} />
      <Route path="/kas" element={<ProtectedRoute><KasOffice /></ProtectedRoute>} />
      <Route path="/karyawan" element={<ProtectedRoute><Karyawan /></ProtectedRoute>} />
      <Route path="/pustaka" element={<ProtectedRoute><Pustaka /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><ManajemenUser /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Pengaturan /></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
