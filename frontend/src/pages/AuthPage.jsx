import { useState } from 'react';
import { loginUser, registerUser } from '../api';

export default function AuthPage({ onSuccess }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { email, password, ...(mode === 'register' ? { name } : {}) };
      const result = mode === 'register' ? await registerUser(payload) : await loginUser(payload);
      onSuccess(result.user, result.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', minHeight: '70vh', alignItems: 'center' }}>
      <div style={{ padding: '2rem' }}>
        <h1 className="section-title" style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
          {mode === 'login' ? '👋 Welcome Back' : '🎉 Join the Movement'}
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>
          {mode === 'login' 
            ? 'Sign in to your account to report issues, track progress, and make your community better.'
            : 'Create an account to report civic issues and vote on the problems that matter most to your community.'}
        </p>
        <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Why create an account?</h3>
          <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#666' }}>
            <li style={{ marginBottom: '0.5rem' }}>📝 Report local civic issues</li>
            <li style={{ marginBottom: '0.5rem' }}>👍 Vote on important issues</li>
            <li style={{ marginBottom: '0.5rem' }}>📊 Track your contributions</li>
            <li style={{ marginBottom: '0.5rem' }}>🔔 Get updates on issues you care about</li>
          </ul>
        </div>
      </div>

      <div className="auth-card" style={{ margin: 0 }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', margin: '0 0 1.5rem 0' }}>
          {mode === 'login' ? '🔐 Sign in' : '✍️ Create Account'}
        </h2>
        {error && <div className="error-box">{error}</div>}
        
        <form onSubmit={handleSubmit} className="form-row" style={{ gridTemplateColumns: '1fr' }}>
          {mode === 'register' && (
            <div className="form-group">
              <label>👤 Full Name</label>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe" 
                required 
              />
            </div>
          )}
          
          <div className="form-group">
            <label>📧 Email Address</label>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              type="email" 
              placeholder="you@example.com" 
              required 
            />
          </div>

          <div className="form-group">
            <label>🔑 Password</label>
            <input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              type="password" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading 
              ? '⏳ Please wait...' 
              : mode === 'login' 
                ? '🔓 Sign in' 
                : '✨ Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button 
            className="btn-outline" 
            type="button" 
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
              setName('');
              setEmail('');
              setPassword('');
            }}
            style={{ width: '100%' }}
          >
            {mode === 'login' ? '📝 Create Account' : '🔐 Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
