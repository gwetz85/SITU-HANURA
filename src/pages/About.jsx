import React from 'react';
import { Info, Github, Globe, ShieldCheck, Heart } from 'lucide-react';

const About = () => {
  const version = "1.0.0-stable";
  const buildDate = "31 Maret 2026";

  return (
    <div className="about-page fadeIn">
      <div className="about-card glass-card">
        <div className="about-header">
          <div className="about-logo">S</div>
          <div className="about-title">
            <h1>SITU HANURA</h1>
            <p>Sistem Informasi Terpadu DPC HANURA Kota Tanjungpinang</p>
          </div>
        </div>

        <div className="about-body">
          <div className="about-section">
            <h3>Tentang Aplikasi</h3>
            <p>
              SITU HANURA adalah platform manajemen terpadu yang dirancang khusus untuk meningkatkan efisiensi 
              administrasi kantor di lingkungan DPC HANURA Kota Tanjungpinang. Aplikasi ini mencakup 
              modul korespondensi, pengelolaan kas, data karyawan, hingga pengarsipan digital dalam satu sistem yang aman.
            </p>
          </div>

          <div className="features-highlight">
            <div className="feature-chip"><ShieldCheck size={14} /> 1 User 1 Perangkat</div>
            <div className="feature-chip"><Info size={14} /> Role-Based Access</div>
            <div className="feature-chip"><Globe size={14} /> Mobile Responsive</div>
          </div>

          <div className="about-section">
            <h3>Tim Pengembang</h3>
            <div className="dev-info">
              <div className="dev-avatar">AI</div>
              <div className="dev-text">
                <p className="dev-name">Antigravity Coding Assistant</p>
                <p className="dev-role">Powered by Google Deepmind Technology</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-footer">
          <div className="version-info">
            <span>Versi: <strong>{version}</strong></span>
            <span className="dot"></span>
            <span>Terakhir Update: <strong>{buildDate}</strong></span>
          </div>
          <div className="social-links">
            <button className="icon-btn-ghost"><Github size={18} /></button>
            <button className="icon-btn-ghost"><Globe size={18} /></button>
            <button className="icon-btn-ghost"><Heart size={18} color="#ef4444" /></button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .about-page { display: flex; justify-content: center; align-items: flex-start; min-height: 80vh; padding-top: 2rem; }
        .about-card { max-width: 650px; width: 100%; border: 1px solid var(--border); overflow: hidden; }
        
        .about-header { 
          padding: 3rem 2.5rem; background: linear-gradient(135deg, var(--primary) 0%, #1e40af 100%);
          display: flex; align-items: center; gap: 1.5rem; color: white;
        }
        
        .about-logo { 
          width: 70px; height: 70px; background: rgba(255,255,255,0.2); 
          backdrop-filter: blur(10px); border-radius: 20px; font-size: 2.5rem; font-weight: 900;
          display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3);
        }

        .about-title h1 { font-size: 2rem; font-weight: 800; letter-spacing: -1px; }
        .about-title p { font-size: 0.9rem; opacity: 0.8; font-weight: 500; }

        .about-body { padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem; }
        .about-section h3 { font-size: 1rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .about-section p { font-size: 1rem; color: var(--text-muted); line-height: 1.6; }

        .features-highlight { display: flex; flex-wrap: wrap; gap: 0.75rem; }
        .feature-chip { 
          display: flex; align-items: center; gap: 6px; padding: 0.4rem 0.8rem; 
          background: var(--background); border-radius: 100px; font-size: 0.75rem; 
          font-weight: 700; color: var(--primary); border: 1px solid var(--border);
        }

        .dev-info { display: flex; align-items: center; gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid var(--border); }
        .dev-avatar { width: 40px; height: 40px; background: var(--text-main); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
        .dev-name { font-weight: 700; font-size: 0.9rem; color: var(--text-main); }
        .dev-role { font-size: 0.75rem; color: var(--text-muted); }

        .about-footer { 
          padding: 1.5rem 2.5rem; background: #f8fafc; border-top: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
        }
        .version-info { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; color: var(--text-muted); }
        .dot { width: 4px; height: 4px; background: #cbd5e1; border-radius: 50%; }
        .social-links { display: flex; gap: 0.5rem; }

        @media (max-width: 600px) {
          .about-header { flex-direction: column; text-align: center; padding: 2rem; }
          .about-logo { margin: 0 auto; }
          .about-footer { flex-direction: column; gap: 1rem; text-align: center; }
        }
      ` }} />
    </div>
  );
};

export default About;
