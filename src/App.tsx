import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import type { Page } from './types';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import PublicAnalytics from './pages/PublicAnalytics';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(!!authToken);

  useEffect(() => {
    if (authToken) {
      setInitialLoading(true);
      fetch('http://127.0.0.1:5000/api/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      .then(res => res.ok ? res.json() : Promise.reject('Invalid token'))
      .then(data => {
        setUser(data);
        setInitialLoading(false);
      })
      .catch(() => {
        handleLogout();
        setInitialLoading(false);
      });
    } else {
      setUser(null);
      setInitialLoading(false);
    }
  }, [authToken]);

  const handleLogin = (token: string, userData: any) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setCurrentPage('landing');
  };

  const navigate = (page: Page) => {
    if (initialLoading) return;

    // Protected routes
    if ((page === 'dashboard' || page === 'claims' || page === 'onboarding' || page === 'admin') && !authToken) {
      setCurrentPage('login');
      return;
    }
    
    // Auth role check
    if (page === 'admin' && user?.role !== 'admin') {
      setCurrentPage('dashboard');
      return;
    }
    
    setCurrentPage(page);
  };

  const showNavbar = currentPage === 'landing' || currentPage === 'onboarding' || currentPage === 'login' || currentPage === 'analytics';

  if (initialLoading) {
    return (
      <div style={{ background: '#0A0A0B', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: 20 }}>
        <Shield size={48} color="#FF6B35" className="pulse" />
        <div style={{ fontWeight: 600, letterSpacing: '0.1em' }}>SHIELDPAY SECURITY CHECK...</div>
      </div>
    );
  }

  return (
    <div>
      {showNavbar && <Navbar currentPage={currentPage} navigate={navigate} authToken={authToken} user={user} onLogout={handleLogout} />}

      {currentPage === 'landing' && <LandingPage navigate={navigate} />}
      {currentPage === 'analytics' && <PublicAnalytics />}
      {currentPage === 'login' && <LoginPage navigate={navigate} onLogin={handleLogin} />}
      
      {/* Protected Routes */}
      {authToken && (
        <>
          {currentPage === 'onboarding' && <OnboardingPage navigate={navigate} authToken={authToken} user={user} />}
          {currentPage === 'dashboard' && <Dashboard navigate={navigate} user={user} />}
          {currentPage === 'claims' && <Dashboard navigate={navigate} user={user} initialTab="claims" />}
          {currentPage === 'admin' && user?.role === 'admin' && <AdminDashboard navigate={navigate} authToken={authToken} />}
        </>
      )}
    </div>
  );
}

export default App;
