import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, UserCheck, MoreVertical, ShieldAlert, UserX, Check, Edit } from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

const ManajemenUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
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

  const handleSetRole = (userId, role) => {
    updateUserRole(userId, role);
    setEditingUser(null);
  };

  const adminCount = users.filter(u => u.role === 'Admin').length;
  const petugasCount = users.filter(u => u.role === 'Petugas').length;
  const verifCount = users.filter(u => u.role === 'Verifikator').length;
  const pendingCount = users.filter(u => !u.role).length;

  return (
    <div className="users-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Manajemen Pengguna</h1>
          <p>Kelola akses pengguna dan verifikasi pendaftaran baru.</p>
        </div>
        <button className="btn btn-primary" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
          <UserPlus size={18} />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <div className="role-summary-grid">
        <div className="role-card glass-card">
          <div className="role-icon admin"><Shield size={24} /></div>
          <div className="role-info">
            <span className="role-title">Admin</span>
            <p className="role-desc">Akses penuh sistem.</p>
          </div>
          <span className="role-count">{adminCount}</span>
        </div>
        <div className="role-card glass-card">
          <div className="role-icon petugas"><UserCheck size={24} /></div>
          <div className="role-info">
            <span className="role-title">Petugas</span>
            <p className="role-desc">Input data operasional.</p>
          </div>
          <span className="role-count">{petugasCount}</span>
        </div>
        <div className="role-card glass-card">
          <div className="role-icon verif"><ShieldAlert size={24} /></div>
          <div className="role-info">
            <span className="role-title">Verifikator</span>
            <p className="role-desc">Audit & Verifikasi.</p>
          </div>
          <span className="role-count">{verifCount}</span>
        </div>
        <div className="role-card glass-card">
          <div className="role-icon pending"><UserX size={24} /></div>
          <div className="role-info">
            <span className="role-title">Pending</span>
            <p className="role-desc">Menunggu persetujuan.</p>
          </div>
          <span className="role-count highlight">{pendingCount}</span>
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
                    <div className="status-indicator">
                      <span className={`dot ${u.activeDevId ? 'online' : 'offline'}`}></span>
                      <span>{u.activeDevId ? 'Online' : 'Offline'}</span>
                    </div>
                  </td>
                  <td>
                    {!u.role ? (
                      <button className="btn-approve" onClick={() => setEditingUser(u.id)}>
                        <Check size={14} /> Beri Akses
                      </button>
                    ) : (
                      <button className="icon-btn-ghost" onClick={() => setEditingUser(u.id)}>
                        <Edit size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center p-10">Tidak ada pengguna.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .users-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .role-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
        .role-card { display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem; position: relative; overflow: hidden; }
        .role-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        
        .role-icon.admin { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .role-icon.petugas { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .role-icon.verif { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .role-icon.pending { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .role-count.highlight { color: #ef4444; opacity: 1; }
        .role-title { font-weight: 800; font-size: 1rem; color: var(--text-main); }
        .role-desc { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
        .role-count { margin-left: auto; font-size: 1.5rem; font-weight: 800; color: var(--text-muted); opacity: 0.5; }

        .row-pending { background: rgba(239, 68, 68, 0.02); }
        .new-badge { 
          font-size: 0.6rem; background: #ef4444; color: white; padding: 1px 4px; 
          border-radius: 4px; margin-left: 8px; vertical-align: middle;
        }

        .role-badge { padding: 0.3rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .role-badge.admin { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .role-badge.petugas { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .role-badge.verifikator { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .role-badge.pending { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .btn-approve {
          background: #10b981; color: white; border: none; padding: 6px 12px;
          border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 4px; transition: background 0.2s;
        }
        .btn-approve:hover { background: #059669; }

        .role-selector { display: flex; align-items: center; gap: 8px; }
        .role-selector select { 
          padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border);
          font-size: 0.85rem; outline: none;
        }
        .cancel-edit { background: none; border: none; color: #ef4444; font-size: 0.75rem; cursor: pointer; }

        .status-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
        .status-indicator .dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-indicator .dot.online { background: #10b981; }
        .status-indicator .dot.offline { background: #94a3b8; }
        
        .mt-4 { margin-top: 1rem; }
        .p-10 { padding: 2.5rem; }
      ` }} />
    </div>
  );
};

export default ManajemenUser;
