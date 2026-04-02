import React, { useState, useEffect } from 'react';
import { 
  Settings, Lock, Palette, Smartphone, Globe, Bell, Save, ChevronRight, User, 
  Trash2, AlertTriangle, RefreshCw, CheckCircle2, Loader2, ShieldCheck, Zap,
  Upload, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, remove, push, set, update } from 'firebase/database';
import Modal from '../components/Modal';
import { logActivity } from '../utils/logging';

const Pengaturan = () => {
  const { user, updateProfile, theme, toggleTheme, language, updateLanguage } = useAuth();
  const [activeSub, setActiveSub] = useState('profil');
  
  // Profile State
  const [profileName, setProfileName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const t = {
    id: {
      p_title: 'Pengaturan',
      p_desc: 'Kelola preferensi akun dan sistem aplikasi Anda.',
      m_profile: 'Profil Saya',
      m_security: 'Keamanan & Sandi',
      m_appearance: 'Tampilan Aplikasi',
      m_device: 'Manajemen Perangkat',
      m_system: 'Sistem & Data',
      s_profile_title: 'Informasi Profil',
      s_profile_desc: 'Data identitas Anda di sistem SITU HANURA.',
      s_security_title: 'Ubah Kata Sandi',
      s_security_desc: 'Gunakan kombinasi sandi yang kuat untuk keamanan akun.',
      s_appearance_title: 'Personalisasi Tampilan',
      s_appearance_desc: 'Sesuaikan tampilan aplikasi agar nyaman digunakan.',
      label_cur_pass: 'Sandi Saat Ini',
      label_new_pass: 'Sandi Baru',
      label_conf_pass: 'Konfirmasi Sandi Baru',
      btn_update_pass: 'Perbarui Kata Sandi',
      label_dark: 'Mode Gelap (Dark Mode)',
      desc_dark: 'Ubah tema aplikasi menjadi gelap untuk penggunaan malam hari.',
      label_lang: 'Bahasa Aplikasi',
      desc_lang: 'Pilih bahasa yang digunakan di seluruh interface.'
    },
    en: {
      p_title: 'Settings',
      p_desc: 'Manage your account preferences and application system.',
      m_profile: 'My Profile',
      m_security: 'Security & Password',
      m_appearance: 'App Appearance',
      m_device: 'Device Management',
      m_system: 'System & Data',
      s_profile_title: 'Profile Information',
      s_profile_desc: 'Your identity data in SITU HANURA system.',
      s_security_title: 'Change Password',
      s_security_desc: 'Use a strong password combination for account security.',
      s_appearance_title: 'Appearance Personalization',
      s_appearance_desc: 'Adjust the application appearance for comfort.',
      label_cur_pass: 'Current Password',
      label_new_pass: 'New Password',
      label_conf_pass: 'Confirm New Password',
      btn_update_pass: 'Update Password',
      label_dark: 'Dark Mode',
      desc_dark: 'Change the application theme to dark for night use.',
      label_lang: 'Application Language',
      desc_lang: 'Choose the language used throughout the interface.'
    }
  }[language || 'id'];

  useEffect(() => {
    if (user) {
      setProfileName(user.name || user.username);
    }
  }, [user]);

  const isAdmin = user?.role === 'Admin';

  const settingsMenu = [
    { id: 'profil', label: t.m_profile, icon: <User size={18} /> },
    { id: 'keamanan', label: t.m_security, icon: <Lock size={18} /> },
    { id: 'tampilan', label: t.m_appearance, icon: <Palette size={18} /> },
    ...(isAdmin ? [
      { id: 'perangkat', label: t.m_device, icon: <Smartphone size={18} /> },
      { id: 'sistem', label: t.m_system, icon: <Settings size={18} /> }
    ] : []),
  ];

  const handleSaveProfile = async () => {
    if (!user || !profileName.trim()) return;
    
    setIsSavingProfile(true);
    const success = await updateProfile(user.id, { name: profileName });
    setIsSavingProfile(false);
    
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert("Gagal memperbarui profil. Periksa koneksi atau izin database.");
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Harap isi semua kolom sandi.");
      return;
    }

    if (currentPassword !== user.password) {
      alert("Sandi saat ini salah.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Konfirmasi sandi baru tidak cocok.");
      return;
    }

    setIsUpdatingPassword(true);
    const success = await updateProfile(user.id, { password: newPassword });
    setIsUpdatingPassword(false);

    if (success) {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } else {
      alert("Gagal memperbarui kata sandi.");
    }
  };

  const handleResetDatabase = async () => {
    if (resetConfirmText !== 'RESET' || !db) return;
    
    setIsResetting(true);
    try {
      const nodes = ['surat', 'cashbook', 'employees', 'pustaka', 'stats', 'keanggotaan'];
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

  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState('');

  const handleImportAnggota = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('Membaca file Excel...');
    setImportProgress(10);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          alert('File Excel kosong atau tidak valid.');
          setIsImporting(false);
          return;
        }

        setImportStatus(`Mengolah ${rawData.length} data anggota...`);
        setImportProgress(30);

        // Normalize data keys (mapping Excel columns to our DB schema)
        const normalizedData = rawData.map(row => {
          // Helper to find value regardless of case
          const getValue = (keys) => {
            const foundKey = Object.keys(row).find(k => {
              if (!k) return false;
              const upperK = k.toString().toUpperCase();
              return keys.some(key => upperK.includes(key));
            });
            const val = foundKey !== undefined ? row[foundKey] : '';
            return (val === undefined || val === null) ? '' : val.toString().trim();
          };

          return {
            namaLengkap: getValue(['NAMA LENGKAP', 'NAMA']),
            kta: getValue(['NOMOR KTA', 'KTA', 'NO KTA']),
            nik: getValue(['NIK', 'NOMOR INDUK KEPENDUDUKAN', 'IDENTITAS']),
            jenisKelamin: getValue(['JENIS KELAMIN', 'JK', 'GENDER']),
            tempatLahir: getValue(['TEMPAT LAHIR', 'TEMPAT']),
            tanggalLahir: getValue(['TANGGAL LAHIR', 'TGL LAHIR']),
            alamat: getValue(['ALAMAT', 'ALAMAT LENGKAP']),
            kecamatan: getValue(['KECAMATAN', 'KEC']),
            kelurahan: getValue(['KELURAHAN', 'KEL', 'DESA'])
          };
        });

        setImportStatus('Mengunggah ke database...');
        setImportProgress(60);

        // Save to Firebase (using a simple loop for now, batch update is better for very large data)
        const keanggotaanRef = ref(db, 'keanggotaan');
        
        // We wipe old data first based on user requirements "Hapus data anggota" 
        // but here we just append or let user wipe manually. 
        // The user said "Menu ini menampilkan data... di export tabel anggotanya... data ini bisa di hapus secara menyeluruh"
        // I will just append, and they can use the "Hapus Data" button in membership page or here.

        // Batch upload in chunks to avoid large request errors while maintaining speed
        const CHUNK_SIZE = 50;
        for (let i = 0; i < normalizedData.length; i += CHUNK_SIZE) {
          const chunk = normalizedData.slice(i, i + CHUNK_SIZE);
          const updates = {};
          
          chunk.forEach((member) => {
            const newKey = push(ref(db, 'keanggotaan')).key;
            updates[`/keanggotaan/${newKey}`] = {
              ...member,
              importedAt: new Date().toISOString()
            };
          });

          await update(ref(db), updates);
          
          const progress = 60 + Math.floor(((i + chunk.length) / normalizedData.length) * 35);
          setImportProgress(progress);
          setImportStatus(`Mengunggah ke database... (${i + chunk.length}/${normalizedData.length})`);
        }

        await logActivity(db, 'Sistem', `Berhasil mengimport ${normalizedData.length} data anggota Hanura secara massal`, user);
        
        setImportStatus('Selesai!');
        setImportProgress(100);
        setTimeout(() => {
          setIsImporting(false);
          setImportProgress(0);
          setImportStatus('');
          alert(`Berhasil mengimport ${rawData.length} data anggota.`);
        }, 1500);

      } catch (error) {
        console.error('Import error:', error);
        alert(`Gagal mengimport data: ${error.message || 'Pastikan format file benar.'}`);
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="settings-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>{t.p_title}</h1>
          <p>{t.p_desc}</p>
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
                <h3>{t.s_profile_title}</h3>
                <p>{t.s_profile_desc}</p>
              </div>
              <div className="settings-form">
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    disabled={isSavingProfile}
                  />
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
                
                <div className="action-area">
                  <button 
                    className={`btn btn-primary mt-2 ${saveSuccess ? 'btn-success' : ''}`}
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile || profileName === (user?.name || user?.username)}
                  >
                    {isSavingProfile ? (
                      <Loader2 size={18} className="spinner" />
                    ) : saveSuccess ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    <span>{isSavingProfile ? 'Menyimpan...' : saveSuccess ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
                  </button>
                  {saveSuccess && <span className="success-msg animate-fade-in">Data berhasil diperbarui ke cloud.</span>}
                </div>
              </div>
            </div>
          )}

          {activeSub === 'keamanan' && (
            <div className="settings-section glass-card animate-slide-up">
              <div className="section-header">
                <h3>{t.s_security_title}</h3>
                <p>{t.s_security_desc}</p>
              </div>
              <div className="settings-form">
                <div className="form-group">
                  <label>{t.label_cur_pass}</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>{t.label_new_pass}</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>{t.label_conf_pass}</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button 
                  className={`btn btn-primary mt-2 ${passwordSuccess ? 'btn-success' : ''}`}
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? <Loader2 size={18} className="spinner" /> : passwordSuccess ? <CheckCircle2 size={18} /> : <Lock size={18} />}
                  <span>{isUpdatingPassword ? '...' : passwordSuccess ? 'Updated!' : t.btn_update_pass}</span>
                </button>
              </div>
            </div>
          )}

          {activeSub === 'tampilan' && (
            <div className="settings-section glass-card animate-slide-up">
              <div className="section-header">
                <h3>{t.s_appearance_title}</h3>
                <p>{t.s_appearance_desc}</p>
              </div>
              <div className="appearance-options">
                <div className="option-item">
                  <div className="option-info">
                    <span className="option-label">{t.label_dark}</span>
                    <p className="option-desc">{t.desc_dark}</p>
                  </div>
                  <div className="toggle-switch">
                    <input 
                      type="checkbox" 
                      id="dark-mode" 
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                    />
                    <label htmlFor="dark-mode"></label>
                  </div>
                </div>
                <div className="option-item">
                  <div className="option-info">
                    <span className="option-label">{t.label_lang}</span>
                    <p className="option-desc">{t.desc_lang}</p>
                  </div>
                  <select 
                    className="settings-select"
                    value={language}
                    onChange={(e) => updateLanguage(e.target.value)}
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English (US)</option>
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

                <div className="danger-card mt-4" style={{ background: 'rgba(37, 99, 235, 0.05)', borderColor: 'var(--primary)', borderStyle: 'solid' }}>
                   <div className="danger-info">
                    <div className="danger-header">
                       <FileSpreadsheet color="var(--primary)" size={24} />
                       <h4 style={{ color: 'var(--primary)' }}>Import Data Anggota Hanura</h4>
                    </div>
                    <p style={{ color: 'var(--text-main)' }}>
                       Unggah file Excel (.xlsx) yang berisi data keanggotaan Hanura. Sistem akan memproses dan menyimpannya secara otomatis.
                    </p>
                    {isImporting && (
                      <div className="import-progress-container mt-4">
                         <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${importProgress}%` }}></div>
                         </div>
                         <p className="progress-text">{importStatus} ({importProgress}%)</p>
                      </div>
                    )}
                   </div>
                   <div className="import-action">
                      <input 
                        type="file" 
                        id="excel-upload" 
                        accept=".xlsx, .xls" 
                        style={{ display: 'none' }} 
                        onChange={handleImportAnggota}
                        disabled={isImporting}
                      />
                      <label htmlFor="excel-upload" className={`btn btn-primary ${isImporting ? 'disabled' : ''}`}>
                        {isImporting ? <Loader2 size={18} className="spinner" /> : <Upload size={18} />}
                        <span>{isImporting ? 'Memproses...' : 'Upload Excel'}</span>
                      </label>
                   </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Peringatan Keamanan"
        icon={<AlertTriangle className="text-danger" size={28} />}
        maxWidth="500px"
      >
        <div className="premium-modal-body-content text-center">
          {resetSuccess ? (
            <div className="success-view animate-scale-up">
               <CheckCircle2 color="#10b981" size={64} />
               <h3 style={{ margin: '1.5rem 0 0.5rem', fontWeight: 800 }}>Data Berhasil Direset!</h3>
               <p style={{ color: 'var(--text-muted)' }}>Seluruh data sistem telah dikembalikan ke nol.</p>
            </div>
          ) : (
            <>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '2rem' }}>
                <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Tindakan ini bersifat permanen dan **tidak dapat dibatalkan**. Semua catatan administrasi akan dihapus dari cloud.
                </p>
              </div>

              <div className="confirm-input-group">
                <label style={{ textAlign: 'center' }}>Ketik <strong style={{ color: '#ef4444' }}>RESET</strong> untuk konfirmasi:</label>
                <input 
                  type="text" 
                  className="confirm-input"
                  style={{ border: '2px solid #ef4444', background: 'var(--background)', color: 'var(--text-main)' }}
                  placeholder="Ketik disini..."
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                  disabled={isResetting}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  className="btn btn-ghost" 
                  style={{ flex: 1 }}
                  onClick={() => setIsResetModalOpen(false)}
                  disabled={isResetting}
                >Batal</button>
                <button 
                  className="btn btn-danger" 
                  style={{ flex: 1.5 }}
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
      </Modal>

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
        .settings-menu-item.active { background: var(--background); color: var(--primary); border: 1px solid var(--border); font-weight: 700; }
        
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

        .action-area { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; }
        .success-msg { font-size: 0.8rem; color: #10b981; font-weight: 600; }
        .btn-success { background: #10b981 !important; }

        .animate-fade-in { animation: fadeIn 0.3s ease-out; }

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

        .mt-4 { margin-top: 1rem; }
        .progress-bar-bg { width: 100%; height: 8px; background: var(--border); border-radius: 100px; overflow: hidden; margin-bottom: 0.5rem; }
        .progress-bar-fill { height: 100%; background: var(--primary); transition: width 0.3s ease; }
        .progress-text { font-size: 0.75rem; font-weight: 700; color: var(--primary); }
        .disabled { opacity: 0.6; pointer-events: none; }

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
