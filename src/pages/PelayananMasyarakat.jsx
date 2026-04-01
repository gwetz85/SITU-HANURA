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
      icon: <Fingerprint size={24} />,
      color: '#3b82f6',
      path: '/pelayanan/nib',
      count: counts.nib,
      active: true,
      tag: 'FAVORIT'
    },
    {
      id: 'halal',
      title: 'Registrasi Halal',
      icon: <ShieldCheck size={24} />,
      color: '#10b981',
      path: '/pelayanan/halal',
      count: counts.halal,
      active: true,
      tag: 'FAST TRACK'
    },
    {
      id: 'bpjs-apbd',
      title: 'BPJS APBD',
      icon: <HeartPulse size={24} />,
      color: '#ef4444',
      path: '/pelayanan/bpjs-apbd',
      count: counts.bpjsApbd,
      active: false
    },
    {
      id: 'bpjs-tk',
      title: 'BPJS Ketenagakerjaan',
      icon: <Briefcase size={24} />,
      color: '#f59e0b',
      path: '/pelayanan/bpjs-tk',
      count: counts.bpjsTk,
      active: false
    },
    {
      id: 'kependudukan',
      title: 'Data Penduduk',
      icon: <UserPlus size={24} />,
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
    <div className="pelayanan-premium-page fadeIn">
      {/* Dynamic Interactive Header */}
      <div className="header-banner slideDown">
        <div className="header-content">
          <div className="header-badge">
             <Sparkles size={14} className="sparkle-icon" /> 
             SITU HANURA • SOLUSI PELAYANAN CEPAT
          </div>
          <h1>Pelayanan Masyarakat</h1>
          <p>Akses berbagai layanan publik Kelurahan Hanura secara digital, transparan, dan efisien.</p>
          
          <div className="search-bar-container">
             <Search size={18} className="search-icon" />
             <input 
               type="text" 
               placeholder="Cari jenis layanan (contoh: NIB, Halal...)" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>
        <div className="header-decoration">
           <div className="blob blob-1"></div>
           <div className="blob blob-2"></div>
        </div>
      </div>

      {/* Interactive Cards Layout */}
      <div className="cards-viewport-wide">
        <div className="services-row">
          {filteredServices.length > 0 ? filteredServices.map((service, index) => (
            <div 
              key={index} 
              className={`interactive-service-card slideUp ${!service.active ? 'is-coming-soon' : ''}`}
              style={{ '--accent': service.color, '--delay': `${index * 0.1}s` }}
              onClick={() => service.active && service.path && navigate(service.path)}
            >
              {service.tag && <div className="card-tag">{service.tag}</div>}
              
              <div className="card-inner-header">
                <div className="icon-sphere">
                  {service.icon}
                </div>
                <div className={`condition-indicator ${service.active ? 'active' : 'pending'}`}>
                  {service.active ? (
                    <><TrendingUp size={10} /> TERSEDIA</>
                  ) : (
                    <><Clock size={10} /> SOON</>
                  )}
                </div>
              </div>

              <div className="card-main-content">
                <span className="label-text">IDENTITAS LAYANAN</span>
                <h3 className="service-name">{service.title}</h3>
                
                <div className="stat-visualization">
                  <div className="stat-value">
                    {service.active ? service.count : '---'}
                    <span className="stat-unit">PENGAJUAN</span>
                  </div>
                  <BarChart3 size={24} className="viz-icon" />
                </div>
              </div>

              <div className="card-action-footer">
                <div className="load-bar">
                  <div className="load-fill" style={{ width: service.active ? '70%' : '15%' }}></div>
                </div>
                <div className="action-button-group">
                   <span className="action-label">{service.active ? 'Klik untuk Akses' : 'Melalui Offline'}</span>
                   <div className="action-circle">
                      <ArrowRight size={16} />
                   </div>
                </div>
              </div>

              {!service.active && (
                <div className="lock-overlay">
                  <div className="lock-content">COMING SOON</div>
                </div>
              )}
            </div>
          )) : (
            <div className="empty-search-state">
               <Search size={48} />
               <p>Layanan yang Anda cari tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pelayanan-premium-page {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          padding-bottom: 3rem;
        }

        .header-banner {
          position: relative;
          padding: 3.5rem;
          border-radius: 32px;
          background: #2563eb;
          color: white;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(37,99,235,0.2);
          display: flex;
          align-items: center;
        }

        .header-content { position: relative; z-index: 5; max-width: 650px; }
        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          padding: 0.5rem 1.25rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          border: 1px solid rgba(255,255,255,0.2);
          margin-bottom: 1.5rem;
        }
        .sparkle-icon { animation: rotateCloud 4s infinite linear; }

        @keyframes rotateCloud { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .header-content h1 { font-size: 3rem; font-weight: 900; margin-bottom: 0.75rem; letter-spacing: -0.04em; }
        .header-content p { font-size: 1.1rem; opacity: 0.9; line-height: 1.6; margin-bottom: 2rem; }

        .search-bar-container {
          position: relative;
          width: 100%;
          max-width: 450px;
          display: flex;
          align-items: center;
        }
        .search-icon { position: absolute; left: 1rem; color: #94a3b8; }
        .search-bar-container input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border-radius: 16px;
          border: none;
          background: white;
          color: #1e293b;
          font-weight: 600;
          font-size: 0.95rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          outline: none;
          transition: transform 0.3s;
        }
        .search-bar-container input:focus { transform: scale(1.02); }

        .header-decoration {
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          overflow: hidden;
          z-index: 1;
        }
        .blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.6; }
        .blob-1 { top: -10%; right: -5%; width: 300px; height: 300px; background: #60a5fa; animation: float 10s infinite ease-in-out; }
        .blob-2 { bottom: -20%; right: 15%; width: 250px; height: 250px; background: #3b82f6; animation: float 15s infinite ease-in-out reverse; }

        @keyframes float { 0% { transform: translate(0,0); } 50% { transform: translate(-30px, 40px); } 100% { transform: translate(0,0); } }

        .cards-viewport-wide {
           overflow: visible;
           padding: 0.5rem 0.25rem 2rem;
        }

        .services-row {
          display: flex;
          gap: 1.5rem;
          overflow-x: auto;
          padding-bottom: 1.5rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
        }
        .services-row::-webkit-scrollbar { display: none; }

        .interactive-service-card {
          flex: 0 0 300px;
          scroll-snap-align: start;
          background: white;
          border-radius: 36px;
          padding: 2rem;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0,0,0,0.03);
          box-shadow: 0 15px 35px rgba(0,0,0,0.03);
          cursor: pointer;
          overflow: hidden;
        }

        .interactive-service-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 30px 60px rgba(0,0,0,0.1);
          border-color: var(--accent);
        }

        .card-tag {
          position: absolute;
          top: 1.5rem; right: 2rem;
          font-size: 0.55rem;
          font-weight: 900;
          color: white;
          background: var(--accent);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        .card-inner-header { display: flex; justify-content: space-between; align-items: center; }
        .icon-sphere {
           width: 58px; height: 58px;
           background: rgba(0,0,0,0.03);
           border-radius: 20px;
           display: flex; align-items: center; justify-content: center;
           color: var(--accent);
           transition: all 0.3s;
        }
        .interactive-service-card:hover .icon-sphere {
           background: var(--accent);
           color: white;
           transform: rotate(10deg);
        }

        .condition-indicator {
          font-size: 0.65rem;
          font-weight: 900;
          display: flex; align-items: center; gap: 5px;
          padding: 0.4rem 0.75rem;
          border-radius: 100px;
        }
        .condition-indicator.active { background: #ecfdf5; color: #10b981; }
        .condition-indicator.pending { background: #fff7ed; color: #f97316; }

        .card-main-content { display: flex; flex-direction: column; gap: 0.5rem; }
        .label-text { font-size: 0.6rem; font-weight: 800; color: #94a3b8; letter-spacing: 1px; }
        .service-name { font-size: 1.35rem; font-weight: 900; color: #1e293b; line-height: 1.2; }

        .stat-visualization {
          margin-top: 1rem;
          display: flex; justify-content: space-between; align-items: flex-end;
        }
        .stat-value { font-size: 2.5rem; font-weight: 950; color: #0f172a; display: flex; align-items: baseline; gap: 6px; }
        .stat-unit { font-size: 0.65rem; font-weight: 800; color: #94a3b8; }
        .viz-icon { color: var(--accent); opacity: 0.2; }

        .card-action-footer { display: flex; flex-direction: column; gap: 1.5rem; }
        .load-bar { height: 6px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
        .load-fill { height: 100%; background: var(--accent); border-radius: 10px; transition: width 1s; }

        .action-button-group { display: flex; justify-content: space-between; align-items: center; }
        .action-label { font-size: 0.8rem; font-weight: 800; color: #64748b; }
        .action-circle {
           width: 36px; height: 36px;
           background: #f8fafc;
           border-radius: 50%;
           display: flex; align-items: center; justify-content: center;
           color: var(--accent);
           border: 1px solid #f1f5f9;
           transition: all 0.3s;
        }
        .interactive-service-card:hover .action-circle { background: var(--accent); color: white; transform: translateX(5px); }

        .is-coming-soon { filter: grayscale(1); opacity: 0.7; cursor: not-allowed; }
        .is-coming-soon:hover { transform: none; box-shadow: 0 15px 35px rgba(0,0,0,0.03); }

        .lock-overlay {
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.4);
          backdrop-filter: blur(2px);
          display: flex; align-items: center; justify-content: center;
          z-index: 10;
        }
        .lock-content {
           background: rgba(0,0,0,0.8);
           color: white;
           padding: 0.5rem 1.25rem;
           border-radius: 100px;
           font-size: 0.7rem; font-weight: 900; letter-spacing: 1px;
        }

        .empty-search-state {
           width: 100%; padding: 4rem; text-align: center; color: #94a3b8;
           display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }

        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1024px) {
           .header-banner { padding: 2.5rem; border-radius: 24px; }
           .header-content h1 { font-size: 2.2rem; }
           .interactive-service-card { flex: 0 0 280px; }
        }
        @media (max-width: 768px) {
           .header-banner { padding: 1.5rem; flex-direction: column; text-align: center; }
           .header-content { max-width: none; }
           .search-bar-container { max-width: none; margin: 0 auto; }
           .interactive-service-card { flex: 0 0 calc(100vw - 4rem); }
        }
      ` }} />
    </div>
  );
};

export default PelayananMasyarakat;
