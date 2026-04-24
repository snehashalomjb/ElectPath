import { useEffect, useState } from 'react';
import './Splash.css';

const FACTS = [
  'Every vote counts. Make yours matter.',
  'Democracy works when citizens participate.',
  'Know your rights. Know your process.',
  'Your voice shapes the future.',
];

export default function Splash({ onDone }) {
  const [phase, setPhase] = useState('enter');   // enter → show → exit
  const [factIdx] = useState(() => Math.floor(Math.random() * FACTS.length));
  const [progress, setProgress] = useState(0);
  const [counter, setCounter] = useState(0);

  // Progress bar animation
  useEffect(() => {
    const start = Date.now();
    const duration = 3000;
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      setCounter(Math.floor(pct));
      if (pct >= 100) clearInterval(tick);
    }, 16);
    return () => clearInterval(tick);
  }, []);

  // Phase sequence
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 3200);
    const t3 = setTimeout(() => onDone(), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`splash-root ${phase}`}>
      {/* Animated background orbs */}
      <div className="splash-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="grid-overlay" />
      </div>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${10 + (i * 7.5) % 85}%`,
          animationDelay: `${i * 0.2}s`,
          animationDuration: `${3 + (i % 3)}s`,
          width: `${4 + (i % 3) * 3}px`,
          height: `${4 + (i % 3) * 3}px`,
          opacity: 0.15 + (i % 4) * 0.08,
        }} />
      ))}

      {/* Main content */}
      <div className="splash-content">

        {/* Logo / Icon */}
        <div className="splash-icon-wrap">
          <div className="splash-icon-ring" />
          <div className="splash-icon-ring ring-2" />
          <div className="splash-icon">
            <span>🗳️</span>
          </div>
        </div>

        {/* Brand name */}
        <div className="splash-brand">
          <h1 className="splash-title">
            {'ElectPath'.split('').map((ch, i) => (
              <span key={i} className="splash-letter" style={{ animationDelay: `${0.4 + i * 0.06}s` }}>
                {ch}
              </span>
            ))}
          </h1>
          <p className="splash-tagline">Your guide through every step of voting</p>
        </div>

        {/* Animated feature pills */}
        <div className="splash-pills">
          {[
            { icon: '🤖', label: 'AI Powered' },
            { icon: '🗳️', label: 'Election Guide' },
            { icon: '📅', label: 'Live Timeline' },
          ].map((p, i) => (
            <div key={i} className="splash-pill" style={{ animationDelay: `${0.9 + i * 0.15}s` }}>
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Random civic fact */}
        <div className="splash-fact">
          <p>"{FACTS[factIdx]}"</p>
        </div>

        {/* Progress */}
        <div className="splash-loader">
          <div className="splash-progress-track">
            <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="splash-loader-row">
            <span className="splash-loading-text">Loading your experience…</span>
            <span className="splash-counter">{counter}%</span>
          </div>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="splash-footer">
        <span>Powered by</span>
        <span className="splash-footer-brand">OpenAI + React</span>
      </div>
    </div>
  );
}
