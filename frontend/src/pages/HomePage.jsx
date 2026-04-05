import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadIssues, voteIssue } from '../api';
import IssueCard from '../components/IssueCard';
import StatsPanel from '../components/StatsPanel';

const categories = ['Roads', 'Garbage', 'Water', 'Electric', 'Safety'];

export default function HomePage({ user }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    loadIssues()
      .then((data) => {
        setIssues(data.issues || []);
        setLoading(false);
      })
      .catch((err) => {
        setError('Unable to load issues.');
        setLoading(false);
      });
  }, []);

  const stats = useMemo(() => {
    const summary = { total: issues.length, Pending: 0, 'In Progress': 0, Resolved: 0 };
    issues.forEach((issue) => {
      summary[issue.status] = (summary[issue.status] || 0) + 1;
    });
    return summary;
  }, [issues]);

  const handleVote = (issueId) => {
    voteIssue(issueId).then((data) => {
      setIssues((prev) => prev.map((issue) => issue.issue_id === issueId ? { ...issue, votes: data.votes } : issue));
    }).catch(() => {
      alert('Please sign in to vote');
    });
  };

  return (
    <div className="page-panel">
      <section className="panel-card">
        <div className="card-header">
          <div>
            <p className="section-title">🏘️ Smart Civic</p>
            <p>Report local issues, track progress, and drive community change.</p>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>Join thousands of citizens improving their neighborhoods through transparent civic engagement.</p>
          </div>
          <div>
            <Link to="/report" className="btn-primary">Report an Issue</Link>
          </div>
        </div>
      </section>

      <section className="card-grid">
        <StatsPanel title="Total reports" value={stats.total} />
        <StatsPanel title="Pending" value={stats.Pending} tone="warning" />
        <StatsPanel title="In progress" value={stats['In Progress']} tone="primary" />
        <StatsPanel title="Resolved" value={stats.Resolved} tone="success" />
      </section>

      <section className="panel-card">
        <div className="card-header">
          <div>
            <h2>Recent Issues</h2>
            <p>Latest reports from your community. Vote on the most important issues that need attention.</p>
          </div>
          <div>
            <Link to="/issues" className="btn-outline">View all</Link>
          </div>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : error ? (
          <p className="error-box">{error}</p>
        ) : issues.length === 0 ? (
          <div className="empty-state">
            <h3>No issues yet</h3>
            <p>Be the first to report an issue in your community.</p>
            <Link to="/report" className="btn-primary" style={{ marginTop: '1rem' }}>Report Now</Link>
          </div>
        ) : (
          <div className="card-grid">
            {issues.slice(0, 4).map((issue) => (
              <IssueCard key={issue.issue_id} issue={issue} user={user} onVote={handleVote} />
            ))}
          </div>
        )}
      </section>

      <section className="panel-card">
        <h2>Issue Categories</h2>
        <p style={{ marginBottom: '1.5rem' }}>Report issues in these common community areas:</p>
        <div className="card-grid">
          {categories.map((category) => (
            <div key={category} className="issue-card" style={{ cursor: 'default' }}>
              <h3 style={{ fontSize: '1.5rem' }}>
                {category === 'Roads' && '🛣️'}
                {category === 'Garbage' && '🗑️'}
                {category === 'Water' && '💧'}
                {category === 'Electric' && '⚡'}
                {category === 'Safety' && '🚨'}
              </h3>
              <h3>{category}</h3>
              <p>Report {category.toLowerCase()} issues affecting your area.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card" style={{ background: 'linear-gradient(135deg, #0066cc 0%, #004399 100%)', color: 'white', textAlign: 'center' }}>
        <h2 style={{ color: 'white' }}>Make a Difference Today</h2>
        <p style={{ color: 'rgba(255,255,255,0.9)' }}>Your community depends on your voice. Report issues, vote for important fixes, and help local leaders prioritize what matters most.</p>
        <Link to="/report" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Start Reporting →</Link>
      </section>
    </div>
  );
}
