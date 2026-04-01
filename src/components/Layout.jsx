import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, get, set, remove, update, onValue } from 'firebase/database';
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
  Clock,
  Calendar
} from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import Modal from './Modal';

const Layout = ({ children }) => {
  const { user, logout, language, workingMonth, setWorkingMonth } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isSuratOpen, setIsSuratOpen] = useState(false);
  const [isKasOpen, setIsKasOpen] = useState(false);
  const [isKegiatanOpen, setIsKegiatanOpen] = useState(false);
  const [isPelayananOpen, setIsPelayananOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

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
      offline: 'OFFLINE',
      inventaris: 'Inventaris Kantor',
      pelayanan: 'Pelayanan Masyarakat'
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
      offline: 'OFFLINE',
      inventaris: 'Office Inventory',
      pelayanan: 'PUBLIC SERVICE'
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

  // Sync Submenu Open state with Current Path (ONLY on initial mount or when entering a module)
  useEffect(() => {
    if (location.pathname.startsWith('/surat') && !isSuratOpen) setIsSuratOpen(true);
    if (location.pathname.startsWith('/kas') && !isKasOpen) setIsKasOpen(true);
    if (location.pathname.startsWith('/pelayanan') && !isPelayananOpen) setIsPelayananOpen(true);
    if (location.pathname.startsWith('/admin/kegiatan') && !isKegiatanOpen) setIsKegiatanOpen(true);
  }, []); // Only run ONCE on mount to avoid overriding manual toggle

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { title: t.dashboard, icon: <LayoutDashboard size={20} />, path: '/', roles: ['Admin', 'Petugas'] },
    {
      title: t.pelayanan,
      icon: <Users size={20} />,
      path: '/pelayanan',
      roles: ['Admin', 'Petugas'],
      submenu: [
        { title: 'Menu Layanan', path: '/pelayanan' },
        { title: 'Data Pekerjaan', path: '/pelayanan/data' }
      ]
    },
    {
      title: t.surat,
      icon: <Mail size={20} />,
      path: '/surat',
      roles: ['Admin', 'Petugas'],
      submenu: [
        { title: t.suratMasuk, path: '/surat/masuk' },
        { title: t.suratKeluar, path: '/surat/keluar' }
      ]
    },
    {
      title: t.kas,
      icon: <Wallet size={20} />,
      path: '/kas',
      roles: ['Admin', 'Petugas'],
      submenu: [
        { title: 'Kas Utama', path: '/kas' },
        { title: 'Rekapan Transaksi', path: '/kas/rekapan' }
      ]
    },
    { title: t.inventaris, icon: <Library size={20} />, path: '/inventaris', roles: ['Admin', 'Petugas', 'Verifikator'] },
    { title: t.karyawan, icon: <Users size={20} />, path: '/karyawan', roles: ['Admin', 'Petugas'] },
    {
      title: 'Manajemen Kegiatan',
      icon: <Calendar size={20} />,
      path: '/admin/kegiatan',
      roles: ['Admin'],
      submenu: [
        { title: 'Daftar Kegiatan', path: '/admin/kegiatan' },
        { title: 'Arsip Kegiatan', path: '/admin/kegiatan/arsip' }
      ]
    },
    { title: t.pustaka, icon: <Library size={20} />, path: '/pustaka', roles: ['Admin', 'Petugas'] },
    { title: t.user, icon: <UserCog size={20} />, path: '/users', roles: ['Admin'] },
    { title: t.settings, icon: <Settings size={20} />, path: '/settings', roles: ['Admin', 'Petugas'] },
    { title: t.about, icon: <Info size={20} />, path: '/about', roles: ['Admin', 'Petugas'] },
  ].filter(item => !item.roles || item.roles.includes(user?.role));

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
                const isOpen = item.path === '/surat' ? isSuratOpen : 
                             (item.path === '/kas' ? isKasOpen : 
                             (item.path === '/pelayanan' ? isPelayananOpen : isKegiatanOpen));
                
                const setIsOpen = item.path === '/surat' ? setIsSuratOpen : 
                                (item.path === '/kas' ? setIsKasOpen : 
                                (item.path === '/pelayanan' ? setIsPelayananOpen : setIsKegiatanOpen));

                return (
                  <li key={idx} className="menu-item-group">
                    <button
                      className={`menu-link ${(isOpen || (item.path !== '/' && location.pathname.startsWith(item.path)) || (item.path === '/' && location.pathname === '/')) ? 'active' : ''}`}
                      onClick={() => {
                        setIsOpen(!isOpen);
                        // Only navigate if we are opening it and NOT already within that path
                        if (!isOpen && item.path && !location.pathname.startsWith(item.path)) {
                          navigate(item.path);
                        }
                      }}
                    >
                      <span className="link-content">
                        {item.icon}
                        <span className="link-text">{item.title}</span>
                      </span>
                      <ChevronDown size={16} className={`chevron ${isOpen ? 'rotate' : ''}`} />
                    </button>
                    <ul className={`submenu ${isOpen ? 'open' : ''}`}>
                      {item.submenu.map((sub, sidx) => (
                        <li key={sidx}>
                          <NavLink to={sub.path} className="submenu-link">
                            <Circle size={8} /> {sub.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }

              return (
                <li key={idx}>
                  <NavLink to={item.path} className={({ isActive }) => `menu-link ${(isActive || (item.path !== '/' && location.pathname.startsWith(item.path))) ? 'active' : ''}`}>
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
                {currentTime.toLocaleTimeString('id-ID', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                })}
              </p>
              <p className="date-now">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long' })}, {currentTime.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
              <p className="device-id-footer">
                ID: {localStorage.getItem('situ_hanura_device_id')?.split('_')[1] || 'Unknown'}
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
          <div className="navbar-inner">
            <div className="header-left">
              <button className="toggle-btn" onClick={toggleSidebar}>
                <Menu size={24} />
              </button>
              <div className="period-selector-container">
                <Calendar size={16} className="text-primary" />
                <select
                  value={workingMonth}
                  onChange={(e) => setWorkingMonth(e.target.value)}
                  className="working-month-select"
                >
                  {Array.from({ length: 13 }, (_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - 6 + i);
                    const val = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                    const label = d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
                    return <option key={val} value={val}>{label}</option>;
                  })}
                </select>
                <span className="period-badge">PERIODE AKTIF</span>
              </div>
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
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-menu">
                      <button className="dropdown-item" onClick={() => { setIsProfileModalOpen(true); setIsUserMenuOpen(false); }}>
                        <div className="item-icon"><UserIcon size={18} /></div>
                        <span>Profil Saya</span>
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

      <style dangerouslySetInnerHTML={{
        __html: `
        .app-layout {
          display: flex;
          min-height: 100vh;
          background: var(--background);
        }

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
          background: var(--surface);
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

        .brand-info { display: flex; flex-direction: column; }
        .brand-name { font-weight: 800; font-size: 1.1rem; color: var(--text-main); }
        .brand-tag { font-size: 0.65rem; font-weight: 600; color: var(--text-muted); }

        .sidebar-nav { 
          padding: 1rem 0.65rem; 
          flex: 1; 
          overflow-y: auto; 
        }

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

        .link-content { display: flex; align-items: center; gap: 0.75rem; }
        .link-text { font-size: 0.9rem; }
        .chevron { transition: transform 0.3s; }
        .chevron.rotate { transform: rotate(180deg); }

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

        .clock-container { display: flex; align-items: center; gap: 0.75rem; color: var(--text-main); }
        .time-now { font-size: 1rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; line-height: 1; }
        .date-now { font-size: 0.65rem; color: var(--text-muted); font-weight: 700; margin-top: 2px; }
        .logout-btn { color: var(--text-muted); background: none; border: none; cursor: pointer; transition: color 0.2s; }
        .logout-btn:hover { color: #ef4444; }

        .main-container {
          flex: 1;
          margin-left: var(--sidebar-width);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          background: var(--background);
          min-height: 100vh;
        }

        .sidebar-closed .main-container { margin-left: 0; }

        .top-navbar {
          height: var(--navbar-height);
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 900;
        }
        
        /* Centered Nav Inner */
        .navbar-inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left { display: flex; align-items: center; gap: 0.75rem; }
        .header-right { display: flex; align-items: center; gap: 0.75rem; }

        .period-selector-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--background);
          padding: 0.4rem 0.8rem;
          border-radius: 100px;
          border: 1px solid var(--border);
          margin-left: 1rem;
        }

        .working-month-select {
          background: transparent;
          border: none;
          color: var(--text-main);
          font-weight: 800;
          font-size: 0.85rem;
          outline: none;
        }

        .period-badge {
          font-size: 0.6rem;
          font-weight: 800;
          background: var(--primary);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .header-user-badge { 
          width: 36px; height: 36px; background: var(--primary); color: white; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; font-weight: 700; cursor: pointer;
        }

        .user-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0; 
          width: 220px; padding: 0.75rem; border-radius: 16px;
          background: var(--surface); border: 1px solid var(--border);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 1001;
        }

        .dropdown-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
        .dropdown-user-avatar { width: 36px; height: 36px; background: var(--primary); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .user-name { font-weight: 800; color: var(--text-main); font-size: 0.85rem; display: block; }
        .user-role { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; }

        .dropdown-divider { height: 1px; background: var(--border); margin: 0.5rem 0; }
        .dropdown-item { 
          display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; 
          border-radius: 8px; width: 100%; border: none; background: none;
          font-size: 0.85rem; font-weight: 600; color: var(--text-main); cursor: pointer;
        }
        .dropdown-item:hover { background: var(--background); color: var(--primary); }
        .dropdown-item.text-danger:hover { color: #ef4444; background: #fee2e2; }

        .content-viewport { 
          padding: 2rem; 
          background: var(--background); 
          flex: 1; 
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          animation: pageFadeIn 0.5s ease-out;
        }

        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.active { transform: translateX(0); }
          .main-container { margin-left: 0 !important; }
        }

        @media (max-width: 640px) {
          .top-navbar { padding: 0 1rem; }
          .period-selector-container { margin-left: 0.5rem; padding: 0.3rem 0.6rem; }
          .period-badge { display: none; }
          .working-month-select { font-size: 0.75rem; }
          .content-viewport { padding: 1rem; }
        }

        @media (max-width: 480px) {
          .period-selector-container { max-width: 140px; }
          .time-display { display: none; }
          .sidebar-footer { flex-direction: column; gap: 10px; align-items: flex-start; }
          .clock-container { margin-bottom: 5px; }
        }
      ` }} />
    </div>
  );
};

export default Layout;
