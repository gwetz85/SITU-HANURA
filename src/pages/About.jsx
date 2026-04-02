import React from 'react';
import { 
  Info, Globe, ShieldCheck, Mail, MessageCircle, Zap, Smartphone, Cpu 
} from 'lucide-react';

const About = () => {
  const version = "4.0.1-stable";
  const buildDate = "03 April 2026";

  return (
    <div className="about-page fadeIn">
      <div className="about-card glass-card">
        <div className="about-header">
          <div className="about-logo animate-pulse-slow">
            <ShieldCheck size={40} />
          </div>
          <div className="about-title">
            <h1>SITU HANURA</h1>
            <p>Sistem Informasi Terpadu DPC HANURA Kota Tanjungpinang</p>
          </div>
        </div>

        <div className="about-body">
          <div className="about-section">
            <h3 className="section-title"><Info size={18} /> Tentang Aplikasi</h3>
            <p className="description-text">
              SITU HANURA adalah platform manajemen terpadu yang dirancang khusus untuk meningkatkan efisiensi 
              administrasi kantor di lingkungan DPC HANURA Kota Tanjungpinang. Aplikasi ini mencakup 
              modul korespondensi, pengelolaan kas, data karyawan, hingga pengarsipan digital dalam satu sistem yang aman.
            </p>
          </div>

          <div className="about-section info-update-section">
            <h3 className="section-title"><Zap size={18} /> INFO UPDATE :</h3>
            <ul className="update-list">
              <li><div className="dot-update"></div> Penambahan Fitur Chat</li>
              <li><div className="dot-update"></div> Penambahan Menu Pelayanan Masyarakat</li>
              <li><div className="dot-update"></div> Penambahan Menu Keanggotaan Hanura</li>
              <li><div className="dot-update"></div> Penambahan Menu Inventaris Kantor</li>
            </ul>
          </div>

          <div className="features-highlight">
            <div className="feature-chip"><Smartphone size={14} /> 1 User 1 Perangkat</div>
            <div className="feature-chip"><ShieldCheck size={14} /> Role-Based Access</div>
            <div className="feature-chip"><Globe size={14} /> Mobile Responsive</div>
          </div>

          <div className="about-section dev-section">
            <h3 className="section-title">Tim Pengembang</h3>
            <div className="developer-card glass-card">
              <div className="dev-main">
                <div className="dev-avatar-container">
                  <div className="dev-avatar">AS</div>
                </div>
                <div className="dev-text">
                  <h4>AGUS SURIYADI</h4>
                  <p className="dev-role">Lead Developer SITU HANURA</p>
                </div>
              </div>
              
              <div className="dev-contact-grid">
                <a href="mailto:agussuriyadipunya@gmail.com" className="contact-item">
                  <Mail size={16} />
                  <span>agussuriyadipunya@gmail.com</span>
                </a>
                <a href="https://wa.me/62817319885" target="_blank" rel="noreferrer" className="contact-item">
                  <MessageCircle size={16} />
                  <span>0817319885</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="about-footer">
          <div className="powered-by">
            <Cpu size={14} />
            <span>Powered by MTNET SOFTWARE GROUP</span>
          </div>
          <div className="version-info">
            <span>Versi: <strong>{version}</strong></span>
            <span className="dot"></span>
            <span>Terakhir Update: <strong>{buildDate}</strong></span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .about-page { display: flex; justify-content: center; align-items: flex-start; min-height: 85vh; padding: 2rem 1rem; }
        .about-card { max-width: 680px; width: 100%; border: 1px solid var(--border); overflow: hidden; border-radius: 24px; }
        
        .about-header { 
          padding: 3.5rem 2.5rem; background: linear-gradient(135deg, var(--primary) 0%, #1e40af 100%);
          display: flex; align-items: center; gap: 1.5rem; color: white; position: relative;
        }
        
        .about-logo { 
          width: 80px; height: 80px; background: rgba(255,255,255,0.15); 
          backdrop-filter: blur(10px); border-radius: 24px;
          display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2);
        }

        .about-title h1 { font-size: 2.2rem; font-weight: 900; letter-spacing: -1px; margin: 0; line-height: 1.1; }
        .about-title p { font-size: 0.95rem; opacity: 0.9; font-weight: 500; margin-top: 8px; line-height: 1.4; }

        .about-body { padding: 2.5rem; display: flex; flex-direction: column; gap: 2.5rem; background: var(--surface); }
        
        .section-title { 
          font-size: 0.9rem; font-weight: 800; color: var(--primary); 
          margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px;
          display: flex; align-items: center; gap: 8px;
        }
        
        .description-text { font-size: 1.05rem; color: var(--text-main); line-height: 1.7; text-align: justify; }

        .features-highlight { display: flex; flex-wrap: wrap; gap: 0.75rem; }
        .feature-chip { 
          display: flex; align-items: center; gap: 8px; padding: 0.6rem 1.2rem; 
          background: var(--background); border-radius: 100px; font-size: 0.8rem; 
          font-weight: 750; color: var(--text-main); border: 1px solid var(--border);
          transition: all 0.3s ease;
        }
        .feature-chip:hover { border-color: var(--primary); transform: translateY(-2px); }

        .update-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .update-list li { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; font-weight: 600; color: var(--text-main); }
        .dot-update { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 10px rgba(37,99,235,0.4); }

        .developer-card { padding: 1.5rem; border: 1px solid var(--border); }
        .dev-main { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem; }
        
        .dev-avatar-container {
          padding: 3px; border: 2px solid var(--primary); border-radius: 18px;
        }
        .dev-avatar { 
          width: 55px; height: 55px; background: var(--primary); color: white; 
          border-radius: 15px; display: flex; align-items: center; justify-content: center; 
          font-weight: 900; font-size: 1.4rem; 
        }
        
        .dev-text h4 { font-weight: 800; font-size: 1.1rem; color: var(--text-main); margin: 0; }
        .dev-role { font-size: 0.85rem; color: var(--text-muted); margin-top: 2px; font-weight: 600; }
        
        .dev-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .contact-item { 
          display: flex; align-items: center; gap: 10px; padding: 0.8rem 1rem;
          background: var(--background); border-radius: 12px; border: 1px solid var(--border);
          text-decoration: none; color: var(--text-main); font-size: 0.85rem; font-weight: 600;
          transition: all 0.2s;
        }
        .contact-item:hover { border-color: var(--primary); color: var(--primary); background: rgba(37,99,235,0.05); }

        .about-footer { 
          padding: 2rem 2.5rem; background: var(--background); border-top: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 1rem; align-items: center; 
        }
        
        .powered-by {
          display: flex; align-items: center; gap: 8px; font-size: 0.85rem;
          font-weight: 800; color: var(--text-muted); opacity: 0.8;
          background: var(--surface); padding: 0.5rem 1.25rem; border-radius: 100px;
          border: 1px solid var(--border);
        }
        
        .version-info { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; color: var(--text-muted); }
        .dot { width: 4px; height: 4px; background: var(--border); border-radius: 50%; }

        @media (max-width: 650px) {
          .about-header { flex-direction: column; text-align: center; padding: 2.5rem 1.5rem; gap: 1rem; }
          .about-logo { margin: 0 auto; }
          .dev-contact-grid { grid-template-columns: 1fr; }
          .about-body { padding: 1.5rem; }
        }
      ` }} />
    </div>
  );
};

export default About;
