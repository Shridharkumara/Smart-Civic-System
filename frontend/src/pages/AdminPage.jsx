import { useEffect, useState } from 'react';
import { loadIssues, updateIssueStatus } from '../api';

const statusChoices = ['Pending', 'In Progress', 'Resolved'];

export default function AdminPage({ user }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setLoading(true);
    loadIssues().then((data) => {
      setIssues(data.issues || []);
      setLoading(false);
    });
  }, []);

  const handleStatus = async (issueId, nextStatus) => {
    try {
      await updateIssueStatus(issueId, nextStatus);
      setIssues((prev) => prev.map((issue) => issue.issue_id === issueId ? { ...issue, status: nextStatus } : issue));
      setNotice(`Updated issue ${issueId} to ${nextStatus}.`);
    } catch {
      setNotice('Unable to update issue status.');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="panel-card">
        <h2>Admin access required</h2>
        <p>Only administrators can update issue status.</p>
      </div>
    );
  }

  return (
    <div className="page-panel">
      <section className="panel-card">
        <h1 className="section-title">Admin control center</h1>
        <p>Review complaints and move them through Pending → In Progress → Resolved.</p>
        {notice && <div className="success-box">{notice}</div>}
      </section>
      {loading ? (
        <div className="panel-card">Loading issue feed...</div>
      ) : (
        <div className="card-grid">
          {issues.map((issue) => (
            <div key={issue.issue_id} className="issue-card">
              <div className="card-header">
                <h3>{issue.title}</h3>
                <span className={`status-pill status-${issue.status.toLowerCase().replace(/ /g, '')}`}>{issue.status}</span>
              </div>
              <p>{issue.description}</p>
              <p><strong>Category:</strong> {issue.category}</p>
              <p><strong>Location:</strong> {issue.location}</p>
              <div className="issue-actions">
                {statusChoices.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    className="btn-secondary"
                    onClick={() => handleStatus(issue.issue_id, nextStatus)}
                    disabled={issue.status === nextStatus}
                  >
                    Mark {nextStatus}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
