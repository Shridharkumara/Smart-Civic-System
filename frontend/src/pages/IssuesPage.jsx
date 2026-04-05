import { useEffect, useState } from 'react';
import { loadIssues, voteIssue } from '../api';
import IssueCard from '../components/IssueCard';

const categoryOptions = ['', 'Roads', 'Garbage', 'Water', 'Electric', 'Safety'];
const statusOptions = ['', 'Pending', 'In Progress', 'Resolved'];

export default function IssuesPage({ user }) {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    loadIssues({ search, category, status })
      .then((data) => {
        setIssues(data.issues || []);
      })
      .catch((err) => {
        setError('Failed to load issues. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVote = (issueId) => {
    voteIssue(issueId)
      .then((data) => {
        setIssues((prev) => prev.map((issue) => issue.issue_id === issueId ? { ...issue, votes: data.votes } : issue));
      })
      .catch(() => {
        alert('Please sign in to vote on issues');
      });
  };

  const handleFilter = () => {
    loadData();
  };

  return (
    <div className="page-panel">
      <section className="panel-card">
        <div className="card-header">
          <div>
            <h1 className="section-title">🔍 All Issues</h1>
            <p>Browse and vote on civic issues in your community. Support the issues that matter most to you.</p>
          </div>
          <button className="btn-secondary" onClick={loadData}>🔄 Refresh</button>
        </div>
        <div className="filter-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues..."
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>{option || 'All categories'}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>{option || 'Any status'}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={handleFilter}>Apply Filters</button>
        </div>
      </section>

      {error && (
        <section className="panel-card">
          <p className="error-box">{error}</p>
        </section>
      )}

      {loading ? (
        <section className="panel-card">
          <div className="loading" style={{ padding: '3rem' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: '#666' }}>Loading issues...</p>
          </div>
        </section>
      ) : issues.length === 0 ? (
        <section className="panel-card">
          <div className="empty-state">
            <h3>📭 No issues found</h3>
            <p>Try adjusting your search filters or check back soon.</p>
          </div>
        </section>
      ) : (
        <>
          <section className="panel-card" style={{ padding: '1rem' }}>
            <p style={{ margin: 0, color: '#666' }}>Showing <strong>{issues.length}</strong> issue{issues.length !== 1 ? 's' : ''}</p>
          </section>
          <div className="card-grid">
            {issues.map((issue) => (
              <IssueCard key={issue.issue_id} issue={issue} user={user} onVote={handleVote} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
