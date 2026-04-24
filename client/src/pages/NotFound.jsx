import { useNavigate } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="nf-page">
      <div className="nf-content fade-in-up">
        <div className="nf-emoji">🗳️</div>
        <h1 className="nf-code">404</h1>
        <h2 className="nf-title">Page Not Found</h2>
        <p className="nf-sub">This page doesn't exist — but your vote does!</p>
        <div className="nf-actions">
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            🏠 Back to Home
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/chat')}>
            🤖 Ask AI Assistant
          </button>
        </div>
      </div>
    </div>
  );
}
