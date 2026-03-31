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
  Circle
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isSuratOpen, setIsSuratOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { 
      title: 'Surat Menyurat', 
      icon: <Mail size={20} />, 
      path: '/surat',
      submenu: [
        { title: 'Surat Masuk', path: '/surat/masuk' },
        { title: 'Surat Keluar', path: '/surat/keluar' }
      ]
    },
    { title: 'Kas Office', icon: <Wallet size={20} />, path: '/kas' },
    { title: 'Karyawan', icon: <Users size={20} />, path: '/karyawan' },
    { title: 'Pustaka Hanura', icon: <Library size={20} />, path: '/pustaka' },
    { title: 'Manajemen User', icon: <UserCog size={20} />, path: '/users', role: 'Admin' },
    { title: 'Pengaturan', icon: <Settings size={20} />, path: '/settings' },
    { title: 'About', icon: <Info size={20} />, path: '/about' },
  ];

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
              if (item.role && user.role !== item.role) return null;

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
                    {item.icon}
                    <span className="link-text">{item.title}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <UserIcon size={18} />
            </div>
            <div className="user-info">
              <p className="user-name">{user?.username || 'User'}</p>
              <p className="user-role">{user?.role || 'Guest'}</p>
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
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge"></span>
            </button>
            <div className="header-user-badge">
              {user?.username?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <div className="content-viewport">
          {children}
        </div>
      </main>

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
          background: white; /* Brighter Sidebar */
          box-shadow: 4px 0 24px rgba(0,0,0,0.05);
        }

        .sidebar-closed .sidebar {
          transform: translateX(-100%);
        }

        .sidebar-header {
          padding: 2rem 1.5rem;
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

        .sidebar-nav { padding: 1.5rem 1rem; }

        .menu-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1.25rem;
          border-radius: 14px;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }

        .menu-link:hover {
          background: #f1f5f9;
          color: var(--primary);
          transform: translateX(4px);
        }

        .menu-link.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.4);
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
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-muted);
          border-radius: 10px;
          transition: all 0.2s;
        }

        .submenu-link:hover, .submenu-link.active {
          color: var(--primary);
          background: rgba(37, 99, 235, 0.05);
        }

        .sidebar-footer { padding: 1.5rem; border-top: 1px solid var(--border); background: #f8fafc; display: flex; align-items: center; justify-content: space-between; }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: var(--background);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          border: 1px solid var(--border);
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name { font-size: 0.95rem; font-weight: 800; color: var(--text-main); }

        .user-role {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white !important;
          border-bottom: 1px solid var(--border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          position: sticky;
          top: 0;
          z-index: 900;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .page-title { font-weight: 800; color: var(--text-main); font-size: 1rem; letter-spacing: 0.5px; }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .icon-btn {
          position: relative;
          color: var(--text-muted);
          padding: 0.5rem;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .icon-btn:hover {
          background: var(--background);
          color: var(--primary);
        }

        .badge {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border: 2px solid white;
          border-radius: 50%;
        }

        .header-user-badge {
          width: 36px;
          height: 36px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
        }

        /* Content Area */
        .content-viewport {
          padding: 2.5rem;
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
      ` }} />
    </div>
  );
};

export default Layout;
