import { useState, useEffect } from 'react';
import './ElectionResults.css';

/* ── 2026 Assembly Election Schedule (from ECI) ─────────────────────── */
const STATES = [
  {
    id: 'assam',
    name: 'Assam',
    flag: '🏔️',
    totalSeats: 126,
    phases: [
      { phase: 1, date: 'Apr 9, 2026', constituencies: 126, turnout: 78.2, status: 'voted' },
    ],
    countingDate: 'May 4, 2026',
    status: 'counting_soon',
    exitPoll: { leading: 'BJP + Alliance', seats: '65–78', color: '#FF6B00' },
    capital: 'Dispur',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    region: 'Northeast',
  },
  {
    id: 'kerala',
    name: 'Kerala',
    flag: '🌴',
    totalSeats: 140,
    phases: [
      { phase: 1, date: 'Apr 9, 2026', constituencies: 140, turnout: 74.6, status: 'voted' },
    ],
    countingDate: 'May 4, 2026',
    status: 'counting_soon',
    exitPoll: { leading: 'LDF', seats: '80–95', color: '#EF4444' },
    capital: 'Thiruvananthapuram',
    bgColor: '#DCFCE7',
    borderColor: '#22C55E',
    region: 'South',
  },
  {
    id: 'puducherry',
    name: 'Puducherry',
    flag: '🏝️',
    totalSeats: 30,
    phases: [
      { phase: 1, date: 'Apr 9, 2026', constituencies: 30, turnout: 83.1, status: 'voted' },
    ],
    countingDate: 'May 4, 2026',
    status: 'counting_soon',
    exitPoll: { leading: 'AINRC + BJP', seats: '16–20', color: '#F97316' },
    capital: 'Puducherry',
    bgColor: '#FCE7F3',
    borderColor: '#EC4899',
    region: 'South UT',
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    flag: '🏛️',
    totalSeats: 234,
    phases: [
      { phase: 1, date: 'Apr 23, 2026', constituencies: 234, turnout: 71.3, status: 'voted' },
    ],
    countingDate: 'May 4, 2026',
    status: 'counting_soon',
    exitPoll: { leading: 'DMK Alliance', seats: '140–160', color: '#1FC6D5' },
    capital: 'Chennai',
    bgColor: '#DBEAFE',
    borderColor: '#2D7FF9',
    region: 'South',
  },
  {
    id: 'west-bengal',
    name: 'West Bengal',
    flag: '🐯',
    totalSeats: 294,
    phases: [
      { phase: 1, date: 'Apr 23, 2026', constituencies: 147, turnout: 82.4, status: 'voted' },
      { phase: 2, date: 'Apr 29, 2026', constituencies: 147, turnout: 79.4, status: 'voted' },
    ],
    countingDate: 'May 4, 2026',
    status: 'counting_soon',
    exitPoll: { leading: 'TMC', seats: '170–195', color: '#1FC6D5' },
    capital: 'Kolkata',
    bgColor: '#EDE9FE',
    borderColor: '#8B5CF6',
    region: 'East',
  },
];

const TOTAL_SEATS   = STATES.reduce((s, st) => s + st.totalSeats, 0);
const TOTAL_PHASES  = STATES.reduce((s, st) => s + st.phases.length, 0);
const COUNTING_DATE = new Date('2026-05-04T08:00:00+05:30');

