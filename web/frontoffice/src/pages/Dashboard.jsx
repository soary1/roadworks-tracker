import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      id: 'map', 
      icon: '🗺️', 
      title: 'Carte des signalements', 
      description: 'Visualiser tous les signalements sur la carte',
      path: '/map',
      color: '#667eea'
    },
    { 
      id: 'reports', 
      icon: '📋', 
      title: 'Liste des signalements', 
      description: 'Gérer et valider les signalements',
      path: '/reports',
      color: '#f59e0b'
    },
    { 
      id: 'companies', 
      icon: '🏢', 
      title: 'Entreprises', 
      description: 'Gérer les entreprises de travaux',
      path: '/companies',
      color: '#10b981'
    },
    { 
      id: 'accounts', 
      icon: '👥', 
      title: 'Comptes utilisateurs', 
      description: 'Gérer les comptes et permissions',
      path: '/accounts',
      color: '#8b5cf6'
    },
    { 
      id: 'api-test', 
      icon: '🔧', 
      title: 'Test API', 
      description: 'Tester les endpoints REST',
      path: '/api-test',
      color: '#ec4899'
    },
    { 
      id: 'stats', 
      icon: '📊', 
      title: 'Statistiques', 
      description: 'Tableaux de bord et analytics',
      path: '/stats',
      color: '#06b6d4'
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="header-title">
            <h1>Roadworks Tracker</h1>
            <span className="badge">Manager</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'M'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.username || 'Manager'}</span>
              <span className="user-role">{user?.role || 'MANAGER'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Bienvenue, {user?.username?.split('@')[0] || 'Manager'} 👋</h2>
          <p>Sélectionnez une option pour commencer</p>
        </div>

        <div className="menu-grid">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="menu-card"
              onClick={() => navigate(item.path)}
              style={{ '--accent-color': item.color }}
            >
              <div className="card-icon" style={{ background: `${item.color}20`, color: item.color }}>
                <span>{item.icon}</span>
              </div>
              <div className="card-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <div className="card-arrow">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#667eea20', color: '#667eea' }}>📍</div>
            <div className="stat-info">
              <span className="stat-value">--</span>
              <span className="stat-label">Signalements en attente</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>🔧</div>
            <div className="stat-info">
              <span className="stat-value">--</span>
              <span className="stat-label">Travaux en cours</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>✅</div>
            <div className="stat-info">
              <span className="stat-value">--</span>
              <span className="stat-label">Travaux terminés</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>👥</div>
            <div className="stat-info">
              <span className="stat-value">--</span>
              <span className="stat-label">Utilisateurs actifs</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
