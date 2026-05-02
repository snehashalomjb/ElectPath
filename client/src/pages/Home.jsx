import { useLang } from '../context/LangContext';
import './Home.css';

const QUICK_FACTS = [
  { emoji: '📋', key: 'fact1', en: 'Register 30 days before election' },
  { emoji: '🪪', key: 'fact2', en: 'Bring valid ID to polling place' },
  { emoji: '⏰', key: 'fact3', en: 'Polls open 7AM – 8PM on Election Day' },
];

export default function Home({ navigate }) {
  const { t } = useLang();

  const CARDS = [
    {
      id: 'learn-process',
      path: '/process',
      emoji: '🗳️',
      title: t('electionProcess'),
      desc: t('stepByStep'),
      gradient: 'linear-gradient(135deg, #2D7FF9 0%, #6366f1 100%)',
    },
    {
      id: 'ai-assistant',
      path: '/chat',
      emoji: '🤖',
      title: t('aiAssistant'),
      desc: t('askAnything'),
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    },
    {
      id: 'view-timeline',
      path: '/timeline',
      emoji: '📅',
      title: t('timelineLabel'),
      desc: t('keyDates'),
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #22C55E 100%)',
    },
    {
      id: 'my-profile',
      path: '/profile',
      emoji: '👤',
      title: t('myProfile'),
      desc: t('personalizedTips'),
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    },
    {
      id: 'election-news',
      path: '/news',
      emoji: '📰',
      title: 'Election News',
      desc: 'Latest updates & alerts',
      gradient: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
    },
    {
      id: 'election-results',
      path: '/results',
      emoji: '📊',
      title: 'Election Results',
      desc: '5 States • May 4 Counting',
      gradient: 'linear-gradient(135deg, #060d1f 0%, #1a2e6b 100%)',
    },
  ];

  return (
    <div className="home-page page">
      {/* Hero Header */}
      <header className="home-header">
        <div className="home-header-bg" />
        <div className="home-header-content">
          <div className="home-badge">
            <span>🗳️</span> Election 2026
          </div>
          <h1 className="home-title">ElectPath</h1>
          <p className="home-tagline">{t('tagline')}</p>
          <div className="home-stats">
            <div className="stat-pill">
              <span className="stat-num">5</span>
              <span className="stat-label">Steps</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-pill">
              <span className="stat-num">AI</span>
              <span className="stat-label">Powered</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-pill">
              <span className="stat-num">Free</span>
              <span className="stat-label">Always</span>
            </div>
          </div>
        </div>
      </header>

      {/* Card Grid */}
      <section className="home-section">
        <h2 className="section-title">{t('explore')}</h2>
        <div className="card-grid">
          {CARDS.map((card, i) => (
            <button
              key={card.id}
              id={card.id}
              className="home-card fade-in-up"
              style={{ background: card.gradient, animationDelay: `${i * 0.08}s` }}
              onClick={() => navigate(card.path)}
              aria-label={card.title}
            >
              <span className="home-card-emoji">{card.emoji}</span>
              <strong className="home-card-title">{card.title}</strong>
              <span className="home-card-desc">{card.desc}</span>
              <div className="home-card-arrow">→</div>
            </button>
          ))}
        </div>
      </section>

      {/* Quick Facts */}
      <section className="home-section">
        <h2 className="section-title">{t('quickFacts')}</h2>
        <div className="quick-facts">
          {QUICK_FACTS.map((f, i) => (
            <div key={f.key} className="quick-fact fade-in-up" style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
              <span className="quick-fact-emoji">{f.emoji}</span>
              <span className="quick-fact-text">{f.en}</span>
            </div>
          ))}
        </div>
      </section>

      {/* India Voter ID Banner */}
      <section className="home-section">
        <h2 className="section-title">{t('forIndianVoters')}</h2>
        <div
          id="voter-india-card"
          className="india-banner fade-in-up"
          onClick={() => navigate('/voter-india')}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate('/voter-india')}
          style={{ animationDelay: '0.4s' }}
        >
          <div className="india-banner-left">
            <div className="india-icon">🪪</div>
            <div>
              <p className="india-title">{t('getVoterId')}</p>
              <p className="india-sub">{t('applyOfficial')}</p>
            </div>
          </div>
          <div className="india-cta">
            <span>Start</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="home-section">
        <div
          className="cta-banner fade-in-up"
          style={{ animationDelay: '0.5s' }}
          onClick={() => navigate('/chat')}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate('/chat')}
        >
          <div className="cta-text">
            <p className="cta-label">{t('notSureStart')}</p>
            <p className="cta-title">{t('askAI')}</p>
          </div>
          <div className="cta-icon">🤖</div>
        </div>
      </section>

      <div style={{ height: 16 }} />
    </div>
  );
}
