import React, { useState, useEffect, useMemo } from 'react';
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
  Clock,
  Search,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

const PelayananMasyarakat = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
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
      active: true,
      tag: 'POPULER'
    },
    {
      id: 'halal',
      title: 'Registrasi Halal',
      icon: <ShieldCheck size={22} />,
      color: '#10b981',
      path: '/pelayanan/halal',
      count: counts.halal,
      active: true,
      tag: 'FAST'
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
      title: 'BPJS Ketenagakerjaan',
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

  const filteredServices = useMemo(() => {
    return services.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, services]);

  return (
    <div className="pelayanan-redesign fadeIn">
      {/* Header Banner - Compact & Premium */}
      <div className="pelayanan-hero-mini">
        <div className="hero-info">
          <div className="hero-badge">
             <Zap size={14} className="bolt-icon" /> SITU HANURA • LAYANAN
          </div>
          <h1>Pelayanan Masyarakat</h1>
          <p>Pilih kategori layanan publik yang Anda butuhkan di bawah ini.</p>
        </div>
        
        <div className="search-glass">
           <Search size={18} className="search-icon" />
           <input 
             type="text" 
             placeholder="Cari layanan..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="submenu-title-section">
         <div className="title-box">
            <LayoutGrid size={20} className="text-primary" />
            <div className="title-text">
               <h3>Menu Layanan</h3>
               <span>Pilih salah satu layanan tersedia</span>
            </div>
         </div>
      </div>

      {/* Grid Layout - Same Size as Dashboard Cards */}
      <div className="services-grid-premium">
        {filteredServices.length > 0 ? filteredServices.map((service, index) => (
          <div 
            key={index} 
            className={`premium-service-card slideUp ${!service.active ? 'is-disabled' : ''}`}
            style={{ '--accent': service.color, '--delay': `${index * 0.1}s` }}
            onClick={() => service.active && service.path && navigate(service.path)}
          >
            <div className="card-header-top">
              <div className="icon-badge" style={{ background: `${service.color}15`, color: service.color }}>
                {service.icon}
              </div>
              <div className={`status-pill ${service.active ? 'active' : 'inactive'}`}>
                {service.active ? 'TERSEDIA' : 'SOON'}
              </div>
            </div>

            <div className="card-main-info">
              <span className="info-label">IDENTITAS LAYANAN</span>
              <h4 className="service-name-text">{service.title}</h4>
              
              <div className="stat-row">
                <div className="val-group">
                   <h2 className="val-big">{service.active ? service.count : '---'}</h2>
                   <span className="val-unit">PENGAJUAN</span>
                </div>
                <div className="viz-mini" style={{ color: service.color }}>
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>

            <div className="card-footer-action">
              <div className="bar-outer">
                 <div className="bar-inner" style={{ background: service.active ? service.color : '#e2e8f0', width: service.active ? '65%' : '15%' }}></div>
              </div>
              <div className="btn-action-label" style={{ color: service.active ? service.color : '#94a3b8' }}>
                {service.active ? 'Buka Layanan' : 'Segera Hadir'} <ArrowRight size={14} />
              </div>
            </div>

            {service.tag && <div className="card-floating-tag">{service.tag}</div>}
            {!service.active && <div className="blocked-overlay"><span>DISABLED</span></div>}
          </div>
        )) : (
          <div className="no-data-msg">Layanan tidak ditemukan.</div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pelayanan-redesign { display: flex; flex-direction: column; gap: 1.5rem; }

        .pelayanan-hero-mini {
          padding: 1.75rem 2.5rem;
          background: linear-gradient(135deg, var(--primary) 0%, #4c66ff 100%);
          border-radius: 20px; color: white; display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.1); border: 1px solid rgba(255,255,255,0.1);
          position: relative; overflow: hidden;
        }
        
        .hero-badge {
          background: rgba(255,255,255,0.2); backdrop-filter: blur(8px);
          padding: 0.35rem 1rem; border-radius: 100px; font-size: 0.65rem; font-weight: 800;
          display: flex; align-items: center; gap: 8px; width: fit-content; margin-bottom: 0.75rem;
        }

        .hero-info h1 { font-size: 2rem; font-weight: 950; margin: 0.25rem 0; letter-spacing: -0.04em; }
        .hero-info p { font-size: 0.9rem; opacity: 0.9; font-weight: 500; }

        .search-glass {
          background: rgba(255,255,255,0.15); backdrop-filter: blur(12px);
          padding: 0.5rem 1.25rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; gap: 12px; width: 320px;
        }
        .search-icon { color: white; opacity: 0.8; }
        .search-glass input {
          width: 100%; border: none; background: none; color: white; outline: none; font-size: 0.9rem; font-weight: 600;
        }
        .search-glass input::placeholder { color: white; opacity: 0.6; }

        .submenu-title-section { margin-top: 0.5rem; }
        .title-box { display: flex; align-items: center; gap: 1rem; }
        .title-text h3 { font-size: 1.25rem; font-weight: 900; color: #1e293b; margin: 0; }
        .title-text span { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

        .services-grid-premium {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;
        }

        .premium-service-card {
          background: white; border-radius: 28px; padding: 1.75rem; display: flex; flex-direction: column; gap: 1.5rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(0,0,0,0.03);
          box-shadow: 0 10px 25px rgba(0,0,0,0.02); position: relative; overflow: hidden;
        }
        
        .premium-service-card:hover {
          transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 20px 45px rgba(0,0,0,0.08);
        }

        .card-header-top { display: flex; justify-content: space-between; align-items: center; }
        .icon-badge { width: 50px; height: 50px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .status-pill { font-size: 0.6rem; font-weight: 900; padding: 4px 10px; border-radius: 100px; }
        .status-pill.active { background: #ecfdf5; color: #10b981; }
        .status-pill.inactive { background: #f8fafc; color: #94a3b8; }

        .card-main-info { display: flex; flex-direction: column; gap: 0.5rem; }
        .info-label { font-size: 0.65rem; font-weight: 800; color: #94a3b8; letter-spacing: 1px; }
        .service-name-text { font-size: 1.25rem; font-weight: 900; color: #1e293b; line-height: 1.2; }
        
        .stat-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 0.5rem; }
        .val-group { display: flex; align-items: baseline; gap: 6px; }
        .val-big { font-size: 2.5rem; font-weight: 950; color: #0f172a; line-height: 1; }
        .val-unit { font-size: 0.65rem; font-weight: 800; color: #94a3b8; }
        .viz-mini { opacity: 0.3; }

        .card-footer-action { display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem; }
        .bar-outer { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .bar-inner { height: 100%; border-radius: 10px; transition: width 1s; }
        .btn-action-label { font-size: 0.85rem; font-weight: 800; display: flex; align-items: center; gap: 6px; justify-content: flex-end; }
        
        .card-floating-tag {
          position: absolute; top: 0; right: 2rem; background: #f8fafc; color: #64748b;
          font-size: 0.55rem; font-weight: 900; padding: 5px 8px; border-radius: 0 0 8px 8px;
        }

        .is-disabled { filter: grayscale(1); opacity: 0.7; cursor: not-allowed; }
        .blocked-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; z-index: 5; visibility: hidden; }

        @media (max-width: 1024px) {
           .pelayanan-hero-mini { flex-direction: column; align-items: stretch; gap: 1.5rem; padding: 1.5rem; }
           .search-glass { width: 100%; }
        }
      ` }} />
    </div>
  );
};

export default PelayananMasyarakat;
