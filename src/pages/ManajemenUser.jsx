import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Shield, UserCheck, MoreVertical, ShieldAlert, UserX, Check, Edit, 
  Eye, Trash2, X, Save, ShieldCheck, CheckCircle, AlertCircle, Calendar, Hash, Smartphone
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const ManajemenUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [newRole, setNewRole] = useState('');
  const { updateUserRole } = useAuth();

  useEffect(() => {
    if (!db) return;
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const items = [];
      snapshot.forEach((child) => {
        items.push({ id: child.key, ...child.val() });
      });
      setUsers(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSetRole = async () => {
    if (!editingUser || !newRole) return;
    try {
      await updateUserRole(editingUser.id, newRole);
      alert('Peran pengguna berhasil diperbarui!');
      setEditingUser(null);
      setNewRole('');
    } catch (error) {
      alert('Gagal memperbarui peran!');
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Hapus akses untuk @${user.username} secara permanen?`)) {
      try {
        await remove(ref(db, `users/${user.id}`));
        alert('Pengguna berhasil dihapus!');
      } catch (error) {
        alert('Gagal menghapus pengguna!');
      }
    }
  };

  const startEditRole = (user) => {
    setEditingUser(user);
    setNewRole(user.role || '');
  };

  const adminCount = users.filter(u => u.role === 'Admin').length;
  const petugasCount = users.filter(u => u.role === 'Petugas').length;
  const verifCount = users.filter(u => u.role === 'Verifikator').length;
  const pendingCount = users.filter(u => !u.role).length;

  return (
    <div className="users-page fadeIn">
      <div className="dashboard-hero glass-premium" style={{ background: 'linear-gradient(135deg, #1e293b, #334155)' }}>
        <div className="hero-content">
          <div className="welcome-tag">MANAJEMEN AKSES</div>
          <h1>Kelola Pengguna Sistem SITU HANURA</h1>
          <p>Verifikasi akun baru dan atur hak akses petugas operasional.</p>
        </div>
        <div className="date-badge-premium" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Shield size={24} color="#3b82f6" />
          <div className="date-text">
            <span className="day">KEAMANAN</span>
            <span className="full-date">Sistem Terenkripsi</span>
          </div>
        </div>
      </div>

      <div className="vibrant-stats-grid">
        <div className="vibrant-stat-card glass-card" style={{ '--accent-color': '#1e293b' }}>
          <div className="vibrant-stat-header">
            <div className="vibrant-icon-wrapper"><Shield size={20} /></div>
            <div className="stat-label">Admin Utama</div>
          </div>
          <div className="vibrant-stat-body">
            <h2 className="stat-main-value">{adminCount}</h2>
            <p className="role-desc">Pengelola Penuh Sistem</p>
          </div>
        </div>
        <div className="vibrant-stat-card glass-card" style={{ '--accent-color': '#10b981' }}>
          <div className="vibrant-stat-header">
            <div className="vibrant-icon-wrapper"><UserCheck size={20} /></div>
            <div className="stat-label">Total Petugas</div>
          </div>
          <div className="vibrant-stat-body">
            <h2 className="stat-main-value">{petugasCount}</h2>
            <p className="role-desc">Operator Pengelola Data</p>
          </div>
        </div>
        <div className="vibrant-stat-card glass-card" style={{ '--accent-color': '#f59e0b' }}>
          <div className="vibrant-stat-header">
            <div className="vibrant-icon-wrapper"><ShieldAlert size={20} /></div>
            <div className="stat-label">Verifikator</div>
          </div>
          <div className="vibrant-stat-body">
            <h2 className="stat-main-value">{verifCount}</h2>
            <p className="role-desc">Audit & Validasi Berkas</p>
          </div>
        </div>
        <div className="vibrant-stat-card glass-card" style={{ '--accent-color': '#ef4444' }}>
          <div className="vibrant-stat-header">
            <div className="vibrant-icon-wrapper"><UserX size={20} /></div>
            <div className="stat-label">Menunggu Verif</div>
          </div>
          <div className="vibrant-stat-body">
            <h2 className="stat-main-value" style={{ color: '#ef4444' }}>{pendingCount}</h2>
            <p className="role-desc">Pengguna Baru (Belum Aktif)</p>
          </div>
        </div>
      </div>

      <div className="table-responsive glass-card mt-4">
        {loading ? (
          <div className="p-10 text-center text-muted">Sinkronisasi pengguna...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Pengguna</th>
                <th>Username</th>
                <th>Peran / Role</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.sort((a,b) => (a.role === null ? -1 : 1)).map((u) => (
                <tr key={u.id} className={!u.role ? 'row-pending' : ''}>
                  <td className="font-bold">
                    {u.name}
                    {!u.role && <span className="new-badge">BARU</span>}
                  </td>
                  <td className="text-muted">@{u.username}</td>
                  <td>
                    {editingUser === u.id ? (
                      <div className="role-selector">
                        <select 
                          onChange={(e) => handleSetRole(u.id, e.target.value)}
                          defaultValue={u.role || ""}
                        >
                          <option value="" disabled>Pilih Role</option>
                          <option value="Admin">Admin</option>
                          <option value="Petugas">Petugas</option>
                          <option value="Verifikator">Verifikator</option>
                        </select>
                        <button className="cancel-edit" onClick={() => setEditingUser(null)}>Batal</button>
                      </div>
                    ) : (
                      <span className={`role-badge ${u.role ? u.role.toLowerCase() : 'pending'}`}>
                        {u.role || 'Belum Aktif'}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className={`status-indicator-badge ${u.activeDevId ? 'online' : 'offline'}`}>
                      <span className="dot"></span>
                      <span>{u.activeDevId ? 'Online' : 'Offline'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-group">
                      <button className="icon-btn-view" onClick={() => setShowDetail(u)} title="Detail Akun"><Eye size={16} /></button>
                      <button className="icon-btn-edit" onClick={() => startEditRole(u)} title="Ubah Hak Akses"><ShieldCheck size={16} /></button>
                      <button className="icon-btn-delete" onClick={() => handleDeleteUser(u)} title="Hapus Akun"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center p-10">Tidak ada pengguna.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Ubah Hak Akses Pengguna"
        icon={<ShieldCheck size={24} />}
      >
        {editingUser && (
          <div className="mail-form">
            <div className="premium-modal-section">
              <h4 className="premium-section-title"><UserCheck size={18} /> Profil Pengguna</h4>
              <div className="premium-info-item full">
                <strong>{editingUser.name}</strong>
                <p className="text-muted">@{editingUser.username}</p>
              </div>
            </div>

            <div className="premium-modal-section">
              <h4 className="premium-section-title"><Shield size={18} /> Pilih Peran Baru</h4>
              <div className="form-group">
                <label>Pilih Hak Akses</label>
                <select 
                  className="premium-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="" disabled>Pilih Level Akses...</option>
                  <option value="Admin">Admin Utama (Akses Tanpa Batas)</option>
                  <option value="Petugas">Petugas (Pengelola Data Operasional)</option>
                  <option value="Verifikator">Verifikator (Audit & Validasi)</option>
                </select>
                <div className="role-explanation">
                  {newRole === 'Admin' && <p className="alert success">Admin memiliki akses penuh ke Manajemen User, Pengaturan, dan Database.</p>}
                  {newRole === 'Petugas' && <p className="alert info">Petugas dapat mengelola Surat Menyurat, Pustaka, dan Karyawan.</p>}
                  {newRole === 'Verifikator' && <p className="alert info">Verifikator fokus pada validasi berkas dan riwayat operasional.</p>}
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-ghost" onClick={() => setEditingUser(null)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSetRole}><Save size={18} /> Simpan Hak Akses</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!showDetail}
        onClose={() => setShowDetail(null)}
        title="Detail Audit Pengguna"
        icon={<UserCheck size={24} />}
        footer={<button className="btn btn-primary" onClick={() => setShowDetail(null)}>Tutup Audit</button>}
      >
        {showDetail && (
          <>
            <div className="premium-modal-section">
              <h4 className="premium-section-title"><AlertCircle size={18} /> Informasi Akun</h4>
              <div className="premium-info-grid">
                <div className="premium-info-item">
                  <span className="premium-info-label">Nama Lengkap</span>
                  <span className="premium-info-value">{showDetail.name}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Username</span>
                  <span className="premium-info-value"><span className="badge-outline">@{showDetail.username}</span></span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Level Akses</span>
                  <span className={`role-badge ${showDetail.role?.toLowerCase() || 'pending'}`}>{showDetail.role || 'BELUM AKTIF'}</span>
                </div>
              </div>
            </div>
            <div className="premium-modal-section">
              <h4 className="premium-section-title"><Smartphone size={18} /> Metadata Keamanan</h4>
              <div className="premium-info-grid">
                <div className="premium-info-item">
                  <span className="premium-info-label">Device ID Terdaftar</span>
                  <span className="premium-info-value truncate-id">{showDetail.activeDevId || 'Tidak Terdeteksi'}</span>
                </div>
                <div className="premium-info-item">
                  <span className="premium-info-label">Status Sesi</span>
                  <span className={`premium-info-value ${showDetail.activeDevId ? 'text-success' : 'text-danger'}`}>
                    {showDetail.activeDevId ? 'Akses Aktif / Online' : 'Akses Terputus / Offline'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .users-page { display: flex; flex-direction: column; gap: 2rem; }
        
        .dashboard-hero { 
          padding: 2.5rem; border-radius: 24px; color: white; 
          display: flex; justify-content: space-between; align-items: center; 
          box-shadow: 0 15px 35px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.05);
        }
        .welcome-tag { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.15rem; background: rgba(255,255,255,0.1); padding: 0.35rem 0.8rem; border-radius: 100px; width: fit-content; margin-bottom: 1rem; }
        .hero-content h1 { font-size: 1.75rem; font-weight: 900; margin-bottom: 0.5rem; letter-spacing: -0.01em; }
        .hero-content p { font-size: 1rem; opacity: 0.8; }
        
        .date-badge-premium { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 2rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); }
        .date-text .day { font-weight: 800; font-size: 1rem; color: #3b82f6; }
        .date-text .full-date { opacity: 0.7; font-size: 0.75rem; }

        .vibrant-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; }
        .vibrant-stat-card { padding: 1.5rem; transition: all 0.3s; border: 1px solid transparent; }
        .vibrant-stat-card:hover { transform: translateY(-5px); border-color: var(--accent-color); opacity: 1 !important; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .vibrant-icon-wrapper { width: 44px; height: 44px; background: rgba(0,0,0,0.04); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--accent-color); }
        .stat-label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-main-value { font-size: 1.75rem; font-weight: 900; margin: 0.5rem 0 0.25rem 0; color: #0f172a; }
        .vibrant-stat-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }

        .role-badge { padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.7rem; font-weight: 800; display: inline-block; }
        .role-badge.admin { background: #fee2e2; color: #ef4444; }
        .role-badge.petugas { background: #dcfce7; color: #10b981; }
        .role-badge.verifikator { background: #fef3c7; color: #f59e0b; }
        .role-badge.pending { background: #f1f5f9; color: #64748b; border: 1px dashed #cbd5e1; }

        .status-indicator-badge { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; width: fit-content; padding: 4px 10px; border-radius: 100px; }
        .status-indicator-badge.online { background: #ecfdf5; color: #10b981; }
        .status-indicator-badge.offline { background: #f8fafc; color: #94a3b8; }
        .status-indicator-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

        .premium-select { width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 1rem; transition: all 0.2s; outline: none; margin-top: 0.5rem; appearance: none; background: #f8fafc url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E') no-repeat right 1rem center; background-size: 1.25rem; }
        .premium-select:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
        .role-explanation { margin-top: 1.5rem; }
        .alert { border-radius: 12px; padding: 1rem; font-size: 0.85rem; font-weight: 600; line-height: 1.5; }
        .alert.success { background: #ecfdf5; color: #065f46; border: 1px solid #10b98133; }
        .alert.info { background: #eff6ff; color: #1e40af; border: 1px solid #3b82f633; }

        .truncate-id { max-width: 200px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace; font-size: 0.8rem; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
        .text-success { color: #10b981; }
        .text-danger { color: #ef4444; }

        .action-group { display: flex; gap: 0.5rem; }
        .action-group button { width: 34px !important; height: 34px !important; border-radius: 10px !important; border: none !important; }
        .icon-btn-view { color: var(--primary); background: rgba(37,99,235,0.06); }
        .icon-btn-view:hover { background: var(--primary); color: white; transform: translateY(-3px); box-shadow: 0 5px 12px rgba(37,99,235,0.2); }
        .icon-btn-edit { color: #f59e0b; background: rgba(245,158,11,0.06); }
        .icon-btn-edit:hover { background: #f59e0b; color: white; transform: translateY(-3px); box-shadow: 0 5px 12px rgba(245,158,11,0.2); }
        .icon-btn-delete { color: #ef4444; background: rgba(239,68,68,0.06); }
        .icon-btn-delete:hover { background: #ef4444; color: white; transform: translateY(-3px); box-shadow: 0 5px 12px rgba(239,68,68,0.2); }

        .row-pending { background: #fff7ed !important; }
        .new-badge { font-size: 0.6rem; background: #f97316; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 800; margin-left: 8px; }

        .p-10 { padding: 2.5rem; }
        @media (max-width: 768px) { .dashboard-hero { flex-direction: column; text-align: center; gap: 2rem; } }
      ` }} />
    </div>
  );
};

export default ManajemenUser;
