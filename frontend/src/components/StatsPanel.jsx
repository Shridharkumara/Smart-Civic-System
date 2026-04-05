export default function StatsPanel({ title, value, tone = 'default' }) {
  const emojis = {
    'Total reports': '📊',
    'Pending': '⏳',
    'In progress': '🔧',
    'Resolved': '✅'
  };

  const colors = {
    default: '#0066cc',
    success: '#00a86b',
    primary: '#0066cc',
    warning: '#ff9800',
  };

  const emoji = emojis[title] || '📈';

  return (
    <div className="stats-card" style={{ 
      background: tone === 'success' 
        ? 'linear-gradient(135deg, #00a86b 0%, #008855 100%)' 
        : tone === 'warning'
        ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
        : tone === 'primary'
        ? 'linear-gradient(135deg, #0066cc 0%, #004399 100%)'
        : 'linear-gradient(135deg, #666 0%, #444 100%)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between' }}>
        <div>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', opacity: 0.9 }}>{title}</p>
          <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '700' }}>{value}</h2>
        </div>
        <div style={{ fontSize: '3rem', opacity: 0.3 }}>{emoji}</div>
      </div>
    </div>
  );
}
