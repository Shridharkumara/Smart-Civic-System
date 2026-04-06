import { useEffect, useState } from 'react';
import { loadIssues } from '../api';
import IssueCard from '../components/IssueCard';

export default function DashboardPage({ user }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadIssues({ user_id: user.id })
      .then((data) => setIssues(data.issues || []))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="panel-card">
        <h2>Sign in to view your dashboard</h2>
        <p>See your reported issues, track status, and stay informed.</p>
      </div>
    );
  }

  const resolvedCount = issues.filter((issue) => issue.status === 'Resolved').length;
  const pendingCount = issues.filter((issue) => issue.status === 'Pending').length;
  const inProgressCount = issues.filter((issue) => issue.status === 'In Progress').length;
  const totalVotes = issues.reduce((sum, issue) => sum + (issue.votes || 0), 0);

  return (
    <div className="page-panel">
      <section className="panel-card">
        <h1 className="section-title">👤 Your Dashboard</h1>
        <p>Manage your account and track your civic contributions.</p>
      </section>

      <section className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="panel-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.9rem', textTransform: 'uppercase' }}>Account</p>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>{user.name}</h2>
              <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>📧 {user.email}</p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>🏷️ Role: <strong>{user.role === 'admin' ? '🛡️ Administrator' : '👤 Community Member'}</strong></p>
            </div>
            <div style={{ fontSize: '3rem', opacity: 0.2 }}>👤</div>
          </div>
        </div>

        <div className="panel-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <div>
            <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.9rem', textTransform: 'uppercase' }}>Your Stats</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '700' }}>{issues.length}</p>
                <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.9 }}>Issues Reported</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '700' }}>{totalVotes}</p>
                <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.9 }}>Community Votes</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '700' }}>{resolvedCount}</p>
                <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.9 }}>✅ Resolved</p>
              </div>
              <div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '700' }}>{pendingCount}</p>
                <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.9 }}>⏳ Pending</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <h2>📋 Your Reported Issues</h2>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>Track the issues you've reported and their current status.</p>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : issues.length === 0 ? (
          <div className="empty-state">
            <h3>📝 No issues yet</h3>
            <p>You haven't reported any issues yet. Your contributions will appear here.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-light)', borderRadius: '8px', fontSize: '0.9rem', color: '#666' }}>
              Showing <strong>{issues.length}</strong> issue{issues.length !== 1 ? 's' : ''} | 
              Pending: <strong>{pendingCount}</strong> | 
              In Progress: <strong>{inProgressCount}</strong> | 
              Resolved: <strong>{resolvedCount}</strong>
            </div>
            <div className="card-grid">
              {issues.map((issue) => (
                <IssueCard key={issue.issue_id} issue={issue} user={user} />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="panel-card" style={{ background: 'var(--bg-light)', textAlign: 'center' }}>
        <h2>🎯 Thank you for contributing!</h2>
        <p>Your reports help improve our community. Keep reporting and voting on civic issues.</p>
      </section>
    </div>
  );
}
