import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Wallet, 
  Users, 
  Library, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  Archive,
  AlertTriangle,
  ArrowRight,
  Info,
  MapPin,
  Trash2,
  Zap,
  Sparkles,
  Database
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, query, limitToLast, remove } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, workingMonth } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    suratMasuk: 0,
    suratKeluar: 0,
    pustaka: 0
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    // Listen to Surat Masuk count
    const smRef = ref(db, 'surat/masuk');
    const unsubscribeSM = onValue(smRef, (snapshot) => {
      setCounts(prev => ({ ...prev, suratMasuk: snapshot.size || 0 }));
    });

    // Listen to Surat Keluar count
    const skRef = ref(db, 'surat/keluar');
    const unsubscribeSK = onValue(skRef, (snapshot) => {
      setCounts(prev => ({ ...prev, suratKeluar: snapshot.size || 0 }));
    });

    // Listen to Pustaka count
    const pustakaRef = ref(db, 'pustaka');
    const unsubscribePustaka = onValue(pustakaRef, (snapshot) => {
      setCounts(prev => ({ ...prev, pustaka: snapshot.size || 0 }));
    });

    // Listen to Logs (History)
    const logsRef = ref(db, 'logs');
    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      const logItems = [];
      snapshot.forEach((child) => {
        logItems.push({ id: child.key, ...child.val() });
      });
      setLogs(logItems.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15));
      setLoading(false);
    });

    return () => {
      unsubscribeSM();
      unsubscribeSK();
      unsubscribePustaka();
      unsubscribeLogs();
    };
  }, []);

  const handleDeleteLog = async (id) => {
    if (user?.role !== 'Admin') return;
    if (window.confirm('Hapus entri riwayat ini?')) {
      try {
        await remove(ref(db, `logs/${id}`));
      } catch (err) {
        alert('Gagal menghapus log');
      }
    }
  };

  const handleClearLogs = async () => {
    if (user?.role !== 'Admin') return;
    if (window.confirm('PERINGATAN: Hapus SEMUA riwayat pekerjaan secara permanen?')) {
      try {
        await remove(ref(db, 'logs'));
        alert('Riwayat berhasil dibersihkan');
      } catch (err) {
        alert('Gagal membersihkan riwayat');
      }
    }
  };

  const stats = [
    { title: 'Surat Masuk', value: counts.suratMasuk, icon: <Mail size={22} />, color: '#3b82f6', tag: 'SURAT' },
    { title: 'Surat Keluar', value: counts.suratKeluar, icon: <FileText size={22} />, color: '#10b981', tag: 'SURAT' },
    { title: 'Pustaka Hanura', value: counts.pustaka, icon: <Library size={22} />, color: '#f59e0b', tag: 'ARSIP' },
  ];

  return (
    <div className="dashboard-redesign fadeIn">
      {/* Header Profile - Compact */}
      <div className="dash-header-banner">
        <div className="header-badge-premium">
           <Zap size={14} className="bolt-icon" /> SITU HANURA • DASHBOARD
        </div>
        <h1>Halo, <span className="name-highlight">{user?.username?.toUpperCase()}</span>! 👋</h1>
        <p>Gunakan dashboard ini untuk memantau data operasional kantor hari ini.</p>
        
        <div className="header-date-pill glass-pure">
           <Calendar size={18} />
           <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Top Section - 3 Stats Cards */}
      <div className="stats-row-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="premium-stat-box glass-card-premium" style={{ '--accent': stat.color, '--delay': `${idx * 0.1}s` }}>
            <div className="stat-top-meta">
              <div className="icon-wrapper" style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="live-pill">LIVE</div>
            </div>
            <div className="stat-central">
              <span className="stat-caption">{stat.title}</span>
              <div className="stat-main">
                <h2 className="count-big">{stat.value}</h2>
                <div className="viz-mini">
                  <TrendingUp size={16} style={{ color: stat.color }} />
                </div>
              </div>
            </div>
            <div className="stat-footer-line">
              <div className="stat-bar-outer">
                 <div className="stat-bar-inner" style={{ background: stat.color, width: '60%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section - Work History Table */}
      <div className="history-table-container glass-card-premium slideUp">
        <div className="table-header-premium">
          <div className="header-title-group">
             <div className="title-icon-box warning">
                <Database size={20} />
             </div>
             <div className="title-text-group">
                <h3>Riwayat Pekerjaan</h3>
                <span className="subtitle-info">Audit Aktivitas Sistem Terkini</span>
             </div>
          </div>
          {user?.role === 'Admin' && logs.length > 0 && (
            <button className="btn-clear-history" onClick={handleClearLogs}>
              <Trash2 size={14} />
              <span>Bersihkan Riwayat</span>
            </button>
          )}
        </div>

        <div className="table-responsive-premium">
          <table className="modern-data-table">
            <thead>
              <tr>
                <th style={{ width: '150px' }}><Calendar size={12} /> Tanggal Input</th>
                <th style={{ width: '200px' }}><Archive size={12} /> Menu</th>
                <th><Info size={12} /> Keterangan Aktivitas</th>
                <th style={{ width: '180px' }}><Users size={12} /> Petugas Input</th>
                {user?.role === 'Admin' && <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan={user?.role === 'Admin' ? 5 : 4} className="p-10 text-center text-muted">Memuat data Riwayat...</td>
                </tr>
              ) : logs.length > 0 ? logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="date-display">
                      <span className="main-d">{new Date(log.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                      <span className="mini-t">{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td><span className="menu-label-tag">{log.menu}</span></td>
                  <td className="keterangan-cell">{log.keterangan}</td>
                  <td>
                    <div className="petugas-profile-mini">
                       <div className="avatar-letter">{log.petugas?.charAt(0).toUpperCase()}</div>
                       <span>{log.petugas}</span>
                    </div>
                  </td>
                  {user?.role === 'Admin' && (
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn-trash-mini" 
                        onClick={() => handleDeleteLog(log.id)}
                        title="Hapus Entri"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                   <td colSpan={user?.role === 'Admin' ? 5 : 4} className="p-10 text-center text-muted">Belum ada aktivitas baru.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-redesign { display: flex; flex-direction: column; gap: 1.5rem; }

        .dash-header-banner {
          padding: 1.75rem 2.5rem;
          background: linear-gradient(135deg, var(--primary) 0%, #4c66ff 100%);
          border-radius: 20px; color: white; position: relative; overflow: hidden;
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.1);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .header-badge-premium {
          background: rgba(255,255,255,0.2); backdrop-filter: blur(8px);
          padding: 0.35rem 1rem; border-radius: 100px; font-size: 0.65rem; font-weight: 800;
          display: flex; align-items: center; gap: 8px; width: fit-content; margin-bottom: 0.75rem;
        }

        .dash-header-banner h1 { font-size: 2rem; font-weight: 950; margin: 0.25rem 0; letter-spacing: -0.04em; }
        .name-highlight { color: #facc15; }
        .dash-header-banner p { font-size: 0.9rem; opacity: 0.9; font-weight: 500; }

        .header-date-pill {
          background: rgba(255,255,255,0.1); backdrop-filter: blur(12px);
          padding: 0.6rem 1.25rem; border-radius: 100px; border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; gap: 10px; font-size: 0.8rem; font-weight: 700;
          position: absolute; right: 2rem; bottom: 1.75rem;
        }

        .stats-row-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;
        }

        .premium-stat-box {
          background: white; border-radius: 24px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-stat-box:hover { transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }

        .stat-top-meta { display: flex; justify-content: space-between; align-items: flex-start; }
        .icon-wrapper { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .live-pill { font-size: 0.6rem; font-weight: 900; color: #a1a1aa; background: #f4f4f5; padding: 2px 8px; border-radius: 6px; }

        .stat-central { display: flex; flex-direction: column; gap: 4px; }
        .stat-caption { font-size: 0.8rem; font-weight: 700; color: #64748b; }
        .stat-main { display: flex; justify-content: space-between; align-items: flex-end; }
        .count-big { font-size: 2.2rem; font-weight: 950; color: #1e293b; line-height: 1; }
        .viz-mini { opacity: 0.3; }

        .stat-footer-line { height: 4px; background: #f1f5f9; border-radius: 10px; overflow: hidden; margin-top: 4px; }
        .stat-bar-inner { height: 100%; border-radius: 10px; transition: width 1s ease-out; }

        .history-table-container { padding: 1.5rem 0; border-radius: 24px; background: white; }
        .table-header-premium { padding: 0 1.5rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .header-title-group { display: flex; align-items: center; gap: 1rem; }
        .title-icon-box { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
        .title-icon-box.warning { background: #fffbeb; color: #f59e0b; }
        .title-text-group h3 { font-size: 1.25rem; font-weight: 900; color: #1e293b; margin: 0; }
        .subtitle-info { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

        .btn-clear-history {
          background: #fff1f2; color: #e11d48; padding: 0.5rem 1.25rem; border-radius: 10px; border: 1px solid #fecaca;
          font-weight: 800; font-size: 0.75rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
        }
        .btn-clear-history:hover { background: #e11d48; color: white; border-color: #e11d48; transform: translateY(-3px); }

        .table-responsive-premium { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .modern-data-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .modern-data-table th { padding: 1rem 1.5rem; background: #f8fafc; text-align: left; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
        .modern-data-table th svg { vertical-align: middle; margin-right: 6px; }
        .modern-data-table td { padding: 1rem 1.5rem; font-size: 0.85rem; color: #1e293b; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .modern-data-table tr:hover td { background: #f9fafb; }

        .date-display { display: flex; flex-direction: column; line-height: 1.2; }
        .main-d { font-weight: 800; color: var(--primary); }
        .mini-t { font-size: 0.7rem; font-weight: 700; color: #94a3b8; }

        .menu-label-tag { font-size: 0.7rem; font-weight: 900; background: #f1f5f9; color: #1e293b; padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0; }
        .keterangan-cell { font-weight: 600; line-height: 1.5; color: #475569; }

        .petugas-profile-mini { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.8rem; }
        .avatar-letter { width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 900; }

        .btn-trash-mini {
          width: 32px; height: 32px; border-radius: 8px; background: #fff1f2; color: #ef4444; border: none; cursor: pointer; transition: all 0.2s;
        }
        .btn-trash-mini:hover { background: #ef4444; color: white; transform: rotate(10deg) scale(1.1); box-shadow: 0 4px 12px rgba(239,68,68,0.2); }

        @media (max-width: 1024px) {
          .stats-row-grid { grid-template-columns: repeat(2, 1fr); }
          .dash-header-banner { padding: 1.5rem; }
          .header-date-pill { position: static; margin-top: 1.25rem; width: fit-content; }
        }
        @media (max-width: 640px) {
          .stats-row-grid { grid-template-columns: 1fr; }
        }
      ` }} />
    </div>
  );
};

export default Dashboard;
