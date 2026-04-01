import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, get, update, push } from 'firebase/database';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [configError, setConfigError] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('situ_hanura_theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('situ_hanura_language') || 'id');
  const [workingMonth, setWorkingMonthState] = useState(localStorage.getItem('situ_hanura_working_month') || (() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  })());

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
          console.error("Firebase Auth Listener Error:", err);
          if (err.message?.includes('permission_denied')) {
             setError('Firebase Database Permission Denied. Harap buka akses (Rules) di Firebase Console.');
          }
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

  // Theme & Language Persistence
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('situ_hanura_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('situ_hanura_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('situ_hanura_working_month', workingMonth);
  }, [workingMonth]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const updateLanguage = (lang) => setLanguage(lang);
  const setWorkingMonth = (month) => setWorkingMonthState(month);

  const login = async (username, password) => {
    if (!db) return false;
    setError('');
    try {
      const usersRef = ref(db, 'users');
      
      // Attempting to fetch users
      let snapshot;
      try {
        snapshot = await get(usersRef);
      } catch (err) {
        console.error("Firebase Fetch Error:", err);
        if (err.message?.includes('permission_denied')) {
          setError('Izin database ditolak (Permission Denied). Silakan cek Rules di Firebase Console Anda.');
        } else {
          setError('Gagal mengambil data dari database cloud.');
        }
        return false;
      }
      
      let foundUser = null;
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const u = child.val();
          if (u.username.toLowerCase() === username.toLowerCase() && u.password === password) {
            foundUser = { ...u, id: child.key };
          }
        });
      } else {
        // Initial setup for empty database
        const defaults = {
          admin_01: { username: 'admin', password: 'admin', role: 'Admin', name: 'ADMIN DPC HANURA' },
        };
        try {
          await set(ref(db, 'users'), defaults);
          return login(username, password);
        } catch (err) {
          setError('Database kosong dan gagal inisialisasi awal (Cek Izin Menulis).');
          return false;
        }
      }

      if (foundUser) {
        if (!foundUser.role) {
          setError('Akun Anda belum aktif. Hubungi Admin untuk verifikasi.');
          return false;
        }

        const devId = getDeviceId();
        try {
          await update(ref(db, `users/${foundUser.id}`), { activeDevId: devId });
        } catch (err) {
          console.error("Firebase Update Error:", err);
          if (err.message?.includes('permission_denied')) {
            setError('Gagal mencatat sesi login (Izin Menulis database ditolak).');
          } else {
            setError('Gangguan saat memperbarui sesi login.');
          }
          return false;
        }

        localStorage.setItem('situ_hanura_user', JSON.stringify(foundUser));
        setUser(foundUser);
        setError('');
        return true;
      } else {
        setError('Username atau password salah.');
        return false;
      }
    } catch (err) {
      console.error("General Login Error:", err);
      setError('Kesalahan sistem saat mencoba login.');
      return false;
    }
  };

  const register = async (name, username, password) => {
    if (!db) return false;
    setError('');
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      let exists = false;
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          if (child.val().username.toLowerCase() === username.toLowerCase()) {
            exists = true;
          }
        });
      }

      if (exists) {
        setError('Username sudah digunakan. Pilih username lain.');
        return false;
      }

      const newUser = {
        name,
        username,
        password,
        role: null, // Pending approval
        createdAt: new Date().toISOString(),
        activeDevId: null
      };

      await push(ref(db, 'users'), newUser);
      setError('');
      return true;
    } catch (err) {
      console.error("Registration Error:", err);
      if (err.message?.includes('permission_denied')) {
        setError('Gagal mendaftar: Izin Menulis database ditolak.');
      } else {
        setError('Terjadi kesalahan saat pendaftaran.');
      }
      return false;
    }
  };

  const updateProfile = async (userId, newData) => {
    if (!db) return false;
    try {
      await update(ref(db, `users/${userId}`), newData);
      
      // Update local state
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);
      localStorage.setItem('situ_hanura_user', JSON.stringify(updatedUser));
      return true;
    } catch (err) {
      console.error("Update Profile Error:", err);
      return false;
    }
  };

  const updateUserRole = async (userId, role) => {
    if (!db) return;
    try {
      await update(ref(db, `users/${userId}`), { role });
    } catch (err) {
      console.error(err);
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
              <li>Masuk ke <b>Settings &gt; Environment Variables</b>.</li>
              <li>Tambahkan variabel <code>VITE_FIREBASE_API_KEY</code> dan kunci lainnya.</li>
              <li>Lakukan <b>Redeploy</b> pada proyek Anda.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, login, register, updateProfile, updateUserRole, logout, 
      loading, error, setError, theme, toggleTheme, language, updateLanguage,
      workingMonth, setWorkingMonth
    }}>
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
