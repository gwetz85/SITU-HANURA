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
  Sparkles
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

    // Listen to Activities
    const actRef = ref(db, 'activities');
    const unsubscribeActs = onValue(actRef, (snapshot) => {
      const items = [];
      snapshot.forEach((child) => {
        const val = child.val();
        if (val.status !== 'Selesai') {
          items.push({ id: child.key, ...val });
        }
      });
      setActivities(items.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 4));
    });

    // Listen to Logs
    const logsRef = ref(db, 'logs');
    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      const logItems = [];
      snapshot.forEach((child) => {
        logItems.push({ id: child.key, ...child.val() });
      });
      setLogs(logItems.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
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

  const stats = [
    { title: 'Surat Masuk', value: counts.suratMasuk, change: 'Aktif', icon: <Mail size={20} />, color: '#3b82f6' },
    { title: 'Surat Keluar', value: counts.suratKeluar, change: 'Aktif', icon: <FileText size={20} />, color: '#10b981' },
    { title: 'Pustaka', value: counts.pustaka, change: 'Arsip', icon: <Library size={20} />, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-compact-page fadeIn">
      {/* Compact Hero Section */}
      <div className="dash-hero-mini">
        <div className="hero-info-compact">
          <div className="badge-premium-mini">
             <Sparkles size={12} /> SITU HANURA • DASHBOARD
          </div>
          <h1>Halo, {user?.name || user?.username}! 👋</h1>
          <p>Operasional sistem hari ini berjalan normal dan optimal.</p>
        </div>
        <div className="hero-date-box glass-pure">
           <Calendar size={18} className="text-primary" />
           <div className="date-stack">
              <span className="day-txt">{new Date().toLocaleDateString('id-ID', { weekday: 'short' })}</span>
              <span className="val-txt">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
           </div>
        </div>
      </div>

      {/* Alert Tutup Buku - Compact */}
      {(() => {
        const now = new Date();
        const currentMonthId = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        if (workingMonth < currentMonthId && user?.role === 'Admin') {
          return (
            <div className="alert-strip-premium slideDown">
              <div className="alert-msg">
                <AlertTriangle size={18} />
                <span>Waktunya Tutup Buku Periode <strong>{new Date(`${workingMonth}-01`).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</strong></span>
              </div>
              <button className="btn-alert-action" onClick={() => navigate('/karyawan')}>Tutup Buku <ArrowRight size={14} /></button>
            </div>
          );
        }
        return null;
      })()}

      <div className="dashboard-main-grid">
        <div className="dash-left-column">
          {/* Quick Stats Gallery */}
          <div className="stats-gallery-horizontal">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card-elegant glass-card-premium" style={{ '--accent': stat.color }}>
                <div className="stat-card-top">
                  <div className="icon-badge-mini" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
                  <div className="status-label-mini">LIVE</div>
                </div>
                <div className="stat-card-body">
                   <span className="stat-lbl-txt">{stat.title}</span>
                   <div className="stat-val-row">
                      <h2 className="stat-val-big">{stat.value}</h2>
                      <div className="mini-wave-viz" style={{ color: stat.color }}>
                         <TrendingUp size={16} />
                      </div>
                   </div>
                </div>
                <div className="stat-progress-bar-mini">
                   <div className="bar-fill" style={{ background: stat.color, width: '65%' }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Section - Compact */}
          {activities.length > 0 && (
            <div className="dash-activity-section glass-card-premium slideUp">
              <div className="sec-header-mini">
                <div className="title-grp">
                   <Zap size={18} className="text-primary" />
                   <h3>Agenda Mendatang</h3>
                </div>
                {user?.role === 'Admin' && (
                  <button className="btn-sec-link" onClick={() => navigate('/admin/kegiatan')}>Semua <ArrowRight size={12} /></button>
                )}
              </div>
              <div className="activity-list-mini">
                {activities.map(act => (
                  <div key={act.id} className="act-item-mini">
                    <div className="act-time-badge">
                       <span className="t-day">{new Date(act.tanggal).getDate()}</span>
                       <span className="t-mon">{new Date(act.tanggal).toLocaleString('id-ID', { month: 'short' })}</span>
                    </div>
                    <div className="act-main-mini">
                       <h4 className="act-title">{act.judul}</h4>
                       <div className="act-meta">
                          <span><MapPin size={10} /> {act.lokasi}</span>
                          <span><Users size={10} /> {act.author}</span>
                       </div>
                    </div>
                    <span className={`act-tag ${act.tipe?.toLowerCase()}`}>{act.tipe}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dash-right-column">
           {/* Work History - Compact & Elegant */}
           <div className="history-section-compact glass-card-premium slideUp">
              <div className="sec-header-mini">
                <div className="title-grp">
                   <Clock size={18} className="text-warning" />
                   <h3>Riwayat Terkini</h3>
                </div>
                {user?.role === 'Admin' && logs.length > 0 && (
                  <button className="btn-clear-mini" onClick={handleClearLogs} title="Bersihkan">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="history-timeline">
                 {logs.length > 0 ? logs.map((log) => (
                   <div key={log.id} className="history-item">
                      <div className="h-marker" style={{ borderColor: log.menu === 'Pelayanan Masyarakat' ? '#2563eb' : (log.menu === 'Surat Menyurat' ? '#10b981' : '#94a3b8') }}></div>
                      <div className="h-content">
                         <div className="h-top-row">
                            <span className="h-menu">{log.menu}</span>
                            <span className="h-time">{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                         <p className="h-desc">{log.keterangan}</p>
                         <div className="h-petugas">
                            <div className="av-mini" style={{ background: '#f1f5f9' }}>{log.petugas?.charAt(0)}</div>
                            <span>{log.petugas}</span>
                         </div>
                      </div>
                      {user?.role === 'Admin' && (
                        <button className="h-delete-btn" onClick={() => handleDeleteLog(log.id)}><Trash2 size={12} /></button>
                      )}
                   </div>
                 )) : (
                   <div className="h-empty">Belum ada aktivitas.</div>
                 )}
              </div>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-compact-page { display: flex; flex-direction: column; gap: 1.5rem; }

        .dash-hero-mini {
          padding: 1.75rem 2rem; background: linear-gradient(135deg, var(--primary) 0%, #4461f2 100%);
          border-radius: 24px; color: white; display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.1); position: relative; overflow: hidden;
        }
        
        .hero-info-compact h1 { font-size: 1.8rem; font-weight: 900; margin: 0.25rem 0; letter-spacing: -0.03em; }
        .hero-info-compact p { font-size: 0.85rem; opacity: 0.9; }
        .badge-premium-mini {
          background: rgba(255,255,255,0.2); backdrop-filter: blur(8px);
          padding: 0.3rem 0.8rem; border-radius: 100px; font-size: 0.6rem; font-weight: 800;
          display: flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.3);
        }

        .hero-date-box {
          background: rgba(255,255,255,0.1); backdrop-filter: blur(12px);
          padding: 0.75rem 1.25rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; gap: 1rem;
        }
        .date-stack { display: flex; flex-direction: column; line-height: 1.1; }
        .day-txt { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; opacity: 0.7; }
        .val-txt { font-size: 1.1rem; font-weight: 900; }

        .alert-strip-premium {
          padding: 0.85rem 1.5rem; background: #fff7ed; border: 1px solid #fed7aa;
          border-radius: 16px; display: flex; justify-content: space-between; align-items: center;
        }
        .alert-msg { display: flex; align-items: center; gap: 10px; color: #9a3412; font-size: 0.85rem; font-weight: 600; }
        .btn-alert-action {
          background: #f97316; color: white; padding: 0.5rem 1rem; border-radius: 10px;
          font-size: 0.75rem; font-weight: 800; display: flex; align-items: center; gap: 6px;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .btn-alert-action:hover { background: #ea580c; transform: translateX(-5px); }

        .dashboard-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; }
        .dash-left-column { display: flex; flex-direction: column; gap: 1.5rem; }
        
        .stats-gallery-horizontal { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.25rem; }
        .stat-card-elegant {
          flex: 1; min-width: 200px; background: white; border-radius: 24px; padding: 1.5rem;
          display: flex; flex-direction: column; gap: 1.25rem; border: 1px solid rgba(0,0,0,0.03);
          box-shadow: 0 8px 24px rgba(0,0,0,0.02); transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .stat-card-elegant:hover { transform: translateY(-5px); border-color: var(--accent); box-shadow: 0 15px 35px rgba(0,0,0,0.06); }
        .stat-card-top { display: flex; justify-content: space-between; align-items: center; }
        .icon-badge-mini { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .status-label-mini { font-size: 0.6rem; font-weight: 900; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; }

        .stat-card-body { display: flex; flex-direction: column; gap: 4px; }
        .stat-lbl-txt { font-size: 0.75rem; font-weight: 700; color: #64748b; }
        .stat-val-row { display: flex; justify-content: space-between; align-items: flex-end; }
        .stat-val-big { font-size: 2rem; font-weight: 950; color: #0f172a; line-height: 1; }
        .mini-wave-viz { opacity: 0.3; }
        .stat-progress-bar-mini { height: 4px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 10px; }

        .dash-activity-section { padding: 1.5rem; border-radius: 24px; background: white; }
        .sec-header-mini { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .title-grp { display: flex; align-items: center; gap: 10px; }
        .title-grp h3 { font-size: 1.1rem; font-weight: 900; color: #1e293b; margin: 0; }
        .btn-sec-link { background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.4rem 0.8rem; border-radius: 10px; font-weight: 800; font-size: 0.7rem; color: var(--primary); cursor: pointer; display: flex; align-items: center; gap: 4px; }

        .activity-list-mini { display: flex; flex-direction: column; gap: 0.75rem; }
        .act-item-mini {
          display: flex; align-items: center; gap: 1.25rem; padding: 0.85rem; border-radius: 16px;
          border: 1px solid #f1f5f9; transition: all 0.2s;
        }
        .act-item-mini:hover { background: #f8fafc; border-color: var(--primary); transform: translateX(5px); }
        .act-time-badge {
          width: 48px; height: 48px; min-width: 48px; background: var(--background); border-radius: 12px;
          display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1;
        }
        .t-day { font-size: 1.2rem; font-weight: 900; color: var(--primary); }
        .t-mon { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; }
        .act-main-mini { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .act-title { font-size: 0.95rem; font-weight: 800; color: #1e293b; margin: 0; }
        .act-meta { display: flex; gap: 10px; font-size: 0.65rem; color: #94a3b8; font-weight: 600; }
        .act-tag { font-size: 0.6rem; font-weight: 900; padding: 0.25rem 0.6rem; border-radius: 6px; text-transform: uppercase; }
        .act-tag.rapat { background: #dbeafe; color: #2563eb; }
        .act-tag.acara { background: #fef3c7; color: #d97706; }

        .history-section-compact { padding: 1.5rem; border-radius: 24px; background: white; display: flex; flex-direction: column; height: 100%; }
        .history-timeline { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 0.5rem; }
        .history-item { display: flex; gap: 1rem; position: relative; }
        .h-marker { width: 4px; height: auto; min-height: 40px; border-left: 2px solid #e2e8f0; padding-left: 1rem; position: relative; }
        .h-marker::after { content: ''; position: absolute; top: 0; left: -3px; width: 6px; height: 6px; border-radius: 50%; background: inherit; border: 2px solid white; box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }
        .h-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .h-top-row { display: flex; justify-content: space-between; align-items: center; }
        .h-menu { font-size: 0.65rem; font-weight: 900; color: var(--primary); letter-spacing: 0.5px; }
        .h-time { font-size: 0.65rem; font-weight: 700; color: #94a3b8; }
        .h-desc { font-size: 0.85rem; font-weight: 600; color: #1e293b; margin: 0; line-height: 1.4; }
        .h-petugas { display: flex; align-items: center; gap: 6px; font-size: 0.65rem; font-weight: 700; color: #94a3b8; margin-top: 4px; }
        .av-mini { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 900; color: #64748b; }
        .h-delete-btn { position: absolute; right: 0; top: 0; width: 24px; height: 24px; border-radius: 6px; background: #fff1f2; color: #ef4444; border: none; cursor: pointer; opacity: 0; transition: all 0.2s; }
        .history-item:hover .h-delete-btn { opacity: 1; transform: translateX(-5px); }

        @media (max-width: 1024px) {
           .dashboard-main-grid { grid-template-columns: 1fr; }
           .dash-hero-mini { padding: 1.5rem; }
           .hero-info-compact h1 { font-size: 1.5rem; }
        }
      ` }} />
    </div>
  );
};

export default Dashboard;
