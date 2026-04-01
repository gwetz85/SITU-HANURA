import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  Award, 
  HeartPulse, 
  Briefcase, 
  UserPlus, 
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  BarChart3,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

const PelayananMasyarakat = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    nib: 0,
    halal: 0,
    bpjsApbd: 0,
    bpjsTk: 0,
    kependudukan: 0
  });

  useEffect(() => {
    const nibRef = ref(db, 'pelayanan/nib');
    const halalRef = ref(db, 'pelayanan/halal');
    
    const unsubNib = onValue(nibRef, (snapshot) => {
      setCounts(prev => ({ ...prev, nib: snapshot.exists() ? Object.keys(snapshot.val()).length : 0 }));
    });
    const unsubHalal = onValue(halalRef, (snapshot) => {
      setCounts(prev => ({ ...prev, halal: snapshot.exists() ? Object.keys(snapshot.val()).length : 0 }));
    });

    return () => {
      unsubNib();
      unsubHalal();
    };
  }, []);

  const services = [
    {
      id: 'nib',
      title: 'Registrasi NIB',
      icon: <Fingerprint size={22} />,
      color: '#3b82f6',
      path: '/pelayanan/nib',
      count: counts.nib,
      active: true
    },
    {
      id: 'halal',
      title: 'Registrasi Halal',
      icon: <ShieldCheck size={22} />,
      color: '#10b981',
      path: '/pelayanan/halal',
      count: counts.halal,
      active: true
    },
    {
      id: 'bpjs-apbd',
      title: 'BPJS APBD',
      icon: <HeartPulse size={22} />,
      color: '#ef4444',
      path: '/pelayanan/bpjs-apbd',
      count: counts.bpjsApbd,
      active: false
    },
    {
      id: 'bpjs-tk',
      title: 'BPJS TK',
      icon: <Briefcase size={22} />,
      color: '#f59e0b',
      path: '/pelayanan/bpjs-tk',
      count: counts.bpjsTk,
      active: false
    },
    {
      id: 'kependudukan',
      title: 'Data Penduduk',
      icon: <UserPlus size={22} />,
      color: '#8b5cf6',
      path: '/pelayanan/kependudukan',
      count: counts.kependudukan,
      active: false
    }
  ];

  return (
    <div className="pelayanan-page fadeIn">
      <div className="pelayanan-header slideDown">
        <div className="header-info">
          <div className="badge-premium">
            <Zap size={14} className="icon-bolt" /> 
            Layanan Publik
          </div>
          <h1>Pelayanan Masyarakat</h1>
          <p>Sistem Pelayanan Terpadu & Profesional.</p>
        </div>
      </div>

      <div className="services-container horizontal-scroll">
        {services.map((service, index) => (
          <div 
            key={index} 
            className={`service-card-mini slideUp ${!service.active ? 'disabled-card' : ''}`}
            style={{ '--delay': `${index * 0.1}s` }}
            onClick={() => service.active && service.path && navigate(service.path)}
          >
            <div className="card-top">
              <div className="icon-box-mini" style={{ background: `${service.color}10`, color: service.color }}>
                {service.icon}
              </div>
              <div className={`status-badge-mini ${!service.active ? 'soon' : ''}`}>
                {service.active ? (
                  <><TrendingUp size={10} /> Aktif</>
                ) : (
                  <><Clock size={10} /> SOON</>
                )}
              </div>
            </div>

            <div className="card-middle-mini">
              <span className="service-label-mini">{service.title}</span>
              <div className="stat-row-mini">
                <h2 className="stat-number-mini">{service.active ? service.count : '---'}</h2>
                <div className="mini-chart-decoration" style={{ color: service.color }}>
                  <BarChart3 size={18} />
                </div>
              </div>
            </div>

            <div className="card-footer-mini">
              <div className="progress-bar-mini">
                <div className="progress-fill" style={{ background: service.active ? service.color : '#e2e8f0', width: service.active ? '60%' : '10%' }}></div>
              </div>
              <span className="action-link-mini" style={{ color: service.active ? service.color : '#94a3b8' }}>
                {service.active ? "Buka" : "Segera"} <ArrowRight size={12} />
              </span>
            </div>
            
            {!service.active && <div className="disabled-overlay"></div>}
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pelayanan-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-bottom: 2rem;
        }

        .pelayanan-header {
           padding: 1.5rem 2rem;
           background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
           border-radius: 24px;
           color: white;
           position: relative;
           overflow: hidden;
           box-shadow: 0 15px 30px rgba(79, 70, 229, 0.1);
        }

        .badge-premium {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          padding: 0.3rem 0.8rem;
          border-radius: 100px;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 0.5rem;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .pelayanan-header h1 {
          font-size: 1.8rem;
          font-weight: 900;
          margin-bottom: 0.25rem;
        }

        .pelayanan-header p { font-size: 0.85rem; opacity: 0.9; }

        .services-container {
          display: flex;
          gap: 1rem;
          padding: 0.5rem 0.25rem 1.5rem;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .services-container::-webkit-scrollbar { display: none; }

        .service-card-mini {
          flex: 0 0 240px;
          scroll-snap-align: start;
          background: #ffffff;
          border-radius: 24px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border: 1px solid rgba(0,0,0,0.03);
          box-shadow: 0 8px 20px rgba(0,0,0,0.02);
          position: relative;
        }

        .service-card-mini:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.06);
          border-color: rgba(0,0,0,0.06);
        }

        .disabled-card {
           cursor: not-allowed;
           filter: grayscale(0.4);
           opacity: 0.8;
        }
        
        .disabled-card:hover {
           transform: none;
           box-shadow: 0 8px 20px rgba(0,0,0,0.02);
        }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; }

        .icon-box-mini {
          width: 44px; height: 44px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }

        .status-badge-mini {
          background: #ecfdf5; color: #10b981;
          padding: 0.25rem 0.6rem; border-radius: 100px;
          font-size: 0.65rem; font-weight: 800;
          display: flex; align-items: center; gap: 4px; border: 1px solid #a7f3d0;
        }

        .status-badge-mini.soon {
          background: #fff7ed; color: #f97316; border: 1px solid #fed7aa;
        }

        .card-middle-mini { display: flex; flex-direction: column; gap: 0.25rem; }
        .service-label-mini { font-size: 0.8rem; font-weight: 700; color: #64748b; }
        .stat-row-mini { display: flex; justify-content: space-between; align-items: flex-end; }
        .stat-number-mini { font-size: 1.75rem; font-weight: 800; color: #1e293b; line-height: 1; }
        .mini-chart-decoration { opacity: 0.25; }

        .card-footer-mini {
          margin-top: 0.5rem;
          display: flex; flex-direction: column; gap: 0.75rem;
        }

        .progress-bar-mini {
          height: 4px; background: #f1f5f9; border-radius: 100px; overflow: hidden;
        }

        .progress-fill { height: 100%; border-radius: 100px; }

        .action-link-mini {
          font-size: 0.75rem; font-weight: 800;
          display: flex; align-items: center; gap: 4px; justify-content: flex-end; opacity: 0.8;
        }

        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        @media (max-width: 640px) {
          .service-card-mini { flex: 0 0 200px; }
          .stat-number-mini { font-size: 1.5rem; }
        }
      ` }} />
    </div>
  );
};

export default PelayananMasyarakat;
