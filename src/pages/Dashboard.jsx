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
  MapPin
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';
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
  const [recentActivity, setRecentActivity] = useState([]);
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

    // Listen to Recent Activity (Latest 4 Mails)
    const recentSMQuery = query(ref(db, 'surat/masuk'), limitToLast(4));
    const unsubscribeRecent = onValue(recentSMQuery, (snapshot) => {
      const activities = [];
      snapshot.forEach((child) => {
        activities.push({ id: child.key, ...child.val(), type: 'Masuk' });
      });
      setRecentActivity(activities.reverse());
      setLoading(false);
    });

    return () => {
      unsubscribeSM();
      unsubscribeSK();
      unsubscribePustaka();
      unsubscribeActs();
      unsubscribeRecent();
    };
  }, []);

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

      <div className="dashboard-layout-grids-modern">
        <div className="main-data-section-modern glass-card-premium">
          <div className="section-header-modern">
            <div className="title-with-icon-modern">
              <div className="icon-box accent">
                 <Clock size={20} />
              </div>
              <div className="title-text">
                 <h3>Aktivitas Korespondensi</h3>
                 <span className="subtitle">Update Data Terbaru</span>
              </div>
            </div>
            <button className="btn-link-modern">History Lengkap <ArrowRight size={14} /></button>
          </div>
          <div className="activity-timeline-modern text-fade-in">
            {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
              <div key={item.id} className="timeline-item-modern">
                <div className="timeline-marker-modern">
                   <div className="marker-dot-premium"></div>
                   {idx !== recentActivity.length - 1 && <div className="marker-line-premium"></div>}
                </div>
                <div className="timeline-content-modern card-hover-premium">
                  <div className="content-header-modern">
                    <span className={`letter-tag-premium ${item.type?.toLowerCase()}`}>{item.type}</span>
                    <span className="letter-date-premium">{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                  </div>
                  <p className="letter-summary-modern">
                    Surat dari <strong>{item.asal || item.tujuan}</strong> 
                    <span className="letter-subject"> "{item.tentang}"</span>
                  </p>
                </div>
              </div>
            )) : (
              <div className="empty-state-modern">
                <div className="empty-icon-box">
                   <Clock size={48} />
                </div>
                <p>Belum ada aktivitas korespondensi tercatat hari ini.</p>
              </div>
            )}
          </div>
        </div>

        <div className="side-stats-section-modern glass-card-premium">
          <div className="section-header-modern">
            <div className="title-with-icon-modern">
               <div className="icon-box warning">
                  <TrendingUp size={20} />
               </div>
               <div className="title-text">
                  <h3>Statistik Pustaka</h3>
                  <span className="subtitle">Tren Arsip Digital</span>
               </div>
            </div>
          </div>
          <div className="premium-chart-modern">
            <div className="chart-bars-wrapper-modern">
              {[40, 65, 30, 85, 55, 75, 95].map((h, i) => (
                <div key={i} className="premium-bar-group-modern">
                  <div className="premium-bar-modern" style={{ height: `${h}%`, '--delay': `${i * 0.1}s` }}>
                    <div className="bar-tooltip">{h}%</div>
                    <div className="bar-glow-modern"></div>
                  </div>
                  <span className="bar-label-modern">M{i+1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-legend-modern">
            <div className="legend-item-modern">
              <div className="legend-dot-premium"></div>
              <span>Volume Dokumen Masuk</span>
            </div>
            <p className="legend-note-modern">Visualisasi aktivitas digitalisasi dokumen SITU HANURA periode 7 bulan terakhir.</p>
          </div>
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

        .dashboard-page { display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 2rem; }
        
        /* Premium Hero Section */
        .dashboard-hero { 
          padding: 2.5rem 3rem; 
          border-radius: 24px; 
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
          font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1rem; 
          background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
          padding: 0.4rem 1rem; border-radius: 100px; width: fit-content; margin-bottom: 1.25rem;
          display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.2);
        }

        .dot-pulse { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulseOpacity 2s infinite; }
        @keyframes pulseOpacity { 0% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0.4; transform: scale(0.8); } }

        .hero-content h1 { font-size: 2.25rem; font-weight: 900; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        .hero-content p { font-size: 1rem; opacity: 0.9; max-width: 500px; line-height: 1.6; }
        .wave-emoji { display: inline-block; animation: wave 2.5s infinite; transform-origin: 70% 70%; }
        @keyframes wave { 0% { transform: rotate(0deg); } 10% { transform: rotate(14deg); } 20% { transform: rotate(-8deg); } 30% { transform: rotate(14deg); } 40% { transform: rotate(-4deg); } 50% { transform: rotate(10deg); } 60% { transform: rotate(0deg); } 100% { transform: rotate(0deg); } }
        
        .date-badge-modern { 
          display: flex; align-items: center; gap: 1.25rem; 
          padding: 1rem 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        }
        .calendar-icon-wrapper { 
          width: 48px; height: 48px; background: rgba(255,255,255,0.2); 
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
        }
        .date-text-modern { display: flex; flex-direction: column; }
        .date-name { font-weight: 900; font-size: 1.1rem; text-transform: uppercase; }
        .date-full { opacity: 0.85; font-size: 0.85rem; font-weight: 500; }

        /* Stats Cards Redesign */
        .vibrant-stats-grid-modern { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
        .glass-card-premium {
          background: var(--glass-bg); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border); border-radius: 24px; padding: 1.5rem;
          box-shadow: var(--shadow-md); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card-premium:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); border-color: var(--primary); }

        .vibrant-stat-card-modern { display: flex; flex-direction: column; gap: 1.25rem; position: relative; overflow: hidden; }
        .vibrant-stat-card-modern::after {
          content: ''; position: absolute; top: -50%; right: -50%; width: 150px; height: 150px;
          background: var(--accent-color); opacity: 0.05; border-radius: 50%; filter: blur(40px);
        }

        .vibrant-stat-header-modern { display: flex; justify-content: space-between; align-items: center; }
        .vibrant-icon-container { 
          width: 52px; height: 52px; border-radius: 16px; 
          display: flex; align-items: center; justify-content: center; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .stat-trend-indicator { 
          padding: 0.4rem 0.8rem; background: #ecfdf5; color: #10b981; 
          border-radius: 100px; font-size: 0.7rem; font-weight: 800; 
          display: flex; align-items: center; gap: 6px; 
        }
        .stat-label-modern { font-size: 0.9rem; font-weight: 700; color: #64748b; }
        .stat-value-group { display: flex; justify-content: space-between; align-items: flex-end; }
        .stat-main-value-modern { font-size: 2rem; font-weight: 900; color: #1e293b; letter-spacing: -0.02em; }
        
        .stat-mini-chart { display: flex; align-items: flex-end; gap: 3px; height: 32px; }
        .mini-bar { width: 4px; border-radius: 10px; opacity: 0.6; }

        .stat-progress-container-modern { height: 6px; background: #f1f5f9; border-radius: 100px; overflow: hidden; margin-top: 0.5rem; }
        .stat-progress-fill-modern { height: 100%; border-radius: 100px; }

        /* Upcoming Activities Modern */
        .upcoming-activities-section-modern { margin-top: 0.5rem; }
        .section-header-modern { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .title-with-icon-modern { display: flex; align-items: center; gap: 1rem; }
        .icon-box { 
          width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 16px -4px rgba(0,0,0,0.1); color: white;
        }
        .icon-box.primary { background: var(--primary); }
        .icon-box.accent { background: var(--secondary); }
        .icon-box.warning { background: #f59e0b; }

        .title-text h3 { font-size: 1.25rem; font-weight: 900; color: #1e293b; margin: 0; }
        .subtitle { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

        .btn-manage-kegiatan {
          background: white; border: 1px solid #e2e8f0; padding: 0.6rem 1.25rem; border-radius: 12px;
          font-weight: 700; font-size: 0.85rem; color: var(--primary); display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; box-shadow: var(--shadow-sm); cursor: pointer;
        }
        .btn-manage-kegiatan:hover { background: var(--primary); color: white; border-color: var(--primary); transform: translateX(-4px); }

        .activity-grid-modern { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .activity-card-modern { display: flex; flex-direction: column; gap: 1rem; position: relative; }
        .act-header-modern { display: flex; justify-content: space-between; align-items: center; }
        .act-type-tag { font-size: 0.65rem; font-weight: 900; padding: 0.25rem 0.75rem; border-radius: 6px; text-transform: uppercase; letter-spacing: 1px; }
        .act-type-tag.rapat { background: #dbeafe; color: #2563eb; }
        .act-type-tag.acara { background: #fef3c7; color: #d97706; }
        .act-type-tag.urgent { background: #fee2e2; color: #dc2626; }
        
        .act-title-modern { font-size: 1.15rem; font-weight: 800; color: #1e293b; line-height: 1.4; }
        .act-info-row { display: flex; gap: 1rem; }
        .act-info-item { font-size: 0.75rem; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .act-desc-modern { font-size: 0.9rem; color: #64748b; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .act-footer-modern { margin-top: 0.5rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
        .btn-details-act { background: transparent; border: none; color: var(--primary); font-weight: 800; font-size: 0.8rem; cursor: pointer; padding: 0; }
        .btn-details-act:hover { text-decoration: underline; }

        /* Timeline & Grids */
        .dashboard-layout-grids-modern { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1.5rem; }
        .main-data-section-modern { display: flex; flex-direction: column; gap: 1.5rem; }
        .btn-link-modern { background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 10px; font-weight: 700; font-size: 0.75rem; color: #475569; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; }
        .btn-link-modern:hover { background: #f1f5f9; color: var(--primary); border-color: var(--primary); }

        .timeline-item-modern { display: flex; gap: 1.25rem; }
        .marker-dot-premium { width: 12px; height: 12px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 0 4px rgba(37,99,235,0.1); margin-top: 1rem; z-index: 2; }
        .marker-line-premium { width: 2px; height: calc(100% - 12px); background: #f1f5f9; position: absolute; left: 5px; top: 24px; z-index: 1; }
        .timeline-marker-modern { position: relative; width: 12px; flex-shrink: 0; }

        .timeline-content-modern { 
          flex: 1; padding: 1.25rem; border-radius: 20px; background: #fff; border: 1px solid #f1f5f9;
          margin-bottom: 1.25rem; transition: all 0.3s; box-shadow: var(--shadow-sm);
        }
        .timeline-content-modern:hover { transform: scale(1.02); border-color: var(--primary); box-shadow: var(--shadow-md); }
        .letter-tag-premium { font-size: 0.6rem; font-weight: 900; background: #f1f5f9; padding: 0.25rem 0.6rem; border-radius: 4px; text-transform: uppercase; color: #64748b; }
        .letter-tag-premium.masuk { color: #2563eb; background: #eff6ff; }
        .letter-tag-premium.keluar { color: #10b981; background: #ecfdf5; }

        /* Chart Styles */
        .premium-chart-modern { height: 200px; margin: 2rem 0; padding-bottom: 1rem; }
        .chart-bars-wrapper-modern { display: flex; align-items: flex-end; gap: 0.75rem; height: 100%; justify-content: space-between; }
        .premium-bar-group-modern { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 1rem; height: 100%; }
        .premium-bar-modern { 
          width: 100%; border-radius: 12px 12px 6px 6px; background: linear-gradient(to top, #2563eb, #818cf8); 
          position: relative; animation: growBarFade 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards; 
          animation-delay: var(--delay); opacity: 0; box-shadow: 0 4px 12px rgba(37,99,235,0.2);
        }
        .bar-tooltip { 
          position: absolute; top: -35px; left: 50%; transform: translateX(-50%); 
          background: #1e293b; color: white; padding: 4px 8px; border-radius: 6px; 
          font-size: 0.65rem; font-weight: 800; opacity: 0; transition: opacity 0.3s; pointer-events: none;
        }
        .premium-bar-modern:hover .bar-tooltip { opacity: 1; }
        .bar-glow-modern { position: absolute; top: -10px; left: 0; right: 0; height: 20px; background: #3b82f6; filter: blur(15px); opacity: 0.3; }
        
        .chart-legend-modern { padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
        .legend-dot-premium { width: 10px; height: 10px; border-radius: 50%; background: #2563eb; box-shadow: 0 0 10px rgba(37,99,235,0.5); }
        .legend-item-modern { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 0.8rem; color: #1e293b; margin-bottom: 0.5rem; }

        /* Sidebar Alerts Premium */
        .closing-alert-card-premium { 
          display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem 2.5rem;
          background: linear-gradient(90deg, #fffbeb, #fff7ed); border-radius: 24px;
          border: 1px solid #fed7aa; box-shadow: var(--shadow-md);
        }
        .alert-icon-wrapper-premium { width: 60px; height: 60px; border-radius: 18px; background: #ffedd5; color: #f97316; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(249, 115, 22, 0.1); }
        .btn-glow { box-shadow: 0 0 15px rgba(37, 99, 235, 0.4); }

        @keyframes growBarFade { 0% { height: 0; opacity: 0; } 100% { opacity: 1; } }

        @media (max-width: 1200px) { .dashboard-layout-grids-modern { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { 
          .dashboard-hero { flex-direction: column; text-align: center; gap: 2rem; padding: 2rem; }
          .hero-content h1 { font-size: 1.75rem; }
        }

        /* Animation Classes */
        .fadeIn { animation: fadeIn 0.8s ease-out; }
        .slideUp { animation: slideUp 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      ` }} />
    </div>
  );
};

export default Dashboard;
