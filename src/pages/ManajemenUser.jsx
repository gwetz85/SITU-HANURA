import React from 'react';
import { UserPlus, Shield, UserCheck, MoreVertical, ShieldAlert } from 'lucide-react';

const ManajemenUser = () => {
  const users = [
    { id: 1, name: 'Agus Suriyadi', role: 'Admin', status: 'Online', lastActive: 'Sekarang' },
    { id: 2, name: 'Budi Santoso', role: 'Petugas', status: 'Offline', lastActive: '2 jam yang lalu' },
    { id: 3, name: 'Siti Aminah', role: 'Verifikator', status: 'Offline', lastActive: 'Kemarin' },
  ];

  return (
    <div className="users-page fadeIn">
      <div className="page-header">
        <div className="header-info">
          <h1>Manajemen Pengguna</h1>
          <p>Atur hak akses dan peran pengguna aplikasi SITU HANURA.</p>
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
          <span className="role-count">1</span>
        </div>
        <div className="role-card glass-card">
          <div className="role-icon petugas"><UserCheck size={24} /></div>
          <div className="role-info">
            <span className="role-title">Petugas</span>
            <p className="role-desc">Input data surat dan operasional kantorr.</p>
          </div>
          <span className="role-count">5</span>
        </div>
        <div className="role-card glass-card">
          <div className="role-icon verif"><ShieldAlert size={24} /></div>
          <div className="role-info">
            <span className="role-title">Verifikator</span>
            <p className="role-desc">Verifikasi data dan audit laporan.</p>
          </div>
          <span className="role-count">2</span>
        </div>
      </div>

      <div className="table-responsive glass-card mt-4">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Pengguna</th>
              <th>Peran / Role</th>
              <th>Status</th>
              <th>Terakhir Aktif</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-bold">{u.name}</td>
                <td>
                  <span className={`role-badge ${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <div className="status-indicator">
                    <span className={`dot ${u.status.toLowerCase()}`}></span>
                    <span>{u.status}</span>
                  </div>
                </td>
                <td className="text-muted">{u.lastActive}</td>
                <td>
                  <button className="icon-btn-ghost"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .users-page { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        
        .role-summary-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;
        }

        .role-card { display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem; }
        .role-icon { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .role-icon.admin { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .role-icon.petugas { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .role-icon.verif { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

        .role-title { font-weight: 800; font-size: 1.1rem; color: var(--text-main); }
        .role-desc { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; line-height: 1.3; }
        .role-count { margin-left: auto; font-size: 1.5rem; font-weight: 800; color: var(--text-muted); opacity: 0.5; }

        .role-badge {
          padding: 0.3rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
        }
        .role-badge.admin { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .role-badge.petugas { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .role-badge.verifikator { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

        .status-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; }
        .status-indicator .dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-indicator .dot.online { background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .status-indicator .dot.offline { background: #94a3b8; }

        .mt-4 { margin-top: 1rem; }

        @media (max-width: 768px) {
          .role-summary-grid { grid-template-columns: 1fr; }
        }
      ` }} />
    </div>
  );
};

export default ManajemenUser;
