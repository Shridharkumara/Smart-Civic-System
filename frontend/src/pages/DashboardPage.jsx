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

  return (
    <div className="page-panel">
      <section className="panel-card">
        <h1 className="section-title">Your issue dashboard</h1>
        <p>Track every complaint you raised and get real-time visibility into progress.</p>
      </section>
      {loading ? (
        <div className="panel-card">Loading your issues...</div>
      ) : issues.length === 0 ? (
        <div className="panel-card">You have not submitted any issues yet.</div>
      ) : (
        <div className="card-grid">
          {issues.map((issue) => (
            <IssueCard key={issue.issue_id} issue={issue} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
