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
  BarChart3
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
    // Real-time counts from Firebase
    const nibRef = ref(db, 'pelayanan/nib');
    const halalRef = ref(db, 'pelayanan/halal');
    // Others can be added when data is available
    
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
      description: 'Pendaftaran Nomor Induk Berusaha',
      icon: <Fingerprint size={28} />,
      color: '#3b82f6',
      path: '/pelayanan/nib',
      count: counts.nib
    },
    {
      id: 'halal',
      title: 'Registrasi Halal',
      description: 'Sertifikasi produk UMKM',
      icon: <ShieldCheck size={28} />,
      color: '#10b981',
      path: '/pelayanan/halal',
      count: counts.halal
    },
    {
      id: 'bpjs-apbd',
      title: 'BPJS APBD',
      description: 'Jaminan kesehatan daerah',
      icon: <HeartPulse size={28} />,
      color: '#ef4444',
      path: '/pelayanan/bpjs-apbd',
      count: counts.bpjsApbd
    },
    {
      id: 'bpjs-tk',
      title: 'BPJS Ketenagakerjaan',
      description: 'Perlindungan jaminan sosial',
      icon: <Briefcase size={28} />,
      color: '#f59e0b',
      path: '/pelayanan/bpjs-tk',
      count: counts.bpjsTk
    },
    {
      id: 'kependudukan',
      title: 'Data Kependudukan',
      description: 'Perubahan KK, KTP & Dokumen',
      icon: <UserPlus size={28} />,
      color: '#8b5cf6',
      path: '/pelayanan/kependudukan',
      count: counts.kependudukan
    }
  ];

  return (
    <div className="pelayanan-page fadeIn">
      <div className="pelayanan-header slideDown">
        <div className="header-info">
          <div className="badge-premium">
            <Zap size={14} className="icon-bolt" /> 
            LAYANAN PUBLIK TERPADU
          </div>
          <h1>Pelayanan Masyarakat</h1>
          <p>Pilih jenis layanan yang Anda butuhkan. Kami siap melayani dengan sepenuh hati.</p>
        </div>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="service-card-v2 slideUp" 
            style={{ '--delay': `${index * 0.1}s` }}
            onClick={() => service.path && navigate(service.path)}
          >
            <div className="card-top">
              <div className="icon-box" style={{ background: `${service.color}10`, color: service.color }}>
                {service.icon}
              </div>
              <div className="status-badge">
                <TrendingUp size={12} /> + Aktif
              </div>
            </div>

            <div className="card-middle">
              <span className="service-label">{service.title}</span>
              <div className="stat-row">
                <h2 className="stat-number">{service.count}</h2>
                <div className="mini-chart" style={{ color: service.color }}>
                  <BarChart3 size={24} />
                </div>
              </div>
            </div>

            <div className="card-footer-v2">
              <div className="progress-bar">
                <div className="progress-fill" style={{ background: service.color, width: '65%' }}></div>
              </div>
              <span className="action-link" style={{ color: service.color }}>
                Buka Layanan <ArrowRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pelayanan-page {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          padding-bottom: 2rem;
        }

        .pelayanan-header {
           padding: 2.5rem;
           background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
           border-radius: 32px;
           color: white;
           position: relative;
           overflow: hidden;
           box-shadow: 0 20px 40px rgba(79, 70, 229, 0.15);
        }

        .pelayanan-header::before {
           content: '';
           position: absolute;
           top: -50px;
           right: -50px;
           width: 200px;
           height: 200px;
           background: rgba(255,255,255,0.1);
           border-radius: 50%;
           filter: blur(40px);
        }

        .badge-premium {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          padding: 0.5rem 1.25rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          margin-bottom: 1rem;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .pelayanan-header h1 {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          letter-spacing: -0.03em;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .service-card-v2 {
          background: #ffffff;
          border-radius: 32px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          border: 1px solid rgba(0,0,0,0.03);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          position: relative;
        }

        .service-card-v2:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
          border-color: rgba(0,0,0,0.06);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .icon-box {
          width: 60px;
          height: 60px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }

        .service-card-v2:hover .icon-box {
          transform: scale(1.1) rotate(5deg);
        }

        .status-badge {
          background: #ecfdf5;
          color: #10b981;
          padding: 0.4rem 0.8rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-middle {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .service-label {
          font-size: 1rem;
          font-weight: 700;
          color: #64748b;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          line-height: 1;
        }

        .mini-chart {
          opacity: 0.3;
          padding-bottom: 4px;
        }

        .card-footer-v2 {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .progress-bar {
          height: 6px;
          background: #f1f5f9;
          border-radius: 100px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 100px;
          transition: width 1s ease-out;
        }

        .action-link {
          font-size: 0.85rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: flex-end;
          opacity: 0.8;
          transition: transform 0.2s;
        }

        .service-card-v2:hover .action-link {
          transform: translateX(5px);
          opacity: 1;
        }

        /* Animations */
        .fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .slideUp { animation: slideUp 0.6s ease-out forwards; animation-delay: var(--delay); opacity: 0; }
        .slideDown { animation: slideDown 0.6s ease-out forwards; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes slideDown { 
          from { opacity: 0; transform: translateY(-30px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        @media (max-width: 640px) {
          .pelayanan-header { padding: 1.5rem; }
          .pelayanan-header h1 { font-size: 1.8rem; }
          .stat-number { font-size: 2rem; }
        }
      ` }} />
    </div>
  );
};

export default PelayananMasyarakat;
