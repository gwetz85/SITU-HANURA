import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Mail, 
  ChevronDown, 
  Wallet, 
  Users, 
  Library, 
  UserCog, 
  Settings, 
  Info, 
  LogOut, 
  Menu, 
  X,
  Bell,
  User as UserIcon,
  Circle,
  Shield,
  ChevronRight,
  Clock
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import Modal from './Modal';

const Layout = ({ children }) => {
  const { user, logout, language } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isSuratOpen, setIsSuratOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const t = {
    id: {
      dashboard: 'Dashboard',
      surat: 'Surat Menyurat',
      suratMasuk: 'Surat Masuk',
      suratKeluar: 'Surat Keluar',
      kas: 'Kas Office',
      karyawan: 'Karyawan',
      pustaka: 'Pustaka Hanura',
      user: 'Manajemen User',
      settings: 'Pengaturan',
      about: 'Tentang Aplikasi',
      logout: 'Keluar',
      profile: 'Profil Saya',
      security: 'Keamanan',
      device: 'Perangkat',
      online: 'AKTIF',
      offline: 'OFFLINE'
    },
    en: {
      dashboard: 'Dashboard',
      surat: 'Correspondence',
      suratMasuk: 'Incoming Mail',
      suratKeluar: 'Outgoing Mail',
      kas: 'Cash Office',
      karyawan: 'Employees',
      pustaka: 'Library',
      user: 'User Management',
      settings: 'Settings',
      about: 'About App',
      logout: 'Logout',
      profile: 'My Profile',
      security: 'Security',
      device: 'Device',
      online: 'ONLINE',
      offline: 'OFFLINE'
    }
  }[language || 'id'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-dropdown-container')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { title: t.dashboard, icon: <LayoutDashboard size={20} />, path: '/' },
    { 
      title: t.surat, 
      icon: <Mail size={20} />, 
      path: '/surat',
      submenu: [
        { title: t.suratMasuk, path: '/surat/masuk' },
        { title: t.suratKeluar, path: '/surat/keluar' }
      ]
    },
    { title: t.kas, icon: <Wallet size={20} />, path: '/kas' },
    { title: t.karyawan, icon: <Users size={20} />, path: '/karyawan' },
    { title: t.pustaka, icon: <Library size={20} />, path: '/pustaka' },
    { title: t.user, icon: <UserCog size={20} />, path: '/users', role: 'Admin' },
    { title: t.settings, icon: <Settings size={20} />, path: '/settings' },
    { title: t.about, icon: <Info size={20} />, path: '/about' },
  ].filter(item => !item.role || item.role === user?.role);

  return (
    <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && window.innerWidth <= 1024 && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar glass ${isSidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo">S</div>
            <div className="brand-info">
              <span className="brand-name">SITU HANURA</span>
              <span className="brand-tag">KOTA TANJUNGPINANG</span>
            </div>
          </div>
          <button className="mobile-only close-btn" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item, idx) => {
              if (item.submenu) {
                return (
                  <li key={idx} className="menu-item-group">
                    <button 
                      className={`menu-link ${isSuratOpen ? 'active' : ''}`}
                      onClick={() => setIsSuratOpen(!isSuratOpen)}
                    >
                      <span className="link-content">
                        {item.icon}
                        <span className="link-text">{item.title}</span>
                      </span>
                      <ChevronDown size={16} className={`chevron ${isSuratOpen ? 'rotate' : ''}`} />
                    </button>
                    <ul className={`submenu ${isSuratOpen ? 'open' : ''}`}>
                      {item.submenu.map((sub, sidx) => (
                        <li key={sidx}>
                          <NavLink to={sub.path} className="submenu-link">
                            <Circle size={8} />
                            <span>{sub.title}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }

              return (
                <li key={idx}>
                  <NavLink to={item.path} className={({isActive}) => `menu-link ${isActive ? 'active' : ''}`}>
                    <span className="link-content">
                      {item.icon}
                      <span className="link-text">{item.title}</span>
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="clock-container">
            <Clock size={18} className="clock-icon" />
            <div className="time-display">
              <p className="time-now">
                {currentTime.toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', { 
                  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
                })}
              </p>
              <p className="date-now">
                {currentTime.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { 
                   weekday: 'short', day: 'numeric', month: 'short'
                })}
              </p>
            </div>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-container">
        <header className="top-navbar glass sticky-nav">
          <div className="header-left">
            <button className="toggle-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h2 className="page-title">SISTEM INFORMASI TERPADU</h2>
          </div>
          <div className="header-right">
            <div className="user-dropdown-container">
              <div 
                className={`header-user-badge ${isUserMenuOpen ? 'active' : ''}`}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {user?.username?.charAt(0) || 'U'}
              </div>

              {isUserMenuOpen && (
                <div className="user-dropdown glass-premium fadeIn">
                  <div className="dropdown-header">
                    <div className="dropdown-user-avatar">{user?.username?.charAt(0) || 'U'}</div>
                    <div className="dropdown-user-info">
                      <span className="user-name">{user?.name || user?.username}</span>
                      <span className="user-role">{user?.role || 'User'}</span>
                      <div className="status-container">
                        <div className="status-dot"></div>
                        <span className="status-text">{t.online}</span>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={() => { setIsProfileModalOpen(true); setIsUserMenuOpen(false); }}>
                      <div className="item-icon"><UserIcon size={18} /></div>
                      <span>{t.profile}</span>
                      <ChevronRight size={14} className="ms-auto opacity-50" />
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item text-danger" onClick={() => { logout(); navigate('/login'); }}>
                      <div className="item-icon"><LogOut size={18} /></div>
                      <span>Keluar Aplikasi</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-viewport">
          {children}
        </div>
      </main>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Profil Pengguna SITU HANURA"
        icon={<UserIcon size={24} />}
        footer={<button className="btn btn-primary" onClick={() => setIsProfileModalOpen(false)}>Tutup Profil</button>}
      >
        <div className="premium-modal-section">
          <h4 className="premium-section-title"><UserIcon size={18} /> Informasi Identitas</h4>
          <div className="premium-info-grid">
            <div className="premium-info-item">
              <span className="premium-info-label">Nama Lengkap</span>
              <span className="premium-info-value" style={{ color: 'var(--primary)', fontWeight: 800 }}>{user?.name}</span>
            </div>
            <div className="premium-info-item">
              <span className="premium-info-label">Username</span>
              <span className="premium-info-value"><span className="badge-outline">@{user?.username}</span></span>
            </div>
            <div className="premium-info-item">
              <span className="premium-info-label">Level Akses</span>
              <span className={`role-badge ${user?.role?.toLowerCase() || 'pending'}`}>{user?.role || 'BELUM AKTIF'}</span>
            </div>
          </div>
        </div>
        <div className="premium-modal-section">
          <h4 className="premium-section-title"><Shield size={18} /> Keamanan Perangkat</h4>
          <div className="premium-info-item full" style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '12px' }}>
            <span className="premium-info-label">ID Device Anda (Terdaftar)</span>
            <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
              {user?.activeDevId || 'Tidak Ada Device Terdaftar'}
            </p>
          </div>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .app-layout {
          display: flex;
          min-height: 100vh;
          background: var(--background);
        }

        /* Sidebar Styles */
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1000;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          background: var(--surface); /* Theme Aware Sidebar */
          box-shadow: 4px 0 24px rgba(0,0,0,0.05);
        }

        .sidebar-closed .sidebar {
          transform: translateX(-100%);
        }

        .sidebar-header {
          padding: 1.25rem 1.15rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-logo {
          width: 40px;
          height: 40px;
          background: var(--primary);
          color: white;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1.4rem;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }

        .brand-info {
          display: flex;
          flex-direction: column;
        }

        .brand-name { font-weight: 800; font-size: 1.1rem; color: var(--text-main); }

        .brand-tag {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .sidebar-nav { padding: 1rem 0.65rem; }

        .menu-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.7rem 1rem;
          border-radius: 10px;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }

        .menu-link:hover {
          background: var(--background);
          color: var(--primary);
          transform: translateX(4px);
        }

        .menu-link.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.3);
        }

        .link-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .link-text {
          font-size: 0.9rem;
        }

        .chevron {
          transition: transform 0.3s;
        }

        .chevron.rotate {
          transform: rotate(180deg);
        }

        .submenu {
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s ease-out;
          padding-left: 2rem;
        }

        .submenu.open {
          max-height: 200px;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }

        .submenu-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.5rem 0.85rem;
          font-weight: 600;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .submenu-link:hover, .submenu-link.active {
          color: var(--primary);
          background: var(--background);
        }

        .sidebar-footer { 
          padding: 1rem 1.15rem; 
          border-top: 1px solid var(--border); 
          background: var(--surface); 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
        }

        .clock-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-main);
        }

        .clock-icon {
          color: var(--primary);
          animation: pulse-soft 2s infinite;
        }

        @keyframes pulse-soft {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }

        .time-display {
          display: flex;
          flex-direction: column;
        }

        .time-now { 
          font-size: 1rem; 
          font-weight: 800; 
          font-family: 'JetBrains Mono', monospace;
          line-height: 1;
        }

        .date-now {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        /* Main Content */
        .main-container {
          flex: 1;
          margin-left: var(--sidebar-width);
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
        }

        .sidebar-closed .main-container {
          margin-left: 0;
        }

        /* Navbar Brightness */
        .top-navbar {
          height: var(--navbar-height);
          padding: 0 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          position: sticky;
          top: 0;
          z-index: 900;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .page-title { font-weight: 800; color: var(--text-main); font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase; }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .icon-btn {
          position: relative;
          color: var(--text-muted);
          padding: 0.4rem;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .icon-btn:hover {
          background: var(--background);
          color: var(--primary);
        }

        .badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 6px;
          height: 6px;
          background: #ef4444;
          border: 2px solid white;
          border-radius: 50%;
        }

        /* Content Area */
        .content-viewport {
          padding: 1.25rem 1.5rem;
          background: var(--background);
          flex: 1;
        }

        /* Mobile Adjustments */
        @media (max-width: 1024px) {
          .sidebar {
            --sidebar-width: 280px;
            transform: translateX(-100%);
          }
          .sidebar.active {
            transform: translateX(0);
          }
          .main-container {
            margin-left: 0 !important;
          }
          .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(8px);
            z-index: 999;
          }
        }

        /* User Dropdown Premium Styles */
        .user-dropdown-container { position: relative; }
        .header-user-badge { 
          width: 36px; height: 36px; 
          background: var(--primary); color: white; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          font-weight: 700; font-size: 0.9rem; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
          border: 2px solid transparent;
        }
        .header-user-badge:hover, .header-user-badge.active { 
          transform: scale(1.1); 
          box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
          border-color: rgba(255,255,255,0.5);
        }
        
        .user-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0; 
          width: 210px; padding: 0.75rem; border-radius: 16px;
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          transform-origin: top right;
          z-index: 1001;
        }
        .dropdown-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
        .dropdown-user-avatar { 
          width: 36px; height: 36px; background: var(--primary); color: white; 
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1rem;
        }
        .dropdown-name { font-weight: 800; color: var(--text-main); font-size: 0.85rem; }
        .dropdown-role { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        
        .dropdown-divider { height: 1px; background: #f1f5f9; margin: 0.5rem 0; }
        .dropdown-menu { display: flex; flex-direction: column; gap: 0.15rem; }
        .dropdown-item { 
          display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0.75rem; 
          border-radius: 10px; font-weight: 700; font-size: 0.85rem; color: #475569;
          transition: all 0.2s; border: none; background: none; width: 100%; cursor: pointer;
        }
        .dropdown-item:hover { background: var(--background); color: var(--primary); transform: translateX(2px); }
        .dropdown-item.text-danger:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .item-icon { width: 28px; height: 28px; background: var(--background); border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: inherit; }
        .dropdown-item:hover .item-icon { background: rgba(37,99,235,0.1); }
        .dropdown-item.text-danger .item-icon { color: #ef4444; }
        .dropdown-item.text-danger:hover .item-icon { background: #fee2e2; }

        .ms-auto { margin-left: auto; }
        .opacity-50 { opacity: 0.5; }
      ` }} />
    </div>
  );
};

export default Layout;
