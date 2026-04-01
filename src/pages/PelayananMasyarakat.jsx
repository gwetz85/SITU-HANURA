import React from 'react';
import { 
  Fingerprint, 
  Award, 
  HeartPulse, 
  Briefcase, 
  UserPlus, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PelayananMasyarakat = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: 'Registrasi NIB',
      description: 'Pendaftaran Nomor Induk Berusaha untuk pelaku usaha mikro dan kecil.',
      icon: <Fingerprint size={32} />,
      color: '#3b82f6',
      path: '/pelayanan/nib'
    },
    {
      title: 'Registrasi Halal',
      description: 'Fasilitasi sertifikasi halal bagi produk UMKM untuk meningkatkan daya saing.',
      icon: <ShieldCheck size={32} />,
      color: '#10b981',
      path: '/pelayanan/halal'
    },
    {
      title: 'Registrasi BPJS APBD',
      description: 'Pendaftaran jaminan kesehatan yang dibiayai oleh Anggaran Pemerintah Daerah.',
      icon: <HeartPulse size={32} />,
      color: '#ef4444',
      path: '/pelayanan/bpjs-apbd'
    },
    {
      title: 'Registrasi BPJS Ketenagakerjaan',
      description: 'Perlindungan jaminan sosial bagi pekerja sektor formal maupun informal.',
      icon: <Briefcase size={32} />,
      color: '#f59e0b',
      path: '/pelayanan/bpjs-tk'
    },
    {
      title: 'Perubahan Data Kependudukan',
      description: 'Pengurusan perubahan data pada KK, KTP, atau dokumen kependudukan lainnya.',
      icon: <UserPlus size={32} />,
      color: '#8b5cf6',
      path: '/pelayanan/kependudukan'
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
          <p>Pilih jenis layanan yang Anda butuhkan. Kami siap melayani dengan sepenuh hati dan profesionalisme tinggi.</p>
        </div>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="service-card glass-card-premium slideUp" 
            style={{ '--delay': `${index * 0.1}s` }}
            onClick={() => service.path && navigate(service.path)}
          >
            <div className="card-decoration" style={{ background: service.color }}></div>
            <div className="card-icon-wrapper" style={{ background: `${service.color}15`, color: service.color }}>
              {service.icon}
            </div>
            <div className="card-body">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
            <div className="card-footer">
              <span className="btn-action">
                Buka Layanan <ArrowRight size={16} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pelayanan-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 2rem;
        }

        .pelayanan-header {
           padding: 2.5rem 2rem;
           background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
           border-radius: 24px;
           color: white;
           position: relative;
           overflow: hidden;
           box-shadow: 0 10px 30px rgba(37, 99, 235, 0.15);
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

        .header-info { position: relative; z-index: 1; max-width: 600px; }
        
        .badge-premium {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          margin-bottom: 1rem;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .icon-bolt { animation: pulse 2s infinite; }

        .pelayanan-header h1 {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 0.5rem;
          letter-spacing: -0.03em;
        }

        .pelayanan-header p {
          font-size: 1rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .service-card {
           position: relative;
           display: flex;
           flex-direction: column;
           gap: 1.5rem;
           padding: 2rem !important;
           cursor: pointer;
           overflow: hidden;
           border: 1px solid rgba(37, 99, 235, 0.1) !important;
        }

        .service-card:hover {
           border-color: var(--primary) !important;
        }

        .card-decoration {
           position: absolute;
           top: 0;
           left: 0;
           width: 4px;
           height: 100%;
           opacity: 0.8;
        }

        .card-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }

        .service-card:hover .card-icon-wrapper {
           transform: scale(1.1) rotate(5deg);
        }

        .card-body h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.75rem;
        }

        .card-body p {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .btn-action {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 6px;
          transition: gap 0.2s;
        }

        .service-card:hover .btn-action {
           gap: 10px;
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
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 768px) {
          .pelayanan-header { padding: 1.5rem; }
          .pelayanan-header h1 { font-size: 1.8rem; }
          .services-grid { grid-template-columns: 1fr; }
        }
      ` }} />
    </div>
  );
};

export default PelayananMasyarakat;
