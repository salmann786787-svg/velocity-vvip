import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Reservations from './components/Reservations';
import Fleet from './components/Fleet';
import Dispatch from './components/Dispatch';
import Accounts from './components/Accounts';
import TemplateSettings from './components/TemplateSettings';
import Drivers from './components/Drivers';
import Affiliates from './components/Affiliates';

type View = 'dashboard' | 'reservations' | 'fleet' | 'dispatch' | 'accounts' | 'settings' | 'drivers' | 'affiliates';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 1024;
      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(true);
      } else if (width !== lastWidth) {
        setSidebarOpen(false);
      }
      lastWidth = width;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    closeSidebarOnMobile();
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavClick} />;
      case 'reservations':
        return <Reservations />;
      case 'fleet':
        return <Fleet />;
      case 'dispatch':
        return <Dispatch />;
      case 'accounts':
        return <Accounts />;
      case 'drivers':
        return <Drivers />;
      case 'affiliates':
        return <Affiliates />;
      case 'settings':
        return <TemplateSettings />;
      default:
        return <Dashboard onNavigate={handleNavClick} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" fill="url(#gradient1)" />
                <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="gradient1" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="hsl(280, 90%, 60%)" />
                    <stop offset="100%" stopColor="hsl(200, 100%, 60%)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {sidebarOpen && (
              <div className="logo-text">
                <h3>Velocity VVIP</h3>
                <p>Management Suite</p>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="14" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="14" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            className={`nav-item ${currentView === 'reservations' ? 'active' : ''}`}
            onClick={() => handleNavClick('reservations')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
            </svg>
            {sidebarOpen && <span>Reservations</span>}
          </button>

          <button
            className={`nav-item ${currentView === 'fleet' ? 'active' : ''}`}
            onClick={() => handleNavClick('fleet')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0m-10 0a2 2 0 1 1-4 0a2 2 0 1 1-4 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {sidebarOpen && <span>Fleet</span>}
          </button>

          <button
            className={`nav-item ${currentView === 'dispatch' ? 'active' : ''}`}
            onClick={() => handleNavClick('dispatch')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <polyline points="12 6 12 12 16 14" strokeWidth="2" />
            </svg>
            {sidebarOpen && <span>Dispatch</span>}
          </button>

          <button
            className={`nav-item ${currentView === 'accounts' ? 'active' : ''}`}
            onClick={() => handleNavClick('accounts')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="7" r="4" strokeWidth="2" />
            </svg>
            {sidebarOpen && <span>Customers</span>}
          </button>

          <button
            className={`nav-item ${currentView === 'drivers' ? 'active' : ''}`}
            onClick={() => handleNavClick('drivers')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" strokeWidth="2" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {sidebarOpen && <span>Drivers</span>}
          </button>

          <button
            className={`nav-item ${currentView === 'affiliates' ? 'active' : ''}`}
            onClick={() => handleNavClick('affiliates')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {sidebarOpen && <span>Affiliates</span>}
          </button>

          <button
            className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {sidebarOpen && <span>Settings</span>}
          </button>
        </nav>

        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </aside>

      {isMobile && sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebarOnMobile}></div>}

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h2>
              {currentView === 'dashboard' ? 'Overview' :
                currentView === 'reservations' ? 'Reservations' :
                  currentView === 'fleet' ? 'Fleet Management' :
                    currentView === 'dispatch' ? 'Daily Dispatch' :
                      currentView === 'accounts' ? 'Customers' :
                        currentView === 'drivers' ? 'Driver Management' :
                          currentView === 'affiliates' ? 'Affiliates' :
                            currentView === 'settings' ? 'Settings' : 'Velocity'}
            </h2>
          </div>
          <div className="top-bar-right">
            <div className="user-info">
              <div className="user-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                  <circle cx="12" cy="7" r="4" strokeWidth="2" />
                </svg>
              </div>
              <div className="user-details">
                <span className="user-name">Admin User</span>
                <span className="user-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default App;
