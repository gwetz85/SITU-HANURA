import React from 'react';
import { 
  Mail, 
  Wallet, 
  Users, 
  Library, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  TrendingUp,
  FileText
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Surat Masuk', value: '12', change: '+2 hari ini', icon: <Mail size={24} />, color: '#3b82f6', trend: 'up' },
    { title: 'Surat Keluar', value: '8', change: '+1 hari ini', icon: <FileText size={24} />, color: '#10b981', trend: 'up' },
    { title: 'Saldo Kas', value: 'Rp 4.250.000', change: '-Rp 250k', icon: <Wallet size={24} />, color: '#f59e0b', trend: 'down' },
    { title: 'Karyawan', value: '15', change: 'Aktif', icon: <Users size={24} />, color: '#8b5cf6', trend: 'neutral' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Halo, Admin SITU HANURA!</h1>
          <p>Berikut adalah ringkasan data kantor hari ini.</p>
        </div>
        <div className="date-badge glass">
          <Clock size={16} />
          <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card glass-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-title">{stat.title}</span>
              <h3 className="stat-value">{stat.value}</h3>
              <div className={`stat-trend ${stat.trend}`}>
                {stat.trend === 'up' && <ArrowUpRight size={14} />}
                {stat.trend === 'down' && <ArrowDownRight size={14} />}
                <span>{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grids">
        <div className="data-card glass-card recent-activity">
          <div className="card-header">
            <h3>Aktivitas Terbaru</h3>
            <button className="view-all">Lihat Semua</button>
          </div>
          <div className="activity-list">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="activity-item">
                <div className="activity-indicator"></div>
                <div className="activity-content">
                  <p className="activity-text">Surat Masuk baru dari <strong>Dinas Pendidikan</strong></p>
                  <span className="activity-time">10 menit yang lalu</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="data-card glass-card quick-stats">
          <div className="card-header">
            <h3>Pustaka Digital</h3>
            <TrendingUp size={20} color="var(--primary)" />
          </div>
          <div className="chart-placeholder">
            <div className="chart-bar-container">
              {[60, 80, 45, 90, 70, 85].map((h, i) => (
                <div key={i} className="chart-bar" style={{ height: `${h}%` }}>
                  <div className="bar-tooltip">Arsip {i+1}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="chart-label">Statistik dokumen masuk/keluar 6 bulan terakhir</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-page {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }

        .dashboard-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .date-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 100px;
          font-size: 0.85rem;
          color: var(--text-muted);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .glass-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .stat-icon {
          width: 54px;
          height: 54px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-title {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0.1rem 0;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .stat-trend.up { color: #10b981; }
        .stat-trend.down { color: #ef4444; }
        .stat-trend.neutral { color: var(--text-muted); }

        .dashboard-grids {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1.5rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .view-all {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--primary);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding-bottom: 1.2rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .activity-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .activity-indicator {
          width: 10px;
          height: 10px;
          background: var(--primary);
          border-radius: 50%;
          margin-top: 5px;
          flex-shrink: 0;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .activity-text {
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .activity-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .chart-placeholder {
          height: 180px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .chart-bar-container {
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
          height: 100%;
          width: 100%;
        }

        .chart-bar {
          flex: 1;
          background: var(--primary);
          border-radius: 4px 4px 0 0;
          transition: all 0.3s;
          position: relative;
          opacity: 0.8;
        }

        .chart-bar:hover {
          opacity: 1;
          transform: scaleX(1.1);
        }

        .bar-tooltip {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--text-main);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.65rem;
          opacity: 0;
          transition: opacity 0.2s;
          white-space: nowrap;
        }

        .chart-bar:hover .bar-tooltip {
          opacity: 1;
        }

        .chart-label {
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .dashboard-grids {
            grid-template-columns: 1fr;
          }
        }
      ` }} />
    </div>
  );
};

export default Dashboard;