function useCountdown(targetDate) {
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    const tick = () => {
      const now  = new Date();
      const diff = targetDate - now;
      if (diff <= 0) {
        setCountdown('🔢 COUNTING IN PROGRESS');
        return;
      }
      const days  = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000) / 60000);
      const secs  = Math.floor((diff % 60000) / 1000);
      setCountdown(`${days}d ${hours}h ${mins}m ${secs}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return countdown;
}

export default function ElectionResults() {
  const [expanded, setExpanded] = useState(null);
  const countdown = useCountdown(COUNTING_DATE);

  const isCountingDay = new Date() >= COUNTING_DATE;
  const totalVoters = STATES.reduce((s, st) => {
    const avgTurnout = st.phases.reduce((a, p) => a + p.turnout, 0) / st.phases.length;
    return s + Math.round(st.totalSeats * 12 * avgTurnout / 100); // approximate
  }, 0);

  return (
    <div className="results-page page">

      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <header className="results-header">
        <div className="results-header-bg" />
        <div className="results-header-content">
          <div className="results-eci-badge">
            <span>🇮🇳</span> Election Commission of India
          </div>
          <h1 className="results-main-title">Legislative Assembly</h1>
          <h1 className="results-main-title results-year">Election 2026</h1>
          <div className="results-subtitle-row">
            <span className="results-status-pill">✅ All Polling Complete</span>
            <span className="results-counting-pill">📊 Results: May 4</span>
          </div>
        </div>
      </header>

      {/* ── Countdown Banner ─────────────────────────────────────────── */}
      <div className={`countdown-banner ${isCountingDay ? 'counting-live' : ''}`}>
        <div className="countdown-left">
          <span className="countdown-icon">{isCountingDay ? '⚡' : '⏳'}</span>
          <div>
            <p className="countdown-label">
              {isCountingDay ? 'COUNTING IN PROGRESS' : 'Time Until Counting'}
            </p>
            <p className="countdown-timer">{countdown}</p>
          </div>
        </div>
        <div className="countdown-right">
          <p className="countdown-date">4th May 2026</p>
          <p className="countdown-time">8:00 AM onwards</p>
        </div>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────────── */}
      <div className="results-stats-grid">
        <div className="results-stat-card">
          <span className="results-stat-num">5</span>
          <span className="results-stat-label">States Voted</span>
        </div>
        <div className="results-stat-card">
          <span className="results-stat-num">{TOTAL_SEATS}</span>
          <span className="results-stat-label">Total Seats</span>
        </div>
        <div className="results-stat-card">
          <span className="results-stat-num">{TOTAL_PHASES}</span>
          <span className="results-stat-label">Total Phases</span>
        </div>
        <div className="results-stat-card results-stat-highlight">
          <span className="results-stat-num">~29</span>
          <span className="results-stat-label">Crore Votes Cast</span>
        </div>
      </div>

      {/* ── "29 States Voted" Waiting Banner ─────────────────────────── */}
      <div className="waiting-banner">
        <div className="waiting-banner-top">
          <span className="waiting-icon">🗳️</span>
          <div>
            <p className="waiting-title">Polling Complete — Awaiting Results</p>
            <p className="waiting-sub">
              Votes cast across <strong>5 states</strong> • Approx <strong>29 crore voters</strong> participated
            </p>
          </div>
        </div>
        <div className="waiting-progress-wrap">
          <div className="waiting-progress-labels">
            <span>Polling</span>
            <span>Counting</span>
            <span>Results</span>
          </div>
          <div className="waiting-progress-bar">
            <div className="waiting-progress-track">
              <div className="waiting-progress-fill" style={{ width: isCountingDay ? '66%' : '50%' }} />
            </div>
            {['✅', isCountingDay ? '⚡' : '⏳', '📊'].map((icon, i) => (
              <div
                key={i}
                className={`waiting-step ${i <= (isCountingDay ? 1 : 0) ? 'done' : ''}`}
                style={{ left: `${i * 50}%` }}
              >
                <span className="waiting-step-icon">{icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Schedule Table ───────────────────────────────────────────── */}
      <div className="results-section">
        <h2 className="results-section-title">📅 Election Schedule</h2>
        <div className="schedule-table">
          <div className="schedule-header-row">
            <span>STATE / UT</span>
            <span>PHASES</span>
            <span>POLLING DATES</span>
            <span>SEATS</span>
          </div>
          {STATES.map((state) => (
            <div key={state.id} className="schedule-row">
              <div className="schedule-state">
                <span>{state.flag}</span>
                <span>{state.name}</span>
              </div>
              <span className="schedule-phases">{state.phases.length}</span>
              <div className="schedule-dates">
                {state.phases.map((p, i) => (
                  <span key={i} className="schedule-date-pill">
                    {p.date.replace(', 2026', '')}
                  </span>
                ))}
              </div>
              <span className="schedule-seats">{state.totalSeats}</span>
            </div>
          ))}
          <div className="schedule-counting-row">
            <span>📊 DATE OF COUNTING</span>
            <span className="schedule-counting-date">4th MAY 2026</span>
          </div>
        </div>
      </div>

      {/* ── State Cards ──────────────────────────────────────────────── */}
      <div className="results-section">
        <h2 className="results-section-title">🗺️ State-Wise Status</h2>
        <div className="state-cards-list">
          {STATES.map((state, i) => (
            <div
              key={state.id}
              id={`state-card-${state.id}`}
              className={`state-card fade-in-up ${expanded === state.id ? 'state-card-open' : ''}`}
              style={{
                animationDelay: `${i * 0.07}s`,
                borderLeftColor: state.borderColor,
              }}
              onClick={() => setExpanded(expanded === state.id ? null : state.id)}
            >
              {/* Card top row */}
              <div className="state-card-top">
                <div className="state-flag-circle" style={{ background: state.bgColor }}>
                  <span className="state-flag-emoji">{state.flag}</span>
                </div>
                <div className="state-info">
                  <div className="state-name-row">
                    <h3 className="state-name">{state.name}</h3>
                    <span className="state-region-pill">{state.region}</span>
                  </div>
                  <div className="state-pills-row">
                    <span className="state-pill state-pill-voted">✅ Polling Done</span>
                    <span className="state-pill state-pill-waiting">⏳ Awaiting Count</span>
                  </div>
                </div>
                <span className="state-chevron">{expanded === state.id ? '▲' : '▼'}</span>
              </div>

              {/* Phase turnout mini-bar */}
              <div className="state-phase-row">
                {state.phases.map((ph, pi) => (
                  <div key={pi} className="state-phase-item">
                    <span className="state-phase-label">Phase {ph.phase} • {ph.date.replace(', 2026', '')}</span>
                    <div className="turnout-bar-wrap">
                      <div className="turnout-bar">
                        <div
                          className="turnout-fill"
                          style={{ width: `${ph.turnout}%`, background: state.borderColor }}
                        />
                      </div>
                      <span className="turnout-pct">{ph.turnout}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Expanded detail */}
              {expanded === state.id && (
                <div className="state-detail fade-in-up">
                  <div className="state-detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Capital</span>
                      <span className="detail-val">{state.capital}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total Seats</span>
                      <span className="detail-val">{state.totalSeats}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Majority Mark</span>
                      <span className="detail-val">{Math.ceil(state.totalSeats / 2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Counting</span>
                      <span className="detail-val">May 4, 2026</span>
                    </div>
                  </div>
                  {/* Exit Poll */}
                  <div className="exit-poll-box" style={{ borderColor: state.exitPoll.color + '55', background: state.exitPoll.color + '0d' }}>
                    <p className="exit-poll-label">📊 Exit Poll Projection</p>
                    <div className="exit-poll-row">
                      <span className="exit-poll-party" style={{ color: state.exitPoll.color }}>
                        {state.exitPoll.leading}
                      </span>
                      <span className="exit-poll-seats" style={{ color: state.exitPoll.color }}>
                        {state.exitPoll.seats} seats
                      </span>
                    </div>
                    <p className="exit-poll-disclaimer">*Exit polls are projections only. Actual results on May 4.</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Results Day Info ─────────────────────────────────────────── */}
      <div className="results-section">
        <div className="results-day-card">
          <div className="results-day-header">
            <span className="results-day-icon">📊</span>
            <div>
              <p className="results-day-title">How to Follow Results Live</p>
              <p className="results-day-sub">On May 4, 2026</p>
            </div>
          </div>
          <ul className="results-day-list">
            <li>Visit <strong>results.eci.gov.in</strong> from 8:00 AM</li>
            <li>Counting centers open at <strong>6:00 AM</strong></li>
            <li>Postal ballots counted <strong>first</strong></li>
            <li>Final results expected by <strong>6:00 PM</strong></li>
            <li>EVM + VVPAT verification may delay close races</li>
          </ul>
        </div>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
