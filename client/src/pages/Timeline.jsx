import { useState, useEffect } from 'react';
import { timelineApi } from '../api';
import { useLang } from '../context/LangContext';
import './Timeline.css';

const STATUS_CONFIG = {
  completed: { label: 'Completed', color: '#22C55E', bg: '#dcfce7', icon: '✓' },
  active:    { label: 'Active',    color: '#2D7FF9', bg: '#dbeafe', icon: '●' },
  upcoming:  { label: 'Upcoming',  color: '#94a3b8', bg: '#f1f5f9', icon: '○' },
};

const CATEGORY_COLORS = {
  registration: '#8b5cf6',
  voting:       '#2D7FF9',
  results:      '#22C55E',
};

function TimelineEvent({ event, index }) {
  const cfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
  const catColor = CATEGORY_COLORS[event.category] || '#94a3b8';
  const isLast = index === 999; // handled via CSS :last-child

  return (
    <div
      className={`timeline-event fade-in-up`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Vertical line + dot */}
      <div className="tl-line-col">
        <div className="tl-dot" style={{ borderColor: cfg.color, background: event.status === 'active' ? cfg.color : '#fff' }}>
          {event.status === 'completed' && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {event.status === 'active' && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'block' }} />}
        </div>
        <div className="tl-line" />
      </div>

      {/* Content card */}
      <div className={`tl-card ${event.status}`}>
        <div className="tl-card-top">
          <div className="tl-date-badge" style={{ background: catColor + '18', color: catColor }}>
            📅 {event.date}
          </div>
          <span className="tl-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        <h3 className="tl-title">{event.title}</h3>
        <p className="tl-desc">{event.description}</p>
        <div className="tl-category-tag" style={{ background: catColor + '15', color: catColor }}>
          {event.category}
        </div>
      </div>
    </div>
  );
}

export default function Timeline() {
  const { t } = useLang();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    timelineApi.getAll()
      .then(data => setEvents(data.events || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.status === filter);

  const counts = {
    completed: events.filter(e => e.status === 'completed').length,
    active:    events.filter(e => e.status === 'active').length,
    upcoming:  events.filter(e => e.status === 'upcoming').length,
  };

  return (
    <div className="timeline-page page">
      {/* Header */}
      <div className="screen-header">
        <h2>{t('electionTimeline')}</h2>
        <p>{t('keyDatesFor')}</p>
      </div>

      {/* Summary pills */}
      {!loading && (
        <div className="tl-summary">
          <div className="tl-summary-pill" style={{ background: '#dcfce7' }}>
            <span style={{ color: '#22C55E', fontWeight: 700 }}>{counts.completed}</span>
            <span style={{ color: '#16a34a', fontSize: '0.7rem' }}>Done</span>
          </div>
          <div className="tl-summary-pill" style={{ background: '#dbeafe' }}>
            <span style={{ color: '#2D7FF9', fontWeight: 700 }}>{counts.active}</span>
            <span style={{ color: '#1d4ed8', fontSize: '0.7rem' }}>Active</span>
          </div>
          <div className="tl-summary-pill" style={{ background: '#f1f5f9' }}>
            <span style={{ color: '#64748b', fontWeight: 700 }}>{counts.upcoming}</span>
            <span style={{ color: '#475569', fontSize: '0.7rem' }}>Upcoming</span>
          </div>
        </div>
      )}

      {/* Filter tabs — BUG-007: keyboard accessible with ARIA */}
      <div className="tl-filter-tabs" role="tablist" aria-label="Filter events">
        {[
          { key: 'all',       label: t('all'),       count: events.length },
          { key: 'completed', label: t('completed'), count: counts.completed },
          { key: 'active',    label: t('active'),    count: counts.active },
          { key: 'upcoming',  label: t('upcoming'),  count: counts.upcoming },
        ].map(f => (
          <button
            key={f.key}
            id={`filter-${f.key}`}
            role="tab"
            aria-selected={filter === f.key}
            className={`tl-filter-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setFilter(f.key)}
          >
            {f.label}
            {!loading && <span className="tl-filter-count">{f.count}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="timeline-list">
        {loading && (
          <div className="spinner-wrap">
            <div className="spinner" />
            <p className="text-muted text-sm">Loading timeline…</p>
          </div>
        )}
        {error && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Couldn't load timeline</h3>
            <p className="text-muted text-sm" style={{ marginTop: 6 }}>{error}</p>
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="error-state">
            <div className="error-icon">📭</div>
            <h3>No events found</h3>
            <p className="text-muted text-sm">Try a different filter</p>
          </div>
        )}
        {!loading && !error && filtered.map((event, i) => (
          <TimelineEvent key={event.id} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}
