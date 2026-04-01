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
  Sparkles
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
      icon: <Fingerprint size={20} />,
      color: '#3b82f6',
      path: '/pelayanan/nib',
      count: counts.nib,
      active: true,
      tag: 'POPULER'
    },
    {
      id: 'halal',
      title: 'Registrasi Halal',
      icon: <ShieldCheck size={20} />,
      color: '#10b981',
      path: '/pelayanan/halal',
      count: counts.halal,
      active: true,
      tag: 'FAST'
    },
    {
      id: 'bpjs-apbd',
      title: 'BPJS APBD',
      icon: <HeartPulse size={20} />,
      color: '#ef4444',
      path: '/pelayanan/bpjs-apbd',
      count: counts.bpjsApbd,
      active: false
    },
    {
      id: 'bpjs-tk',
      title: 'BPJS Ketenagakerjaan',
      icon: <Briefcase size={20} />,
      color: '#f59e0b',
      path: '/pelayanan/bpjs-tk',
      count: counts.bpjsTk,
      active: false
    },
    {
      id: 'kependudukan',
      title: 'Data Penduduk',
      icon: <UserPlus size={20} />,
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
    <div className="pelayanan-compact-page fadeIn">
      {/* Refined More Compact Header */}
      <div className="header-strip slideDown">
        <div className="header-info-compact">
          <div className="header-top-line">
             <div className="badge-mini">
                <Sparkles size={12} /> SITU HANURA
             </div>
             <h1>Pelayanan Masyarakat</h1>
          </div>
          <p>Pusat kendali pelayanan terpadu digital Kelurahan Hanura.</p>
        </div>
        
        <div className="search-compact">
           <Search size={16} className="s-icon" />
           <input 
             type="text" 
             placeholder="Cari layanan..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* Grid of Compact Gallery Cards */}
      <div className="gallery-viewport">
        <div className="horizontal-gallery">
          {filteredServices.length > 0 ? filteredServices.map((service, index) => (
            <div 
              key={index} 
              className={`compact-gallery-card slideUp ${!service.active ? 'is-soon' : ''}`}
              style={{ '--accent': service.color, '--delay': `${index * 0.1}s` }}
              onClick={() => service.active && service.path && navigate(service.path)}
            >
              <div className="card-top-row">
                <div className="mini-icon-cap" style={{ background: `${service.color}15`, color: service.color }}>
                  {service.icon}
                </div>
                <div className={`status-dot-badge ${service.active ? 'active' : 'inactive'}`}>
                  {service.active ? 'AKTIF' : 'SOON'}
                </div>
              </div>

              <div className="card-body-compact">
                <span className="card-lbl">KATEGORI LAYANAN</span>
                <h4 className="service-title-text">{service.title}</h4>
                
                <div className="stat-snapshot">
                  <span className="snap-val">{service.active ? service.count : '--'}</span>
                  <span className="snap-lbl">Data Masuk</span>
                  <div className="visual-bar" style={{ background: service.active ? service.color : '#e2e8f0', width: service.active ? '40%' : '10%' }}></div>
                </div>
              </div>

              <div className="card-btn-mini" style={{ color: service.active ? service.color : '#94a3b8' }}>
                {service.active ? 'Buka Menu' : 'Segera Hadir'} <ArrowRight size={14} />
              </div>

              {service.tag && <div className="floating-tag">{service.tag}</div>}
              {!service.active && <div className="blocked-overlay"><span>DISABLED</span></div>}
            </div>
          )) : (
            <div className="no-result">Tidak ada layanan yang sesuai.</div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pelayanan-compact-page {
          display: flex; flex-direction: column; gap: 1.5rem;
        }

        .header-strip {
          padding: 1.5rem 2rem;
          background: #2563eb;
          border-radius: 20px;
          color: white;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 10px 30px rgba(37,99,235,0.1);
          position: relative; overflow: hidden;
        }
        
        .header-info-compact { position: relative; z-index: 2; }
        .header-top-line { display: flex; align-items: center; gap: 1rem; }
        
        .badge-mini {
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2);
          padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.6rem; font-weight: 800;
          display: flex; align-items: center; gap: 6px;
        }

        .header-info-compact h1 { font-size: 1.5rem; font-weight: 900; margin: 0; }
        .header-info-compact p { font-size: 0.8rem; opacity: 0.8; margin-top: 4px; }

        .search-compact {
          position: relative; z-index: 2;
          width: 260px; display: flex; align-items: center;
        }
        .s-icon { position: absolute; left: 12px; color: #94a3b8; }
        .search-compact input {
          width: 100%; padding: 0.6rem 1rem 0.6rem 2.5rem;
          border-radius: 12px; border: none; background: white;
          font-size: 0.85rem; font-weight: 600; outline: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .gallery-viewport { padding: 0.5rem 0.25rem 1rem; }
        .horizontal-gallery {
          display: flex; gap: 1.25rem; overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
          padding-bottom: 0.5rem;
        }
        .horizontal-gallery::-webkit-scrollbar { display: none; }

        .compact-gallery-card {
          flex: 0 0 230px;
          background: white; border-radius: 20px;
          padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;
          border: 1px solid rgba(0,0,0,0.03);
          box-shadow: 0 8px 24px rgba(0,0,0,0.02);
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative; overflow: hidden;
        }

        .compact-gallery-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.06);
          border-color: var(--accent);
        }

        .card-top-row { display: flex; justify-content: space-between; align-items: center; }
        .mini-icon-cap {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }

        .status-dot-badge {
          font-size: 0.55rem; font-weight: 900; padding: 0.25rem 0.5rem; border-radius: 100px;
        }
        .status-dot-badge.active { background: #ecfdf5; color: #10b981; }
        .status-dot-badge.inactive { background: #f1f5f9; color: #94a3b8; }

        .card-body-compact { display: flex; flex-direction: column; gap: 0.25rem; }
        .card-lbl { font-size: 0.55rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.5px; }
        .service-title-text { font-size: 1rem; font-weight: 800; color: #1e293b; line-height: 1.2; }

        .stat-snapshot {
          margin-top: 0.75rem; display: flex; flex-direction: column; gap: 4px; position: relative;
        }
        .snap-val { font-size: 1.8rem; font-weight: 950; color: #0f172a; line-height: 1; }
        .snap-lbl { font-size: 0.6rem; font-weight: 700; color: #94a3b8; }
        .visual-bar { height: 4px; border-radius: 10px; margin-top: 4px; }

        .card-btn-mini {
          margin-top: auto; font-size: 0.75rem; font-weight: 800;
          display: flex; align-items: center; gap: 6px; justify-content: flex-end;
          opacity: 0.8; transition: transform 0.2s;
        }
        .compact-gallery-card:hover .card-btn-mini { transform: translateX(4px); opacity: 1; }

        .floating-tag {
          position: absolute; top: 0; right: 20px;
          background: #f1f5f9; color: #475569; font-size: 0.5rem; font-weight: 900;
          padding: 4px 6px; border-radius: 0 0 4px 4px;
        }

        .is-soon { filter: grayscale(0.6); opacity: 0.7; cursor: not-allowed; }
        .blocked-overlay {
           position: absolute; inset: 0; background: rgba(255,255,255,0.3);
           display: flex; align-items: center; justify-content: center;
           z-index: 5; visibility: hidden;
        }
        
        .no-result { width: 100%; padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.9rem; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
           .header-strip { flex-direction: column; align-items: stretch; gap: 1rem; }
           .search-compact { width: 100%; }
        }
      ` }} />
    </div>
  );
};

export default PelayananMasyarakat;
