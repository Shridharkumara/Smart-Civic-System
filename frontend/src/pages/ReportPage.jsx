import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createIssue } from '../api';

const categories = ['Roads', 'Garbage', 'Water', 'Electric', 'Safety'];

export default function ReportPage({ user }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Roads');
  const [location, setLocation] = useState('Downtown');
  const [imageData, setImageData] = useState('');
  const [videoData, setVideoData] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (file.type.startsWith('image/')) {
        setImageData(reader.result);
        setVideoData('');
        setMediaType('image');
      } else if (file.type.startsWith('video/')) {
        setVideoData(reader.result);
        setImageData('');
        setMediaType('video');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      const confirmed = window.confirm('You must sign in to report issues. Go to Sign in page?');
      if (confirmed) navigate('/login');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const payload = { title, description, category, location };
      if (mediaType === 'image' && imageData) payload.imageData = imageData;
      if (mediaType === 'video' && videoData) payload.videoData = videoData;
      await createIssue(payload);
      setSuccess('✅ Your issue has been successfully submitted! Thank you for reporting.');
      setTitle('');
      setDescription('');
      setLocation('Downtown');
      setImageData('');
      setVideoData('');
      setTimeout(() => navigate('/issues'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-panel">
      <section className="report-card">
        <h1 className="section-title">📢 Report a Local Issue</h1>
        <p>Help improve your community by reporting problems. Include photos or videos for faster resolution.</p>
        
        {!user && (
          <div className="warning-box" style={{ marginBottom: '1.5rem' }}>
            <strong>📝 Sign in to report issues</strong>
            <p style={{ margin: '0.5rem 0 0 0' }}>You must create an account to submit reports. <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign in now</Link></p>
          </div>
        )}

        {success && <div className="success-box" style={{ marginBottom: '1.5rem' }}>{success}</div>}
        {error && <div className="error-box" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="form-row">
          <div className="form-group">
            <label>📌 Issue Title</label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Pothole on Main Street" 
              required 
              disabled={!user}
            />
          </div>

          <div className="form-group">
            <label>📝 Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe the issue in detail. What is happening? Who is affected?" 
              required 
              disabled={!user}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>🏷️ Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={!user}>
                {categories.map((option) => (<option key={option} value={option}>{option}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label>📍 Location</label>
              <input 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g., 123 Main St, Downtown" 
                required 
                disabled={!user}
              />
            </div>
          </div>

          <div className="form-group">
            <label>📸 Photo or Video (Optional)</label>
            <input type="file" accept="image/*,video/*" onChange={handleFile} disabled={!user} />
            {imageData && <img src={imageData} alt="Selected" style={{ borderRadius: '8px', maxWidth: '100%', marginTop: '1rem', maxHeight: '300px', objectFit: 'cover' }} />}
            {videoData && <video src={videoData} controls style={{ borderRadius: '8px', maxWidth: '100%', marginTop: '1rem', maxHeight: '300px' }} />}
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !user}>
            {loading ? '⏳ Submitting...' : user ? '✉️ Submit Issue' : '🔒 Sign in to Report'}
          </button>
        </form>
      </section>

      <section className="panel-card">
        <h2>📍 Location Preview</h2>
        <p>Enter a location to preview it on the map. This helps authorities find and fix the issue faster.</p>
        <iframe
          title="map-preview"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
          style={{ width: '100%', minHeight: 350, borderRadius: 8, border: 'none', marginTop: '1rem' }}
        />
      </section>

      <section className="panel-card" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #e0e8f0 100%)' }}>
        <h2>💡 Tips for Effective Reports</h2>
        <ul style={{ lineHeight: '2', color: '#333' }}>
          <li><strong>Be specific:</strong> Include exact location, date, and time if possible</li>
          <li><strong>Add photos:</strong> Visual evidence speeds up resolution and helps authorities assess severity</li>
          <li><strong>Stay factual:</strong> Describe what you observe, not opinions</li>
          <li><strong>Include impact:</strong> Explain how this issue affects the community</li>
          <li><strong>Track progress:</strong> Come back to vote and follow updates on your reported issues</li>
        </ul>
      </section>
    </div>
  );
}
