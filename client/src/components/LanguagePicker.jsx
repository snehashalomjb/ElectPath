import { useState, useRef } from 'react';
import { useLang, LANGUAGES } from '../context/LangContext';
import './NotificationPanel.css'; // shares CSS

export default function LanguagePicker() {
  const { lang, changeLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // Close on outside click
  const handleBlur = () => setTimeout(() => setOpen(false), 150);

  return (
    <div className="lang-picker-wrap" ref={ref}>
      <button
        className="lang-picker-btn"
        onClick={() => setOpen(o => !o)}
        onBlur={handleBlur}
        aria-label="Select language"
        aria-expanded={open}
        id="lang-picker-btn"
      >
        <span className="lang-globe">🌐</span>
        <span>{current.native}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
        </svg>
      </button>

      {open && (
        <div className="lang-dropdown" role="listbox" aria-label="Language options">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              className={`lang-option ${lang === l.code ? 'active' : ''}`}
              role="option"
              aria-selected={lang === l.code}
              onMouseDown={() => { changeLang(l.code); setOpen(false); }}
            >
              <span>{l.native}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l.label}</span>
              {lang === l.code && <span className="lang-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
