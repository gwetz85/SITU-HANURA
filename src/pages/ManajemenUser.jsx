import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, UserCheck, MoreVertical, ShieldAlert } from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

const ManajemenUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const adminCount = users.filter(u => u.role === 'Admin').length;
  const petugasCount = users.filter(u => u.role === 'Petugas').length;
  const verifCount = users.filter(u => u.role === 'Verifikator').length;

  return (
    <div className="users-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Manajemen Pengguna (Cloud)</h1>
          <p>Data pengguna dan status keamanan ditarik langsung dari database cloud.</p>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={18} />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <div className="role-summary-grid">
        <div className="role-card glass-card">
          <div className="role-icon admin"><Shield size={24} /></div>
          <div className="role-info">
            <span className="role-title">Admin</span>
            <p className="role-desc">Akses penuh ke seluruh fitur dan pengaturan.</p>
          </div>
          <span className="role-count">{adminCount}</span>
        </div>
        <div className="role-card glass-card">
          <div className="role-icon petugas"><UserCheck size={24} /></div>
          <div className="role-info">
            <span className="role-title">Petugas</span>
            <p className="role-desc">Input data surat dan operasional kantor.</p>
          </div>
          <span className="role-count">{petugasCount}</span>
        </div>
        <div className="role-card glass-card">
          <div className="role-icon verif"><ShieldAlert size={24} /></div>
          <div className="role-info">
            <span className="role-title">Verifikator</span>
            <p className="role-desc">Verifikasi data dan audit laporan.</p>
          </div>
          <span className="role-count">{verifCount}</span>
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
                <th>Device ID Aktif</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map((u) => (
                <tr key={u.id}>
                  <td className="font-bold">{u.name}</td>
                  <td className="text-muted">@{u.username}</td>
                  <td>
                    <span className={`role-badge ${u.role?.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div className="status-indicator">
                      <span className={`dot ${u.activeDevId ? 'online' : 'offline'}`}></span>
                      <span>{u.activeDevId ? 'Online' : 'Offline'}</span>
                    </div>
                  </td>
                  <td className="text-muted" style={{ fontSize: '0.7rem' }}>{u.activeDevId || '-'}</td>
                  <td>
                    <button className="icon-btn-ghost"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="text-center p-10">Data pengguna cloud tidak tersedia.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .users-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .role-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .role-card { display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem; }
        .role-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .role-icon.admin { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .role-icon.petugas { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .role-icon.verif { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .role-title { font-weight: 800; font-size: 1.1rem; color: var(--text-main); }
        .role-desc { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; line-height: 1.3; }
        .role-count { margin-left: auto; font-size: 1.5rem; font-weight: 800; color: var(--text-muted); opacity: 0.5; }
        .role-badge { padding: 0.3rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .role-badge.admin { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .role-badge.petugas { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .role-badge.verifikator { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; }
        .status-indicator .dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-indicator .dot.online { background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .status-indicator .dot.offline { background: #94a3b8; }
        .mt-4 { margin-top: 1rem; }
        .p-10 { padding: 2.5rem; }
        @media (max-width: 768px) { .role-summary-grid { grid-template-columns: 1fr; } }
      ` }} />
    </div>
  );
};

export default ManajemenUser;
