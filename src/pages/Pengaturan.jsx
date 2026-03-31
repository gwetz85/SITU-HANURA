import React, { useState } from 'react';
import { Settings, Lock, Palette, Smartphone, Globe, Bell, Save, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Pengaturan = () => {
  const { user } = useAuth();
  const [activeSub, setActiveSub] = useState('profil');

  const settingsMenu = [
    { id: 'profil', label: 'Profil Saya', icon: <User size={18} /> },
    { id: 'keamanan', label: 'Keamanan & Sandi', icon: <Lock size={18} /> },
    { id: 'tampilan', label: 'Tampilan Aplikasi', icon: <Palette size={18} /> },
    { id: 'perangkat', label: 'Manajemen Perangkat', icon: <Smartphone size={18} /> },
    { id: 'notifikasi', label: 'Notifikasi', icon: <Bell size={18} /> },
  ];

  return (
    <div className="settings-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Pengaturan</h1>
          <p>Kelola preferensi akun dan sistem aplikasi Anda.</p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar glass-card">
          {settingsMenu.map(item => (
            <button 
              key={item.id}
              className={`settings-menu-item ${activeSub === item.id ? 'active' : ''}`}
              onClick={() => setActiveSub(item.id)}
            >
              <span className="item-left">
                {item.icon}
                <span className="item-label">{item.label}</span>
              </span>
              <ChevronRight size={16} className="chevron" />
            </button>
          ))}
        </aside>

        <main className="settings-content">
          {activeSub === 'profil' && (
            <div className="settings-section glass-card animate-slide-up">
              <div className="section-header">
                <h3>Informasi Profil</h3>
                <p>Data identitas Anda di sistem SITU HANURA.</p>
              </div>
              <div className="settings-form">
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input type="text" defaultValue={user?.username} />
                </div>
                <div className="form-group">
                  <label>Jabatan / Peran</label>
                  <input type="text" defaultValue={user?.role} disabled />
                  <span className="input-info">Peran hanya dapat diubah oleh Administrator Utama.</span>
                </div>
                <div className="form-group">
                  <label>Email Kantor</label>
                  <input type="email" placeholder="admin@hanura-tpi.org" />
                </div>
                <button className="btn btn-primary mt-2">
                  <Save size={18} /> <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          )}

          {activeSub === 'keamanan' && (
            <div className="settings-section glass-card animate-slide-up">
              <div className="section-header">
                <h3>Ubah Kata Sandi</h3>
                <p>Gunakan kombinasi sandi yang kuat untuk keamanan akun.</p>
              </div>
              <div className="settings-form">
                <div className="form-group">
                  <label>Sandi Saat Ini</label>
                  <input type="password" />
                </div>
                <div className="form-group">
                  <label>Sandi Baru</label>
                  <input type="password" />
                </div>
                <div className="form-group">
                  <label>Konfirmasi Sandi Baru</label>
                  <input type="password" />
                </div>
                <button className="btn btn-primary mt-2">
                  <Lock size={18} /> <span>Perbarui Kata Sandi</span>
                </button>
              </div>
            </div>
          )}

          {activeSub === 'tampilan' && (
            <div className="settings-section glass-card animate-slide-up">
              <div className="section-header">
                <h3>Personalisasi</h3>
                <p>Sesuaikan tampilan aplikasi agar nyaman digunakan.</p>
              </div>
              <div className="appearance-options">
                <div className="option-item">
                  <div className="option-info">
                    <span className="option-label">Mode Gelap (Dark Mode)</span>
                    <p className="option-desc">Ubah tema aplikasi menjadi gelap untuk penggunaan malam hari.</p>
                  </div>
                  <div className="toggle-switch">
                    <input type="checkbox" id="dark-mode" />
                    <label htmlFor="dark-mode"></label>
                  </div>
                </div>
                <div className="option-item">
                  <div className="option-info">
                    <span className="option-label">Bahasa Aplikasi</span>
                    <p className="option-desc">Pilih bahasa yang digunakan di seluruh interface.</p>
                  </div>
                  <select className="settings-select">
                    <option>Bahasa Indonesia</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSub === 'perangkat' && (
            <div className="settings-section glass-card animate-slide-up">
              <div className="section-header">
                <h3>Satu User Satu Perangkat</h3>
                <p>Status perangkat yang saat ini terhubung dengan akun Anda.</p>
              </div>
              <div className="device-status glass-card active">
                <div className="device-icon"><Smartphone /></div>
                <div className="device-info">
                  <span className="device-name">Perangkat Saat Ini (Laptop/Desktop)</span>
                  <p className="device-meta">ID: {localStorage.getItem('situ_hanura_device_id')}</p>
                  <span className="status-label">AKTIF</span>
                </div>
              </div>
              <p className="device-warning">
                <Globe size={14} /> Beroperasi di bawah kebijakan keamanan 1 User = 1 Perangkat Aktif.
              </p>
            </div>
          )}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .settings-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .settings-layout { display: flex; gap: 1.5rem; align-items: flex-start; }
        
        .settings-sidebar { width: 260px; padding: 0.75rem; flex-shrink: 0; }
        .settings-menu-item {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 0.9rem 1.25rem; border-radius: var(--radius-md); color: var(--text-muted);
          transition: all 0.2s; margin-bottom: 0.25rem;
        }
        .settings-menu-item:hover { background: var(--background); color: var(--primary); }
        .settings-menu-item.active { background: rgba(37,99,235,0.1); color: var(--primary); font-weight: 700; }
        
        .item-left { display: flex; align-items: center; gap: 0.75rem; }
        .item-label { font-size: 0.9rem; }
        .chevron { opacity: 0.3; }
        .active .chevron { opacity: 1; transform: translateX(3px); }

        .settings-content { flex: 1; }
        .settings-section { padding: 2rem; }
        .section-header { border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .section-header h3 { font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
        .section-header p { font-size: 0.9rem; color: var(--text-muted); }

        .settings-form { display: flex; flex-direction: column; gap: 1.25rem; max-width: 500px; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
        .form-group input { 
          padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);
          background: var(--background); font-size: 0.95rem; transition: border-color 0.2s;
        }
        .form-group input:focus { outline: none; border-color: var(--primary); }
        .input-info { font-size: 0.75rem; color: var(--text-muted); }

        .appearance-options { display: flex; flex-direction: column; gap: 1.5rem; }
        .option-item { display: flex; justify-content: space-between; align-items: center; }
        .option-label { font-size: 0.95rem; font-weight: 700; color: var(--text-main); }
        .option-desc { font-size: 0.8rem; color: var(--text-muted); }

        .settings-select { padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid var(--border); font-weight: 600; }

        .device-status { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem; border: 2px solid var(--border); }
        .device-status.active { border-color: var(--primary); background: rgba(37,99,235,0.02); }
        .device-icon { width: 50px; height: 50px; border-radius: 12px; background: var(--background); display: flex; align-items: center; justify-content: center; color: var(--primary); }
        .device-info { display: flex; flex-direction: column; gap: 2px; }
        .device-name { font-weight: 700; font-size: 0.95rem; }
        .device-meta { font-size: 0.75rem; color: var(--text-muted); font-family: monospace; }
        .status-label { font-size: 0.65rem; font-weight: 800; color: var(--primary); background: rgba(37,99,235,0.1); padding: 2px 8px; border-radius: 4px; width: fit-content; margin-top: 4px; }
        .device-warning { margin-top: 1rem; font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; font-weight: 600; }

        .mt-2 { margin-top: 0.5rem; }

        @media (max-width: 768px) {
          .settings-layout { flex-direction: column; }
          .settings-sidebar { width: 100%; order: 2; }
          .settings-content { order: 1; width: 100%; }
        }
      ` }} />
    </div>
  );
};

export default Pengaturan;
