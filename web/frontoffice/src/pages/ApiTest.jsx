import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { authService, accountService } from '../services/api';
import './ApiTest.css';

export default function ApiTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Form states
  const [loginForm, setLoginForm] = useState({ username: 'admin@roadworks.mg', password: 'admin123' });
  const [accountForm, setAccountForm] = useState({ username: '', password: '', roleId: 2 });
  const [accountId, setAccountId] = useState('');

  const endpoints = [
    { id: 'login', method: 'POST', path: '/api/auth/login', description: 'Connexion utilisateur' },
    { id: 'logout', method: 'POST', path: '/api/auth/logout', description: 'Déconnexion' },
    { id: 'me', method: 'GET', path: '/api/auth/me', description: 'Utilisateur courant' },
    { id: 'validate', method: 'GET', path: '/api/auth/validate', description: 'Valider le token' },
    { id: 'accounts', method: 'GET', path: '/api/auth/accounts', description: 'Liste des comptes' },
    { id: 'account', method: 'GET', path: '/api/auth/accounts/{id}', description: 'Détails d\'un compte' },
    { id: 'create', method: 'POST', path: '/api/auth/accounts', description: 'Créer un compte' },
    { id: 'locked', method: 'GET', path: '/api/auth/accounts/locked', description: 'Comptes bloqués' },
    { id: 'unlock', method: 'POST', path: '/api/auth/accounts/{id}/unlock', description: 'Débloquer un compte' },
    { id: 'unsynced', method: 'GET', path: '/api/auth/accounts/unsynced', description: 'Comptes non synchronisés' },
  ];

  const executeRequest = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      let result;
      const startTime = Date.now();

      switch (activeTab) {
        case 'login':
          result = await api.post('/auth/login', loginForm);
          break;
        case 'logout':
          await authService.logout();
          result = { data: { message: 'Déconnexion réussie' } };
          break;
        case 'me':
          result = await api.get('/auth/me');
          break;
        case 'validate':
          result = await api.get('/auth/validate');
          break;
        case 'accounts':
          result = await api.get('/auth/accounts');
          break;
        case 'account':
          result = await api.get(`/auth/accounts/${accountId}`);
          break;
        case 'create':
          result = await api.post('/auth/accounts', accountForm);
          break;
        case 'locked':
          result = await api.get('/auth/accounts/locked');
          break;
        case 'unlock':
          result = await api.post(`/auth/accounts/${accountId}/unlock`);
          break;
        case 'unsynced':
          result = await api.get('/auth/accounts/unsynced');
          break;
        default:
          throw new Error('Endpoint non reconnu');
      }

      const duration = Date.now() - startTime;
      setResponse({
        status: result.status,
        statusText: result.statusText,
        duration: `${duration}ms`,
        data: result.data,
      });
    } catch (err) {
      setError({
        status: err.response?.status || 'Erreur',
        statusText: err.response?.statusText || 'Erreur réseau',
        message: err.response?.data?.message || err.message,
        data: err.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const currentEndpoint = endpoints.find(e => e.id === activeTab);

  return (
    <div className="api-test-page">
      {/* Header */}
      <header className="api-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour
        </button>
        <div className="header-center">
          <h1>🔧 Test API REST</h1>
          <p>Testez les endpoints d'authentification</p>
        </div>
        <div className="auth-status">
          {user ? (
            <span className="status-badge authenticated">
              <span className="dot"></span>
              Connecté: {user.username}
            </span>
          ) : (
            <span className="status-badge">
              <span className="dot offline"></span>
              Non connecté
            </span>
          )}
        </div>
      </header>

      <div className="api-content">
        {/* Sidebar - Endpoints */}
        <aside className="endpoints-sidebar">
          <h2>Endpoints</h2>
          <div className="endpoints-list">
            {endpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                className={`endpoint-btn ${activeTab === endpoint.id ? 'active' : ''}`}
                onClick={() => setActiveTab(endpoint.id)}
              >
                <span className={`method-badge ${endpoint.method.toLowerCase()}`}>
                  {endpoint.method}
                </span>
                <div className="endpoint-info">
                  <span className="endpoint-path">{endpoint.path}</span>
                  <span className="endpoint-desc">{endpoint.description}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="api-main">
          {/* Request Panel */}
          <section className="request-panel">
            <div className="panel-header">
              <h3>Requête</h3>
              <span className={`method-badge large ${currentEndpoint?.method.toLowerCase()}`}>
                {currentEndpoint?.method}
              </span>
              <code className="endpoint-url">
                http://localhost:8081{currentEndpoint?.path}
              </code>
            </div>

            <div className="panel-body">
              {/* Login Form */}
              {activeTab === 'login' && (
                <div className="form-section">
                  <h4>Corps de la requête (JSON)</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                        placeholder="admin@roadworks.mg"
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <pre className="json-preview">
                    {JSON.stringify(loginForm, null, 2)}
                  </pre>
                </div>
              )}

              {/* Create Account Form */}
              {activeTab === 'create' && (
                <div className="form-section">
                  <h4>Corps de la requête (JSON)</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Username (email)</label>
                      <input
                        type="text"
                        value={accountForm.username}
                        onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        value={accountForm.password}
                        onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="form-group">
                      <label>Role ID</label>
                      <select
                        value={accountForm.roleId}
                        onChange={(e) => setAccountForm({ ...accountForm, roleId: Number(e.target.value) })}
                      >
                        <option value={1}>1 - MANAGER</option>
                        <option value={2}>2 - USER</option>
                      </select>
                    </div>
                  </div>
                  <pre className="json-preview">
                    {JSON.stringify(accountForm, null, 2)}
                  </pre>
                </div>
              )}

              {/* Account ID Input */}
              {(activeTab === 'account' || activeTab === 'unlock') && (
                <div className="form-section">
                  <h4>Paramètre de chemin</h4>
                  <div className="form-group">
                    <label>Account ID</label>
                    <input
                      type="number"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>
              )}

              {/* No body required */}
              {['logout', 'me', 'validate', 'accounts', 'locked', 'unsynced'].includes(activeTab) && (
                <div className="form-section">
                  <h4>Informations</h4>
                  <p className="info-text">
                    {activeTab === 'logout' && 'Invalide le token de session actuel. Nécessite le header Authorization.'}
                    {activeTab === 'me' && 'Retourne les informations de l\'utilisateur connecté. Nécessite le header Authorization.'}
                    {activeTab === 'validate' && 'Vérifie si le token est valide. Nécessite le header Authorization.'}
                    {activeTab === 'accounts' && 'Liste tous les comptes utilisateurs.'}
                    {activeTab === 'locked' && 'Liste les comptes bloqués suite à trop de tentatives.'}
                    {activeTab === 'unsynced' && 'Liste les comptes non synchronisés avec Firebase.'}
                  </p>
                </div>
              )}

              <button 
                className={`execute-btn ${loading ? 'loading' : ''}`}
                onClick={executeRequest}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Exécution...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none">
                      <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Exécuter
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Response Panel */}
          <section className="response-panel">
            <div className="panel-header">
              <h3>Réponse</h3>
              {response && (
                <div className="response-meta">
                  <span className={`status-code success`}>{response.status} {response.statusText}</span>
                  <span className="duration">{response.duration}</span>
                </div>
              )}
              {error && (
                <div className="response-meta">
                  <span className="status-code error">{error.status} {error.statusText}</span>
                </div>
              )}
            </div>

            <div className="panel-body">
              {!response && !error && !loading && (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>Cliquez sur "Exécuter" pour voir la réponse</p>
                </div>
              )}

              {loading && (
                <div className="loading-state">
                  <div className="spinner large"></div>
                  <p>Requête en cours...</p>
                </div>
              )}

              {response && (
                <pre className="response-body success">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              )}

              {error && (
                <div className="error-response">
                  <div className="error-message">
                    <strong>Erreur:</strong> {error.message}
                  </div>
                  {error.data && (
                    <pre className="response-body error">
                      {JSON.stringify(error.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
