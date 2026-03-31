import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, get, update } from 'firebase/database';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    const savedUser = localStorage.getItem('situ_hanura_user');
    const currentDeviceId = getDeviceId();

    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Real-time verification for 1 user 1 device
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
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    // Attempt login against Firebase Users node
    try {
      // For simplicity in this demo, we check if the user exists
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
        // First time setup - create default users if none exist
        const defaults = {
          admin_01: { username: 'admin', password: 'admin', role: 'Admin', name: 'ADMIN DPC HANURA' },
          petugas_01: { username: 'petugas', password: 'petugas', role: 'Petugas', name: 'PETUGAS HANURA' },
          verif_01: { username: 'verifikator', password: 'verifikator', role: 'Verifikator', name: 'VERIFIKATOR HANURA' }
        };
        await set(ref(db, 'users'), defaults);
        // Retry
        return login(username, password);
      }

      if (foundUser) {
        const devId = getDeviceId();
        // Set this device as active in Firebase
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
    if (user) {
      update(ref(db, `users/${user.id}`), { activeDevId: null });
    }
    localStorage.removeItem('situ_hanura_user');
    setUser(null);
  };

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
