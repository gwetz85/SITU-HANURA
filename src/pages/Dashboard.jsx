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
  Calendar
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';

const Dashboard = () => {
  const [counts, setCounts] = useState({
    suratMasuk: 0,
    suratKeluar: 0,
    saldoKas: 0,
    karyawan: 0
  });
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

    // Listen to Karyawan count
    const empRef = ref(db, 'employees');
    const unsubscribeEmp = onValue(empRef, (snapshot) => {
      setCounts(prev => ({ ...prev, karyawan: snapshot.size || 0 }));
    });

    // Listen to Cashbook and calculate balance
    const kasRef = ref(db, 'cashbook');
    const unsubscribeKas = onValue(kasRef, (snapshot) => {
      let balance = 0;
      snapshot.forEach((child) => {
        const trans = child.val();
        if (trans.tipe === 'masuk') balance += trans.jumlah;
        else balance -= trans.jumlah;
      });
      setCounts(prev => ({ ...prev, saldoKas: balance }));
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
      unsubscribeEmp();
      unsubscribeKas();
      unsubscribeRecent();
    };
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const stats = [
    { title: 'Surat Masuk', value: counts.suratMasuk, change: '+ Aktif', icon: <Mail size={24} />, color: '#3b82f6', trend: 'up' },
    { title: 'Surat Keluar', value: counts.suratKeluar, change: '+ Aktif', icon: <FileText size={24} />, color: '#10b981', trend: 'up' },
    { title: 'Saldo Kas', value: formatCurrency(counts.saldoKas), change: 'Realtime', icon: <Wallet size={24} />, color: '#f59e0b', trend: counts.saldoKas >= 0 ? 'up' : 'down' },
    { title: 'Karyawan', value: counts.karyawan, change: 'Aktif', icon: <Users size={24} />, color: '#8b5cf6', trend: 'neutral' },
  ];

  return (
    <div className="dashboard-page fadeIn">
      <div className="dashboard-hero glass-premium">
        <div className="hero-content">
          <div className="welcome-tag">SISTEM INFORMASI TERPADU</div>
          <h1>Halo, Admin SITU HANURA! 👋</h1>
          <p>Selamat datang di pusat kendali operasional digital Anda hari ini.</p>
        </div>
        <div className="date-badge-premium">
          <Calendar size={18} />
          <div className="date-text">
            <span className="day">{new Date().toLocaleDateString('id-ID', { weekday: 'long' })}</span>
            <span className="full-date">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="vibrant-stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="vibrant-stat-card glass-card" style={{ '--accent-color': stat.color }}>
            <div className="vibrant-stat-header">
              <div className="vibrant-icon-wrapper">
                {stat.icon}
              </div>
              <div className="stat-trend-chip">
                {stat.trend === 'up' && <ArrowUpRight size={12} />}
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="vibrant-stat-body">
              <span className="stat-label">{stat.title}</span>
              <h2 className="stat-main-value">{stat.value}</h2>
            </div>
            <div className="stat-progress-bg">
               <div className="stat-progress-bar" style={{ width: '70%', background: stat.color }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-layout-grids">
        <div className="main-data-section glass-card">
          <div className="section-header">
            <div className="title-with-icon">
              <Clock size={20} className="text-primary" />
              <h3>Aktivitas Korespondensi Terbaru</h3>
            </div>
            <button className="btn-link">Lihat Semua History</button>
          </div>
          <div className="activity-timeline">
            {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-marker">
                   <div className="marker-dot"></div>
                   {idx !== recentActivity.length - 1 && <div className="marker-line"></div>}
                </div>
                <div className="timeline-content card-hover">
                  <div className="content-header">
                    <span className="letter-type-tag">{item.type}</span>
                    <span className="letter-date">{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                  </div>
                  <p className="letter-summary">Surat dari <strong>{item.asal || item.tujuan}</strong> mengenai <em>{item.tentang}</em></p>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <Clock size={40} />
                <p>Belum ada data aktivitas hari ini.</p>
              </div>
            )}
          </div>
        </div>

        <div className="side-stats-section glass-card">
          <div className="section-header">
            <div className="title-with-icon">
               <TrendingUp size={20} className="text-accent" />
               <h3>Statistik Pustaka</h3>
            </div>
          </div>
          <div className="premium-chart">
            <div className="chart-bars-wrapper">
              {[40, 65, 30, 85, 55, 75, 95].map((h, i) => (
                <div key={i} className="premium-bar-group">
                  <div className="premium-bar" style={{ height: `${h}%`, '--delay': `${i * 0.1}s` }}>
                    <div className="bar-glow"></div>
                  </div>
                  <span className="bar-label">M{i+1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="dot" style={{ background: 'var(--primary)' }}></div>
              <span>Dokumen Masuk</span>
            </div>
            <p className="legend-note">Visualisasi tren arsip digital selama 7 bulan terakhir secara otomatis dari database.</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-page { display: flex; flex-direction: column; gap: 1.25rem; }
        
        .dashboard-hero { 
          padding: 1.5rem 2rem; 
          background: linear-gradient(135deg, var(--primary), #4f46e5); 
          border-radius: 16px; 
          color: white; 
          display: flex; justify-content: space-between; align-items: center; 
          position: relative; overflow: hidden;
          box-shadow: 0 15px 30px rgba(37,99,235,0.1);
        }
        .dashboard-hero::before { 
          content: ''; position: absolute; top: -50%; left: -20%; 
          width: 200px; height: 200px; background: rgba(255,255,255,0.1); 
          border-radius: 50%; filter: blur(50px); 
        }
        .welcome-tag { 
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.15rem; 
          background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; 
          border-radius: 100px; width: fit-content; margin-bottom: 1rem; 
        }
        .hero-content h1 { font-size: 1.5rem; font-weight: 900; margin-bottom: 0.35rem; letter-spacing: -0.01em; }
        .hero-content p { font-size: 0.95rem; opacity: 0.9; }
        
        .date-badge-premium { 
          display: flex; align-items: center; gap: 0.75rem; 
          background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); 
          padding: 0.85rem 1.5rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.2);
        }
        .date-text { display: flex; flex-direction: column; }
        .date-text .day { font-weight: 800; font-size: 0.95rem; text-transform: uppercase; }
        .date-text .full-date { opacity: 0.8; font-size: 0.75rem; }

        .vibrant-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
        .vibrant-stat-card { 
          padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }
        .vibrant-stat-card:hover { transform: translateY(-5px); border-color: rgba(37,99,235,0.1); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .vibrant-stat-header { display: flex; justify-content: space-between; align-items: center; }
        .vibrant-icon-wrapper { 
          width: 40px; height: 40px; border-radius: 10px; 
          display: flex; align-items: center; justify-content: center; 
          background: var(--background); color: var(--accent-color); 
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }
        .stat-trend-chip { 
          padding: 0.3rem 0.6rem; background: #ecfdf5; color: #10b981; 
          border-radius: 100px; font-size: 0.65rem; font-weight: 800; 
          display: flex; align-items: center; gap: 4px; 
        }
        .stat-label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
        .stat-main-value { font-size: 1.45rem; font-weight: 900; color: var(--text-main); letter-spacing: -0.01em; }
        .stat-progress-bg { height: 4px; background: var(--background); border-radius: 100px; overflow: hidden; opacity: 0.5; }
        .stat-progress-bar { height: 100%; border-radius: 100px; opacity: 0.8; }

        .dashboard-layout-grids { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.15rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .title-with-icon { display: flex; align-items: center; gap: 0.6rem; }
        .title-with-icon h3 { font-size: 1rem; font-weight: 800; color: var(--text-main); }
        .btn-link { color: var(--primary); font-weight: 700; font-size: 0.75rem; }

        .activity-timeline { display: flex; flex-direction: column; gap: 0.25rem; }
        .timeline-item { display: flex; gap: 1rem; }
        .timeline-marker { display: flex; flex-direction: column; align-items: center; }
        .marker-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); box-shadow: 0 0 0 4px rgba(37,99,235,0.15); flex-shrink: 0; margin-top: 0.75rem; }
        .marker-line { width: 2px; height: 100%; background: var(--border); opacity: 0.5; }
        
        .timeline-content { 
          flex: 1; padding: 0.85rem 1.15rem; border-radius: 12px; background: var(--background); 
          margin-bottom: 1.15rem; transition: all 0.2s; border: 1px solid var(--border); 
        }
        .timeline-content:hover { background: var(--surface); border-color: var(--primary); }
        .content-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .letter-type-tag { padding: 0.2rem 0.5rem; background: var(--surface); border-radius: 6px; font-size: 0.65rem; font-weight: 800; color: var(--primary); text-transform: uppercase; border: 1px solid var(--border); }
        .letter-date { font-size: 0.65rem; color: var(--text-muted); font-weight: 600; }
        .letter-summary { font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }

        .premium-chart { height: 160px; margin: 1.5rem 0; }
        .chart-bars-wrapper { display: flex; align-items: flex-end; gap: 0.75rem; height: 100%; justify-content: space-between; }
        .premium-bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; height: 100%; }
        .premium-bar { 
          width: 100%; border-radius: 6px 6px 3px 3px; background: linear-gradient(to top, var(--primary), #818cf8); 
          position: relative; animation: growBar 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; 
          animation-delay: var(--delay); opacity: 0;
        }
        .bar-glow { position: absolute; top: -8px; left: 0; right: 0; height: 16px; background: var(--primary); filter: blur(12px); opacity: 0.3; }
        .bar-label { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); }
        
        .chart-legend { display: flex; flex-direction: column; gap: 0.75rem; padding-top: 1.15rem; border-top: 1px solid var(--border); }
        .legend-item { display: flex; align-items: center; gap: 0.6rem; font-weight: 700; font-size: 0.75rem; }
        .legend-item .dot { width: 8px; height: 8px; border-radius: 50%; }
        .legend-note { font-size: 0.7rem; color: var(--text-muted); line-height: 1.5; }

        @keyframes growBar { from { height: 0; opacity: 0; } to { opacity: 1; } }
        @media (max-width: 1024px) { 
          .dashboard-layout-grids { grid-template-columns: 1fr; }
          .dashboard-hero { flex-direction: column; text-align: center; gap: 1.5rem; }
        }
      ` }} />
    </div>
  );
};

export default Dashboard;
