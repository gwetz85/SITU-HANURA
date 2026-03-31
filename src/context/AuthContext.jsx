import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, get, update } from 'firebase/database';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [configError, setConfigError] = useState(false);

  // Generate or get unique device ID
  const getDeviceId = () => {
    let devId = localStorage.getItem('situ_hanura_device_id');
    if (!devId) {
      devId = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('situ_hanura_device_id', devId);
    }
    return devId;
  };

  useEffect(() => {
    // Check if db was initialized successfully
    if (!db) {
      setConfigError(true);
      setLoading(false);
      return;
    }

    const savedUser = localStorage.getItem('situ_hanura_user');
    const currentDeviceId = getDeviceId();

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const userRef = ref(db, `users/${userData.id}/activeDevId`);
        const unsubscribe = onValue(userRef, (snapshot) => {
          const activeDevId = snapshot.val();
          if (activeDevId && activeDevId !== currentDeviceId) {
            logout();
            setError('Akun Anda sedang digunakan di perangkat lain.');
          } else {
            setUser(userData);
          }
          setLoading(false);
        }, (err) => {
          console.error("Firebase Listener Error:", err);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (e) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    if (!db) return false;
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      let foundUser = null;
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const u = child.val();
          if (u.username.toLowerCase() === username.toLowerCase() && u.password === password) {
            foundUser = { ...u, id: child.key };
          }
        });
      } else {
        const defaults = {
          admin_01: { username: 'admin', password: 'admin', role: 'Admin', name: 'ADMIN DPC HANURA' },
          petugas_01: { username: 'petugas', password: 'petugas', role: 'Petugas', name: 'PETUGAS HANURA' },
          verif_01: { username: 'verifikator', password: 'verifikator', role: 'Verifikator', name: 'VERIFIKATOR HANURA' }
        };
        await set(ref(db, 'users'), defaults);
        return login(username, password);
      }

      if (foundUser) {
        const devId = getDeviceId();
        await update(ref(db, `users/${foundUser.id}`), { activeDevId: devId });
        localStorage.setItem('situ_hanura_user', JSON.stringify(foundUser));
        setUser(foundUser);
        setError('');
        return true;
      } else {
        setError('Username atau password salah.');
        return false;
      }
    } catch (err) {
      console.error(err);
      setError('Kesalahan koneksi database.');
      return false;
    }
  };

  const logout = () => {
    if (user && db) {
      update(ref(db, `users/${user.id}`), { activeDevId: null });
    }
    localStorage.removeItem('situ_hanura_user');
    setUser(null);
  };

  if (configError) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ marginBottom: '20px', color: '#ef4444' }}>Konfigurasi Cloud Terputus</h2>
          <p style={{ lineHeight: '1.6', opacity: 0.8 }}>
            Aplikasi tidak dapat terhubung ke Firebase karena konfigurasi API key tidak ditemukan. 
          </p>
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'left', fontSize: '0.9rem' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Tindakan Diperlukan:</p>
            <ol style={{ marginLeft: '20px' }}>
              <li>Buka Vercel Dashboard Anda.</li>
              <li>Masuk ke <b>Settings > Environment Variables</b>.</li>
              <li>Tambahkan variabel <code>VITE_FIREBASE_API_KEY</code> dan kunci lainnya.</li>
              <li>Lakukan <b>Redeploy</b> pada proyek Anda.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, setError }}>
      {loading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '10px' }}>SITU HANURA</h2>
            <p style={{ opacity: 0.5 }}>Menghubungkan ke Cloud Database...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
