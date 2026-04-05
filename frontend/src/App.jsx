import { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { setToken } from './api';
import HomePage from './pages/HomePage';
import IssuesPage from './pages/IssuesPage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = window.localStorage.getItem('smartcivic_user');
    const token = window.localStorage.getItem('smartcivic_token');
    if (saved && token) {
      setToken(token);
      return JSON.parse(saved);
    }
    return null;
  });

  useEffect(() => {
    const token = window.localStorage.getItem('smartcivic_token');
    if (token) {
      setToken(token);
    }
  }, []);

  const handleLogin = (userData, token) => {
    window.localStorage.setItem('smartcivic_token', token);
    window.localStorage.setItem('smartcivic_user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    window.localStorage.removeItem('smartcivic_token');
    window.localStorage.removeItem('smartcivic_user');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="logo-block">
          <Link to="/" className="brand">Smart Civic</Link>
          <span className="tagline">Issue reporting, status tracking, faster local action</span>
        </div>
        <nav className="nav-links">
          <Link to="/issues">Issues</Link>
          <Link to="/report">Report</Link>
          {user ? <Link to="/dashboard">Dashboard</Link> : null}
          {user && user.role === 'admin' ? <Link to="/admin">Admin</Link> : null}
          {user ? (
            <button className="btn-outline" onClick={handleLogout}>Log out</button>
          ) : (
            <Link to="/login" className="btn-primary">Sign in</Link>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/issues" element={<IssuesPage user={user} />} />
          <Route path="/report" element={<ReportPage user={user} />} />
          <Route path="/dashboard" element={<DashboardPage user={user} />} />
          <Route path="/admin" element={<AdminPage user={user} />} />
          <Route path="/login" element={<AuthPage onSuccess={handleLogin} />} />
        </Routes>
      </main>

      <footer className="footer-bar">
        <div>Smart Civic Issue Reporting System</div>
        <div>Build with React, Java Servlets, MySQL</div>
      </footer>
    </div>
  );
}

export default App;
