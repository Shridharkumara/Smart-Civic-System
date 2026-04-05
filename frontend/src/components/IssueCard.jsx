export default function IssueCard({ issue, onVote, user }) {
  const statusClass = issue.status.toLowerCase().replace(/ /g, '');
  const statusEmoji = {
    pending: '⏳',
    inprogress: '🔨',
    resolved: '✅'
  }[statusClass] || '📍';

  const categoryEmoji = {
    Roads: '🛣️',
    Garbage: '🗑️',
    Water: '💧',
    Electric: '⚡',
    Safety: '🚨'
  }[issue.category] || '📌';

  return (
    <article className="issue-card">
      {issue.image_data && <img src={issue.image_data} alt={issue.title} />}
      {issue.video_data && <video src={issue.video_data} controls style={{ borderRadius: '8px' }} />}
      
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', lineHeight: '1.3' }}>{issue.title}</h3>
          <span className={`status-pill status-${statusClass}`}>{statusEmoji} {issue.status}</span>
        </div>
        
        <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: '#555' }}>
          {issue.description.substring(0, 120)}
          {issue.description.length > 120 ? '...' : ''}
        </p>

        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
          <p style={{ margin: 0 }}><span style={{ fontWeight: 'bold' }}>{categoryEmoji} Category:</span> {issue.category}</p>
          <p style={{ margin: 0 }}><span style={{ fontWeight: 'bold' }}>📍 Location:</span> {issue.location}</p>
          <p style={{ margin: 0 }}><span style={{ fontWeight: 'bold' }}>👤 Reported by:</span> {issue.author?.name || 'Community Member'}</p>
        </div>

        {onVote && (
          <div className="issue-actions">
            <button 
              className="btn-secondary" 
              onClick={() => onVote(issue.issue_id)}
              title={user ? 'Click to upvote' : 'Sign in to vote'}
            >
              👍 Upvote ({issue.votes || 0})
            </button>
            {!user && <span style={{ fontSize: '0.85rem', color: '#999' }}>Sign in to vote</span>}
          </div>
        )}
      </div>
    </article>
  );
}
