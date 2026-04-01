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
  Trash2
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
  const [activities, setActivities] = useState([]);
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

      // Listen to Activities (Latest Active)
      const actRef = ref(db, 'activities');
      const unsubscribeActs = onValue(actRef, (snapshot) => {
        const items = [];
        snapshot.forEach((child) => {
          const val = child.val();
          if (val.status !== 'Selesai') {
            items.push({ id: child.key, ...val });
          }
        });
        // Sort and take last 4
        setActivities(items.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 4));
      });

    // Listen to Logs (Latest 15)
    const logsRef = ref(db, 'logs');
    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      const logItems = [];
      snapshot.forEach((child) => {
        logItems.push({ id: child.key, ...child.val() });
      });
      // Sort by timestamp and take latest 15
      setLogs(logItems.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15));
      setLoading(false);
    });

    return () => {
      unsubscribeSM();
      unsubscribeSK();
      unsubscribePustaka();
      unsubscribeActs();
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

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const stats = [
    { title: 'Surat Masuk', value: counts.suratMasuk, change: '+ Aktif', icon: <Mail size={24} />, color: '#3b82f6', trend: 'up' },
    { title: 'Surat Keluar', value: counts.suratKeluar, change: '+ Aktif', icon: <FileText size={24} />, color: '#10b981', trend: 'up' },
    { title: 'Pustaka Hanura', value: counts.pustaka, change: 'Arsip Digital', icon: <Library size={24} />, color: '#f59e0b', trend: 'neutral' },
  ];

  return (
    <div className="dashboard-page fadeIn">
      <div className="dashboard-hero premium-mesh-bg">
        <div className="hero-content">
          <div className="welcome-tag-premium">
             <span className="dot-pulse"></span>
             SISTEM INFORMASI TERPADU SITU HANURA
          </div>
          <h1>Halo, {user?.name || user?.username}! <span className="wave-emoji">👋</span></h1>
          <p>Selamat datang di pusat kendali operasional digital Anda hari ini. Semua sistem berjalan optimal.</p>
        </div>
        <div className="date-badge-modern glass-premium">
          <div className="calendar-icon-wrapper">
             <Calendar size={22} />
          </div>
          <div className="date-text-modern">
            <span className="day-name">{new Date().toLocaleDateString('id-ID', { weekday: 'long' })}</span>
            <span className="date-full">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Closing Notification */}
      {(() => {
        const now = new Date();
        const currentMonthId = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        const isBehind = workingMonth < currentMonthId;

        if (isBehind && user?.role === 'Admin') {
          return (
            <div className="closing-alert-card-premium animate-pulse-soft">
              <div className="alert-icon-wrapper-premium">
                <AlertTriangle size={24} />
              </div>
              <div className="alert-content-premium">
                <h3>Waktunya Tutup Buku! 📊</h3>
                <p>Periode aktif saat ini adalah <strong>{new Date(`${workingMonth}-01`).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</strong>. Harap lakukan Tutup Buku untuk mengarsipkan data.</p>
              </div>
              <div className="alert-actions-premium">
                <button className="btn btn-primary btn-glow" onClick={() => navigate('/karyawan')}>
                  Tutup Buku Sekarang <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Conditional Activities Section */}
      {activities.length > 0 && (
        <div className="upcoming-activities-section-modern slideUp">
          <div className="section-header-modern">
            <div className="title-with-icon-modern">
               <div className="icon-box primary">
                  <Calendar size={20} />
               </div>
               <div className="title-text">
                  <h3>Kegiatan Mendatang</h3>
                  <span className="subtitle">{activities.length} Agenda Terjadwal</span>
               </div>
            </div>
            {user?.role === 'Admin' && (
              <button className="btn-manage-kegiatan" onClick={() => navigate('/admin/kegiatan')}>
                Kelola Semua <ArrowRight size={14} />
              </button>
            )}
          </div>
          <div className="activity-grid-modern">
            {activities.map(act => (
              <div key={act.id} className="activity-card-modern glass-card-premium">
                <div className="act-header-modern">
                  <span className={`act-type-tag ${act.tipe?.toLowerCase()}`}>{act.tipe}</span>
                  <span className="act-date-modern"><Clock size={12} /> {new Date(act.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                </div>
                <h4 className="act-title-modern">{act.judul}</h4>
                <div className="act-info-row">
                   <div className="act-info-item"><MapPin size={12} /> {act.lokasi}</div>
                   <div className="act-info-item"><Users size={12} /> {act.author}</div>
                </div>
                <p className="act-desc-modern">{act.deskripsi}</p>
                <div className="act-footer-modern">
                   <button className="btn-details-act">Lihat Detail</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="vibrant-stats-grid-modern">
        {stats.map((stat, idx) => (
          <div key={idx} className="vibrant-stat-card-modern glass-card-premium" style={{ '--accent-color': stat.color, '--delay': `${idx * 0.1}s` }}>
            <div className="vibrant-stat-header-modern">
               <div className="vibrant-icon-container" style={{ background: `${stat.color}15`, color: stat.color }}>
                  {stat.icon}
               </div>
               <div className="stat-trend-indicator">
                  <TrendingUp size={14} />
                  <span>{stat.change}</span>
               </div>
            </div>
            <div className="vibrant-stat-body-modern">
              <span className="stat-label-modern">{stat.title}</span>
              <div className="stat-value-group">
                <h2 className="stat-main-value-modern">{stat.value}</h2>
                <div className="stat-mini-chart">
                   {[40, 70, 45, 90, 65].map((h, i) => (
                     <div key={i} className="mini-bar" style={{ height: `${h}%`, background: stat.color }}></div>
                   ))}
                </div>
              </div>
            </div>
            <div className="stat-progress-container-modern">
               <div className="stat-progress-fill-modern" style={{ width: '75%', background: `linear-gradient(90deg, ${stat.color}80, ${stat.color})` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="work-history-section-modern glass-card-premium slideUp">
        <div className="section-header-modern">
          <div className="title-with-icon-modern">
            <div className="icon-box warning">
               <Clock size={20} />
            </div>
            <div className="title-text">
               <h3>Riwayat Pekerjaan</h3>
               <span className="subtitle">Audit Aktivitas Sistem Terkini</span>
            </div>
          </div>
          <div className="history-badge">LIVE MONITORING</div>
          {user?.role === 'Admin' && logs.length > 0 && (
            <button className="btn-clear-history" onClick={handleClearLogs} style={{ marginLeft: 'auto' }}>
              <Trash2 size={14} />
              <span>Bersihkan Riwayat</span>
            </button>
          )}
        </div>
        <div className="table-responsive-compact">
          <table className="history-table">
            <thead>
              <tr>
                <th><Calendar size={12} /> Tanggal Input</th>
                <th><Archive size={12} /> Menu Input</th>
                <th><Info size={12} /> Keterangan Aktivitas</th>
                <th><Users size={12} /> Petugas</th>
                {user?.role === 'Admin' && <th style={{ textAlign: 'right' }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="history-date">
                      <span className="date-main">{new Date(log.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                      <span className="date-time">{new Date(log.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td><span className="menu-tag-premium">{log.menu}</span></td>
                  <td className="desc-cell-premium">{log.keterangan}</td>
                  <td className="petugas-cell-premium">
                    <div className="user-avatar-mini">{log.petugas?.charAt(0).toUpperCase()}</div>
                    <span>{log.petugas}</span>
                  </td>
                  {user?.role === 'Admin' && (
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-delete-log" onClick={() => handleDeleteLog(log.id)} title="Hapus Log">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="empty-history">
                    <div className="empty-flow">
                       <Clock size={32} />
                       <p>Belum ada riwayat pekerjaan yang tercatat hari ini.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(255, 255, 255, 0.5);
          --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .dashboard-page { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 1.5rem; }
        
        /* Premium Hero Section */
        .dashboard-hero { 
          padding: 1.5rem 2rem; 
          border-radius: 20px; 
          color: white; 
          display: flex; justify-content: space-between; align-items: center; 
          position: relative; overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .premium-mesh-bg {
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%);
          background-size: 200% 200%;
          animation: meshGradient 10s ease infinite;
        }

        @keyframes meshGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .welcome-tag-premium { 
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.05rem; 
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          padding: 0.3rem 0.8rem; border-radius: 100px; width: fit-content; margin-bottom: 0.75rem;
          display: flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.2);
        }

        .dot-pulse { width: 6px; height: 6px; background: #4ade80; border-radius: 50%; animation: pulseOpacity 2s infinite; }
        @keyframes pulseOpacity { 0% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.4; transform: scale(0.8); } }

        .hero-content h1 { font-size: 1.75rem; font-weight: 900; margin-bottom: 0.25rem; letter-spacing: -0.02em; }
        .hero-content p { font-size: 0.85rem; opacity: 0.9; max-width: 450px; line-height: 1.5; }
        .wave-emoji { display: inline-block; animation: wave 2.5s infinite; transform-origin: 70% 70%; }
        @keyframes wave { 0% { transform: rotate(0deg); } 10% { transform: rotate(14deg); } 20% { transform: rotate(-8deg); } 30% { transform: rotate(14deg); } 40% { transform: rotate(-4deg); } 50% { transform: rotate(10deg); } 60% { transform: rotate(0deg); } 100% { transform: rotate(0deg); } }
        
        .date-badge-modern { 
          display: flex; align-items: center; gap: 0.75rem; 
          padding: 0.75rem 1.25rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        }
        .calendar-icon-wrapper { 
          width: 40px; height: 40px; background: rgba(255,255,255,0.2); 
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
        }
        .date-text-modern { display: flex; flex-direction: column; }
        .day-name { font-weight: 900; font-size: 0.9rem; text-transform: uppercase; }
        .date-full { opacity: 0.85; font-size: 0.75rem; font-weight: 500; }

        /* Stats Cards Redesign */
        .vibrant-stats-grid-modern { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
        .glass-card-premium {
          background: var(--glass-bg); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.15rem;
          box-shadow: var(--shadow-md); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card-premium:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); border-color: var(--primary); }

        .vibrant-stat-card-modern { display: flex; flex-direction: column; gap: 1rem; position: relative; overflow: hidden; }
        .vibrant-stat-card-modern::after {
          content: ''; position: absolute; top: -50%; right: -50%; width: 120px; height: 120px;
          background: var(--accent-color); opacity: 0.05; border-radius: 50%; filter: blur(35px);
        }

        .vibrant-stat-header-modern { display: flex; justify-content: space-between; align-items: center; }
        .vibrant-icon-container { 
          width: 42px; height: 42px; border-radius: 12px; 
          display: flex; align-items: center; justify-content: center; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .stat-trend-indicator { 
          padding: 0.3rem 0.6rem; background: #ecfdf5; color: #10b981; 
          border-radius: 100px; font-size: 0.65rem; font-weight: 800; 
          display: flex; align-items: center; gap: 4px; 
        }
        .stat-label-modern { font-size: 0.8rem; font-weight: 700; color: #64748b; }
        .stat-value-group { display: flex; justify-content: space-between; align-items: flex-end; }
        .stat-main-value-modern { font-size: 1.5rem; font-weight: 900; color: #1e293b; letter-spacing: -0.02em; }
        
        .stat-mini-chart { display: flex; align-items: flex-end; gap: 2px; height: 28px; }
        .mini-bar { width: 3px; border-radius: 10px; opacity: 0.6; }

        .stat-progress-container-modern { height: 5px; background: #f1f5f9; border-radius: 100px; overflow: hidden; margin-top: 0.25rem; }
        .stat-progress-fill-modern { height: 100%; border-radius: 100px; }

        /* Upcoming Activities Modern */
        .upcoming-activities-section-modern { margin-top: 0.25rem; }
        .section-header-modern { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .title-with-icon-modern { display: flex; align-items: center; gap: 0.75rem; }
        .icon-box { 
          width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 16px -4px rgba(0,0,0,0.1); color: white;
        }
        .icon-box.primary { background: var(--primary); }
        .icon-box.accent { background: var(--secondary); }
        .icon-box.warning { background: #f59e0b; }

        .title-text h3 { font-size: 1.1rem; font-weight: 900; color: #1e293b; margin: 0; }
        .subtitle { font-size: 0.65rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

        .btn-manage-kegiatan {
          background: white; border: 1px solid #e2e8f0; padding: 0.4rem 1rem; border-radius: 10px;
          font-weight: 700; font-size: 0.75rem; color: var(--primary); display: flex; align-items: center; gap: 6px;
          transition: all 0.2s; box-shadow: var(--shadow-sm); cursor: pointer;
        }
        .btn-manage-kegiatan:hover { background: var(--primary); color: white; border-color: var(--primary); transform: translateX(-2px); }

        .activity-grid-modern { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .activity-card-modern { display: flex; flex-direction: column; gap: 0.75rem; position: relative; }
        .act-header-modern { display: flex; justify-content: space-between; align-items: center; }
        .act-type-tag { font-size: 0.6rem; font-weight: 900; padding: 0.2rem 0.6rem; border-radius: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
        .act-type-tag.rapat { background: #dbeafe; color: #2563eb; }
        .act-type-tag.acara { background: #fef3c7; color: #d97706; }
        .act-type-tag.urgent { background: #fee2e2; color: #dc2626; }
        
        .act-title-modern { font-size: 1rem; font-weight: 800; color: #1e293b; line-height: 1.3; }
        .act-info-row { display: flex; gap: 0.75rem; }
        .act-info-item { font-size: 0.7rem; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 3px; }
        .act-desc-modern { font-size: 0.8rem; color: #64748b; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .act-footer-modern { margin-top: 0.25rem; padding-top: 0.75rem; border-top: 1px solid #f1f5f9; }
        .btn-details-act { background: transparent; border: none; color: var(--primary); font-weight: 800; font-size: 0.75rem; cursor: pointer; padding: 0; }
        .btn-details-act:hover { text-decoration: underline; }

        /* Timeline & Grids */
        .dashboard-layout-grids-modern { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1rem; }
        .main-data-section-modern { display: flex; flex-direction: column; gap: 1rem; }
        .btn-link-modern { background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 0.7rem; color: #475569; display: flex; align-items: center; gap: 5px; cursor: pointer; transition: all 0.2s; }
        .btn-link-modern:hover { background: #f1f5f9; color: var(--primary); border-color: var(--primary); }

        .timeline-item-modern { display: flex; gap: 1rem; }
        .marker-dot-premium { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); margin-top: 0.85rem; z-index: 2; }
        .marker-line-premium { width: 2px; height: calc(100% - 10px); background: #f1f5f9; position: absolute; left: 4px; top: 22px; z-index: 1; }
        .timeline-marker-modern { position: relative; width: 10px; flex-shrink: 0; }

        .timeline-content-modern { 
          flex: 1; padding: 1rem; border-radius: 16px; background: #fff; border: 1px solid #f1f5f9;
          margin-bottom: 1rem; transition: all 0.3s; box-shadow: var(--shadow-sm);
        }
        .timeline-content-modern:hover { transform: scale(1.01); border-color: var(--primary); box-shadow: var(--shadow-md); }
        .letter-tag-premium { font-size: 0.55rem; font-weight: 900; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase; color: #64748b; }
        .letter-tag-premium.masuk { color: #2563eb; background: #eff6ff; }
        .letter-tag-premium.keluar { color: #10b981; background: #ecfdf5; }
        .letter-summary-modern { font-size: 0.8rem; }

        /* Chart Styles */
        .premium-chart-modern { height: 160px; margin: 1.5rem 0; padding-bottom: 0.5rem; }
        .chart-bars-wrapper-modern { display: flex; align-items: flex-end; gap: 0.6rem; height: 100%; justify-content: space-between; }
        .premium-bar-group-modern { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; height: 100%; }
        .premium-bar-modern { 
          width: 100%; border-radius: 8px 8px 4px 4px; background: linear-gradient(to top, #2563eb, #818cf8); 
          position: relative; animation: growBarFade 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; 
          animation-delay: var(--delay); opacity: 0; box-shadow: 0 4px 12px rgba(37,99,235,0.2);
        }
        .bar-tooltip { 
          position: absolute; top: -30px; left: 50%; transform: translateX(-50%); 
          background: #1e293b; color: white; padding: 3px 6px; border-radius: 4px; 
          font-size: 0.6rem; font-weight: 800; opacity: 0; transition: opacity 0.3s; pointer-events: none;
        }
        .premium-bar-modern:hover .bar-tooltip { opacity: 1; }
        .bar-glow-modern { position: absolute; top: -8px; left: 0; right: 0; height: 16px; background: #3b82f6; filter: blur(12px); opacity: 0.3; }
        
        .chart-legend-modern { padding-top: 1rem; border-top: 1px solid #f1f5f9; }
        .legend-dot-premium { width: 8px; height: 8px; border-radius: 50%; background: #2563eb; box-shadow: 0 0 10px rgba(37,99,235,0.5); }
        .legend-item-modern { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.75rem; color: #1e293b; margin-bottom: 0.4rem; }
        .legend-note-modern { font-size: 0.65rem; }

        /* Sidebar Alerts Premium */
        .closing-alert-card-premium { 
          display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 2rem;
          background: linear-gradient(90deg, #fffbeb, #fff7ed); border-radius: 20px;
          border: 1px solid #fed7aa; box-shadow: var(--shadow-md);
        }
        .alert-icon-wrapper-premium { width: 50px; height: 50px; border-radius: 16px; background: #ffedd5; color: #f97316; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(249, 115, 22, 0.1); }
        .btn-glow { box-shadow: 0 0 12px rgba(37, 99, 235, 0.3); }

        @keyframes growBarFade { 0% { height: 0; opacity: 0; } 100% { opacity: 1; } }

        @media (max-width: 1200px) { .dashboard-layout-grids-modern { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { 
          .dashboard-hero { flex-direction: column; text-align: center; gap: 1.5rem; padding: 1.5rem; }
          .hero-content h1 { font-size: 1.5rem; }
        }

        /* Animation Classes */
        /* Work History Table Styles */
        .work-history-section-modern { width: 100%; }
        .history-badge { font-size: 0.6rem; font-weight: 900; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 0.25rem 0.6rem; border-radius: 6px; letter-spacing: 1px; }
        .table-responsive-compact { overflow-x: auto; margin-top: 0.5rem; }
        .history-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .history-table th { 
          text-align: left; padding: 0.75rem 1rem; font-size: 0.65rem; font-weight: 800; 
          text-transform: uppercase; color: #64748b; border-bottom: 2px solid #f1f5f9;
        }
        .history-table th svg { vertical-align: middle; margin-right: 6px; color: var(--primary); }
        .history-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f8fafc; vertical-align: middle; font-size: 0.8rem; }
        .history-table tr:last-child td { border-bottom: none; }
        .history-table tr:hover td { background: rgba(37, 99, 235, 0.02); }
        
        .history-date { display: flex; flex-direction: column; gap: 2px; }
        .date-main { font-weight: 800; color: #1e293b; }
        .date-time { font-size: 0.65rem; color: #94a3b8; font-weight: 600; }
        
        .menu-tag-premium { 
          font-size: 0.65rem; font-weight: 800; color: var(--primary); 
          background: rgba(37,99,235,0.08); padding: 0.25rem 0.6rem; border-radius: 6px;
          display: inline-block; white-space: nowrap;
        }
        .desc-cell-premium { color: #475569; font-weight: 500; min-width: 250px; }
        .petugas-cell-premium { display: flex; align-items: center; gap: 8px; font-weight: 700; color: #1e293b; }
        .user-avatar-mini { 
          width: 24px; height: 24px; background: var(--primary); color: white; 
          border-radius: 50%; display: flex; align-items: center; justify-content: center; 
          font-size: 0.7rem; font-weight: 800; flex-shrink: 0;
        }
        
        .empty-history { text-align: center; padding: 3rem !important; }
        .empty-flow { display: flex; flex-direction: column; align-items: center; gap: 1rem; color: #cbd5e1; }
        .empty-flow p { font-size: 0.85rem; font-weight: 600; }

        .fadeIn { animation: fadeIn 0.8s ease-out; }
        .slideUp { animation: slideUp 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0, transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* Delete Buttons */
        .btn-clear-history {
          background: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.7rem; font-weight: 800;
          display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s;
        }
        .btn-clear-history:hover { background: #ef4444; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
        .btn-delete-log { background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s; }
        .btn-delete-log:hover { color: #ef4444; background: rgba(239, 68, 68, 0.05); transform: scale(1.1); }
      ` }} />
    </div>
  );
};

export default Dashboard;
