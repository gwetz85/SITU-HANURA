import React, { useState } from 'react';
import { 
  Settings, Lock, Palette, Smartphone, Globe, Bell, Save, ChevronRight, User, 
  Trash2, AlertTriangle, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, remove } from 'firebase/database';

const Pengaturan = () => {
  const { user } = useAuth();
  const [activeSub, setActiveSub] = useState('profil');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const isAdmin = user?.role === 'Admin';

  const settingsMenu = [
    { id: 'profil', label: 'Profil Saya', icon: <User size={18} /> },
    { id: 'keamanan', label: 'Keamanan & Sandi', icon: <Lock size={18} /> },
    { id: 'tampilan', label: 'Tampilan Aplikasi', icon: <Palette size={18} /> },
    { id: 'perangkat', label: 'Manajemen Perangkat', icon: <Smartphone size={18} /> },
    ...(isAdmin ? [{ id: 'sistem', label: 'Sistem & Data', icon: <Settings size={18} /> }] : []),
  ];

  const handleResetDatabase = async () => {
    if (resetConfirmText !== 'RESET' || !db) return;
    
    setIsResetting(true);
    try {
      const nodes = ['surat_masuk', 'surat_keluar', 'kas', 'karyawan', 'pustaka', 'stats'];
      await Promise.all(nodes.map(node => remove(ref(db, node))));
      
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setIsResetModalOpen(false);
        setResetConfirmText('');
      }, 3000);
    } catch (err) {
      alert("Gagal mereset data: " + err.message);
    } finally {
      setIsResetting(false);
    }
  };

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
                  <input type="text" defaultValue={user?.name || user?.username} />
                </div>
                <div className="form-group">
                  <label>Jabatan / Peran</label>
                  <input type="text" defaultValue={user?.role} disabled />
                  <span className="input-info">Peran hanya dapat diubah oleh Administrator Utama.</span>
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" defaultValue={user?.username} disabled />
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
                <h3>Personalisasi Tampilan</h3>
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
                <h3>Manajemen Sesi Perangkat</h3>
                <p>Status perangkat yang saat ini terhubung dengan akun Anda.</p>
              </div>
              <div className="device-status glass-card active">
                <div className="device-icon"><Smartphone /></div>
                <div className="device-info">
                  <span className="device-name">Perangkat Saat Ini</span>
                  <p className="device-meta">ID: {localStorage.getItem('situ_hanura_device_id')}</p>
                  <span className="status-label">AKTIF (ONLINE)</span>
                </div>
              </div>
              <p className="device-warning">
                <Globe size={14} /> Keamanan ketat: Hanya diizinkan 1 perangkat per akun.
              </p>
            </div>
          )}

          {activeSub === 'sistem' && isAdmin && (
            <div className="settings-section glass-card animate-slide-up danger-section">
              <div className="section-header">
                <h3 className="text-danger">Sistem & Manajemen Data</h3>
                <p>Fitur pemeliharaan sistem tingkat lanjut. Gunakan dengan hati-hati.</p>
              </div>
              
              <div className="danger-zone">
                <div className="danger-card">
                  <div className="danger-info">
                    <div className="danger-header">
                      <AlertTriangle color="#ef4444" size={24} />
                      <h4>Reset Keseluruhan Data Aplikasi</h4>
                    </div>
                    <p>
                      Tindakan ini akan menghapus **seluruh data** (Surat Menyurat, Kas Office, Karyawan, Pustaka, dan Statistik Dashboard). Akun pengguna tidak akan dihapus. 
                    </p>
                  </div>
                  <button className="btn btn-danger" onClick={() => setIsResetModalOpen(true)}>
                    <Trash2 size={18} /> <span>Mulai Pembersihan Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {isResetModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-scale-up">
            <div className="modal-header">
              <AlertTriangle className="text-danger" size={32} />
              <h2>Konfirmasi Reset Data</h2>
            </div>
            <div className="modal-body">
              {resetSuccess ? (
                <div className="success-view">
                   <CheckCircle2 color="#10b981" size={48} />
                   <h3>Data Berhasil Direset!</h3>
                   <p>Seluruh data sistem telah dikembalikan ke nol.</p>
                </div>
              ) : (
                <>
                  <p className="warning-text">
                    Tindakan ini permanen dan **tidak dapat dibatalkan**. Semua catatan administrasi akan terhapus.
                  </p>
                  <div className="confirm-input-group">
                    <label>Ketik <strong>RESET</strong> untuk melanjutkan:</label>
                    <input 
                      type="text" 
                      className="confirm-input"
                      placeholder="Ketik disini..."
                      value={resetConfirmText}
                      onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                      disabled={isResetting}
                    />
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => setIsResetModalOpen(false)}
                      disabled={isResetting}
                    >Batal</button>
                    <button 
                      className="btn btn-danger" 
                      disabled={resetConfirmText !== 'RESET' || isResetting}
                      onClick={handleResetDatabase}
                    >
                      {isResetting ? <RefreshCw className="spinner" size={18} /> : <Trash2 size={18} />}
                      <span>{isResetting ? 'Sedang Menghapus...' : 'Ya, Hapus Semua Data'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .settings-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .settings-layout { display: flex; gap: 1.5rem; align-items: flex-start; }
        
        .settings-sidebar { width: 260px; padding: 0.75rem; flex-shrink: 0; }
        .settings-menu-item {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 0.9rem 1.25rem; border-radius: var(--radius-md); color: var(--text-muted);
          transition: all 0.2s; margin-bottom: 0.25rem; background: transparent; border: none; cursor: pointer;
        }
        .settings-menu-item:hover { background: var(--background); color: var(--primary); }
        .settings-menu-item.active { background: rgba(37,99,235,0.1); color: var(--primary); font-weight: 700; }
        
        .item-left { display: flex; align-items: center; gap: 0.75rem; }
        .item-label { font-size: 0.9rem; }
        .chevron { opacity: 0.3; }
        .active .chevron { opacity: 1; transform: translateX(3px); }

        .settings-content { flex: 1; min-width: 0; }
        .settings-section { padding: 2rem; }
        .section-header { border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
        .section-header h3 { font-size: 1.25rem; font-weight: 800; color: var(--text-main); }
        .section-header p { font-size: 0.9rem; color: var(--text-muted); margin-top: 5px; }
        .text-danger { color: #ef4444; }

        .settings-form { display: flex; flex-direction: column; gap: 1.25rem; max-width: 500px; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
        .form-group input { 
          padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);
          background: var(--background); font-size: 0.95rem; transition: border-color 0.2s; color: var(--text-main);
        }
        .form-group input:focus { outline: none; border-color: var(--primary); }
        .input-info { font-size: 0.75rem; color: var(--text-muted); opacity: 0.8; }

        .appearance-options { display: flex; flex-direction: column; gap: 1.5rem; }
        .option-item { display: flex; justify-content: space-between; align-items: center; }
        .option-label { font-size: 0.95rem; font-weight: 700; color: var(--text-main); }
        .option-desc { font-size: 0.8rem; color: var(--text-muted); max-width: 80%; }

        .settings-select { padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid var(--border); font-weight: 600; background: var(--background); }

        .device-status { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem; border: 2px solid var(--border); }
        .device-status.active { border-color: var(--primary); background: rgba(37,99,235,0.02); }
        .device-icon { width: 50px; height: 50px; border-radius: 12px; background: var(--background); display: flex; align-items: center; justify-content: center; color: var(--primary); }
        .device-info { display: flex; flex-direction: column; gap: 2px; }
        .device-name { font-weight: 700; font-size: 0.95rem; }
        .device-meta { font-size: 0.75rem; color: var(--text-muted); font-family: monospace; }
        .status-label { font-size: 0.65rem; font-weight: 800; color: var(--primary); background: rgba(37,99,235,0.1); padding: 2px 8px; border-radius: 4px; width: fit-content; margin-top: 4px; }
        .device-warning { margin-top: 1rem; font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; font-weight: 600; }

        /* Danger Zone Styles */
        .danger-section { border-left: 4px solid #ef4444; }
        .danger-zone { margin-top: 1rem; }
        .danger-card { background: rgba(239, 68, 68, 0.05); border: 1px dashed #ef4444; border-radius: 12px; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
        .danger-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
        .danger-header h4 { font-weight: 800; color: #ef4444; margin: 0; }
        .danger-info p { font-size: 0.85rem; color: var(--text-muted); margin: 0; line-height: 1.5; }
        .btn-danger { background: #ef4444; color: white; border: none; padding: 0.8rem 1.25rem; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; }
        .btn-danger:hover { background: #dc2626; }
        .btn-danger:disabled { background: #94a3b8; opacity: 0.6; cursor: not-allowed; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { width: 100%; max-width: 450px; padding: 2.5rem; text-align: center; }
        .modal-header { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .modal-header h2 { font-size: 1.5rem; font-weight: 800; margin: 0; }
        .warning-text { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }
        .confirm-input-group { text-align: left; margin-bottom: 2rem; }
        .confirm-input-group label { font-size: 0.85rem; display: block; margin-bottom: 0.5rem; color: var(--text-main); }
        .confirm-input { width: 100%; padding: 1rem; border-radius: 8px; border: 2px solid var(--border); background: var(--background); font-weight: 800; text-align: center; letter-spacing: 2px; color: var(--text-main); }
        .confirm-input:focus { border-color: #ef4444; outline: none; }
        .modal-actions { display: flex; gap: 1rem; }
        .modal-actions button { flex: 1; }
        .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 0.75rem; border-radius: 8px; cursor: pointer; font-weight: 700; }
        .btn-ghost:hover { background: var(--background); color: var(--text-main); }

        .success-view { padding: 2rem 0; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .success-view h3 { font-weight: 800; color: #10b981; }

        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); }

        @media (max-width: 768px) {
          .settings-layout { flex-direction: column; }
          .settings-sidebar { width: 100%; }
          .danger-card { flex-direction: column; text-align: center; }
        }
      ` }} />
    </div>
  );
};

export default Pengaturan;
