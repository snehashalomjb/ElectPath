import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { processApi } from '../api';
import './ElectionProcess.css';

const STEP_ICONS = ['✅', '🪪', '📢', '🗳️', '📊'];

function StepCard({ step, index, isOpen, onToggle }) {
  return (
    <div
      className={`step-card fade-in-up ${isOpen ? 'step-open' : ''}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Connector line */}
      {index > 0 && <div className="step-connector" />}

      <button
        id={`step-${step.stepNumber}`}
        className="step-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="step-number-wrap">
          <div className={`step-circle ${isOpen ? 'active' : ''}`}>
            {isOpen ? '✓' : step.stepNumber}
          </div>
        </div>
        <div className="step-header-text">
          <span className="step-emoji">{STEP_ICONS[index]}</span>
          <span className="step-title">{step.title}</span>
        </div>
        <div className={`step-chevron ${isOpen ? 'open' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="step-body fade-in">
          <p className="step-desc">{step.description}</p>

          <div className="step-section">
            <div className="step-section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#2D7FF9" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              What you should do
            </div>
            <p className="step-what">{step.whatYouShouldDo}</p>
          </div>

          <div className="step-section">
            <div className="step-section-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Action Tips
            </div>
            <ul className="step-actions">
              {step.actions.map((action, i) => (
                <li key={i} className="step-action-item">
                  <span className="step-action-dot" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ElectionProcess() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openStep, setOpenStep] = useState(0);

  useEffect(() => {
    processApi.getAll()
      .then(data => setSteps(data.steps || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="process-page page">
      {/* Header */}
      <div className="screen-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="back-btn" onClick={() => navigate('/')} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h2>Election Process</h2>
            <p>5 steps to civic participation</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {!loading && steps.length > 0 && (
        <div className="progress-strip">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${((openStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">Step {openStep + 1} of {steps.length}</span>
        </div>
      )}

      <div className="process-list">
        {loading && (
          <div className="spinner-wrap">
            <div className="spinner" />
            <p className="text-muted text-sm">Loading steps…</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Could not load steps</h3>
            <p className="text-muted text-sm" style={{ marginTop: 6 }}>{error}</p>
          </div>
        )}

        {!loading && !error && steps.map((step, i) => (
          <StepCard
            key={step.stepNumber}
            step={step}
            index={i}
            isOpen={openStep === i}
            onToggle={() => {
              setOpenStep(openStep === i ? -1 : i);
            }}
          />
        ))}
      </div>
    </div>
  );
}
