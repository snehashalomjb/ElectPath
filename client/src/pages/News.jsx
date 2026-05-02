import { useState, useEffect, useCallback } from 'react';
import './News.css';

/* ── Fallback curated news (used if RSS fetch fails) ─────────────────── */
const FALLBACK_NEWS = [
  {
    id: 'f1',
    category: 'Elections',
    categoryColor: '#EF4444',
    headline: '🔴 COUNTING DAY: Results for 5 State Assemblies to Be Declared on 4th May',
    summary: 'The Election Commission of India will declare results for Assam, Kerala, Puducherry, Tamil Nadu, and West Bengal assembly elections on May 4, 2026. Counting begins at 8 AM sharp at designated counting centers across all states.',
    source: 'ECI Official',
    time: 'Today',
    emoji: '🗳️',
    tag: 'Breaking',
    tagColor: '#EF4444',
    link: 'https://eci.gov.in',
  },
  {
    id: 'f2',
    category: 'West Bengal',
    categoryColor: '#2D7FF9',
    headline: 'West Bengal Phase 2 Records 79.4% Voter Turnout — Exit Polls Favour TMC',
    summary: 'West Bengal Phase 2 polling on April 29 recorded a 79.4% voter turnout across 147 constituencies. Exit polls by major agencies project TMC winning 170-195 of 294 seats while BJP is projected at 75-100 seats.',
    source: 'NDTV Elections',
    time: '3 Apr 29',
    emoji: '🏛️',
    tag: 'Exit Poll',
    tagColor: '#8B5CF6',
    link: 'https://ndtv.com/elections',
  },
  {
    id: 'f3',
    category: 'Tamil Nadu',
    categoryColor: '#06B6D4',
    headline: 'Tamil Nadu Records 71% Turnout — DMK and AIADMK in Close Contest',
    summary: 'Tamil Nadu single-phase elections on April 23 recorded 71% voter turnout across all 234 constituencies. Exit polls show a close contest between the DMK alliance and AIADMK-BJP combine.',
    source: 'The Hindu',
    time: 'Apr 23',
    emoji: '📊',
    tag: 'Analysis',
    tagColor: '#06B6D4',
    link: 'https://thehindu.com',
  },
  {
    id: 'f4',
    category: 'Kerala',
    categoryColor: '#22C55E',
    headline: 'Kerala Votes 74.6% — LDF Leads in Early Exit Poll Projections',
    summary: 'Kerala recorded a healthy 74.6% voter turnout on April 9 across all 140 constituencies. The Left Democratic Front is projected to retain power with 80-95 seats while the UDF is expected to get 40-55 seats.',
    source: 'Mathrubhumi',
    time: 'Apr 9',
    emoji: '🗺️',
    tag: 'Results Soon',
    tagColor: '#22C55E',
    link: 'https://mathrubhumi.com',
  },
  {
    id: 'f5',
    category: 'Assam',
    categoryColor: '#F59E0B',
    headline: 'Assam Election: 78% Voter Turnout — BJP Alliance Strong in Exit Polls',
    summary: 'Assam went to polls on April 9 recording a strong 78% voter turnout across 126 constituencies. Exit polls project BJP-AGP-UPPL alliance winning 65-78 seats, while Congress-led opposition expected at 45-58 seats.',
    source: 'Assam Tribune',
    time: 'Apr 9',
    emoji: '🗾',
    tag: 'Results Soon',
    tagColor: '#F59E0B',
    link: 'https://assamtribune.com',
  },
  {
    id: 'f6',
    category: 'ECI Update',
    categoryColor: '#6366F1',
    headline: 'ECI Deploys 950 Counting Observers Across 5 States for May 4 Tally',
    summary: 'The Election Commission of India has deployed 950 counting observers, 5 senior IAS observers per state, and 28-layer security to counting centers. Results are expected to be fully declared by 6 PM on May 4.',
    source: 'Press Trust of India',
    time: 'May 2',
    emoji: '🔐',
    tag: 'Official',
    tagColor: '#6366F1',
    link: 'https://pib.gov.in',
  },
  {
    id: 'f7',
    category: 'Puducherry',
    categoryColor: '#EC4899',
    headline: 'Puducherry Records 83% Turnout — AINRC-BJP vs Congress-DMK Battle Ahead',
    summary: 'The Union Territory of Puducherry recorded an impressive 83% voter turnout in its 30-constituency election held on April 9. The AINRC-BJP alliance and the Congress-DMK combine are locked in a tight contest.',
    source: 'Puducherry Today',
    time: 'Apr 9',
    emoji: '🏝️',
    tag: 'Awaiting Result',
    tagColor: '#EC4899',
    link: 'https://puducherry.gov.in',
  },
  {
    id: 'f8',
    category: 'Technology',
    categoryColor: '#2D7FF9',
    headline: 'Real-Time Counting Dashboard by ECI to Go Live at 8 AM on May 4',
    summary: 'The Election Commission of India will launch a real-time results dashboard accessible at results.eci.gov.in at 8 AM on May 4. The portal will update every 30 seconds with leads and won seats across all constituencies.',
    source: 'ECI Tech Desk',
    time: 'May 2',
    emoji: '💻',
    tag: 'Technology',
    tagColor: '#2D7FF9',
    link: 'https://results.eci.gov.in',
  },
];

const CATEGORIES = ['All', 'Live', 'Elections', 'West Bengal', 'Tamil Nadu', 'Kerala', 'Assam', 'ECI Update'];

/* ── RSS sources to try (allorigins proxy) ──────────────────────────── */
const RSS_SOURCES = [
  {
    name: 'NDTV Elections',
    url: 'https://feeds.feedburner.com/ndtvnews-india-news',
    category: 'NDTV',
    color: '#EF4444',
  },
  {
    name: 'The Hindu India',
    url: 'https://www.thehindu.com/news/national/feeder/default.rss',
    category: 'The Hindu',
    color: '#1a3a6e',
  },
  {
    name: 'Times of India',
    url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
    category: 'TOI',
    color: '#c0392b',
  },
];

const CORS_PROXY = 'https://api.allorigins.win/get?url=';

function parseRssXml(xmlString, sourceName, sourceColor) {
  try {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, 'text/xml');
    const items = Array.from(xml.querySelectorAll('item')).slice(0, 6);
    return items.map((item, i) => {
      const title = item.querySelector('title')?.textContent?.trim() || '';
      const desc = item.querySelector('description')?.textContent?.trim() || '';
      const link = item.querySelector('link')?.textContent?.trim() || '#';
      const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
      let timeStr = 'Recently';
      if (pubDate) {
        try {
          const d = new Date(pubDate);
          const now = new Date();
          const diffMs = now - d;
          const diffH = Math.floor(diffMs / 3600000);
          const diffM = Math.floor(diffMs / 60000);
          if (diffM < 60) timeStr = `${diffM}m ago`;
          else if (diffH < 24) timeStr = `${diffH}h ago`;
          else timeStr = `${Math.floor(diffH / 24)}d ago`;
        } catch (_) {}
      }
      const cleanDesc = desc.replace(/<[^>]*>/g, '').slice(0, 180).trim();
      return {
        id: `rss-${sourceName}-${i}`,
        category: sourceName,
        categoryColor: sourceColor,
        headline: title,
        summary: cleanDesc || title,
        source: sourceName,
        time: timeStr,
        emoji: '📡',
        tag: 'Live',
        tagColor: '#EF4444',
        link,
        isLive: true,
      };
    });
  } catch (_) {
    return [];
  }
}

async function fetchRssSource(source) {
  const proxyUrl = CORS_PROXY + encodeURIComponent(source.url);
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
  const data = await res.json();
  return parseRssXml(data.contents, source.name, source.color);
}

/* ── Skeleton card ──────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="news-skeleton">
      <div className="skel skel-icon" />
      <div className="skel-body">
        <div className="skel skel-tag" />
        <div className="skel skel-line skel-line-long" />
        <div className="skel skel-line skel-line-short" />
      </div>
    </div>
  );
}

export default function News() {
  const [filter, setFilter]       = useState('All');
  const [expanded, setExpanded]   = useState(null);
  const [liveNews, setLiveNews]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fetchedLive, setFetchedLive] = useState(false);

  const fetchAllNews = useCallback(async () => {
    setLoading(true);
    try {
      // Try all RSS sources in parallel
      const results = await Promise.allSettled(
        RSS_SOURCES.map(s => fetchRssSource(s))
      );
      const allItems = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

      if (allItems.length > 0) {
        setLiveNews(allItems);
        setFetchedLive(true);
        setLastUpdated(new Date());
      } else {
        setFetchedLive(false);
      }
    } catch (_) {
      setFetchedLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllNews();
    // Auto-refresh every 5 minutes
    const timer = setInterval(fetchAllNews, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [fetchAllNews]);

  // Merge live + fallback
  const allNews = fetchedLive
    ? [...liveNews, ...FALLBACK_NEWS]
    : FALLBACK_NEWS;

  const filtered = filter === 'All'
    ? allNews
    : filter === 'Live'
      ? allNews.filter(n => n.isLive)
      : allNews.filter(n => n.category === filter);

  const tickerItems = allNews.slice(0, 6);

  return (
    <div className="news-page page">
      {/* Header */}
      <header className="news-header">
        <div className="news-header-bg" />
        <div className="news-header-content">
          <div className="news-header-top-row">
            <div className="news-badge">📰 Real-Time News</div>
            {fetchedLive && <span className="news-live-dot">🔴 LIVE</span>}
          </div>
          <h1 className="news-title">Election News</h1>
          <p className="news-subtitle">Live updates on India's 2026 State Elections</p>
          {lastUpdated && (
            <p className="news-updated">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </header>

      {/* Counting Day Alert Banner */}
      <div className="counting-alert-banner">
        <span className="counting-alert-icon">⚡</span>
        <span className="counting-alert-text">
          <strong>COUNTING DAY: 4th May 2026</strong> — Results declared from 8 AM
        </span>
        <span className="counting-alert-pulse" />
      </div>

      {/* Refresh + Status Row */}
      <div className="news-meta-bar">
        <span className="news-meta-count">
          {allNews.length} articles {fetchedLive ? '• Live feed active' : '• Curated news'}
        </span>
        <button
          id="refresh-news-btn"
          className={`news-refresh-btn ${loading ? 'spinning' : ''}`}
          onClick={fetchAllNews}
          disabled={loading}
          aria-label="Refresh news"
        >
          ↻ {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Category Filter */}
      <div className="news-filter-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`news-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            className={`news-filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'Live' ? '🔴 ' : ''}{cat}
          </button>
        ))}
      </div>

      {/* Breaking ticker */}
      <div className="news-ticker">
        <span className="ticker-label">🔴 LIVE</span>
        <div className="ticker-track">
          <div className="ticker-content">
            {tickerItems.map((n) => (
              <span key={n.id}>{n.headline}&nbsp;&nbsp;•&nbsp;&nbsp;</span>
            ))}
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="news-list">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length === 0
            ? (
              <div className="news-empty">
                <span>🔍</span>
                <p>No articles found for this filter</p>
              </div>
            )
            : filtered.map((item, i) => (
              <article
                key={item.id}
                id={item.id}
                className={`news-card fade-in-up ${expanded === item.id ? 'news-card-open' : ''} ${item.isLive ? 'news-card-live' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <div className="news-card-header">
                  <div className="news-emoji-wrap">
                    <span className="news-emoji">{item.emoji}</span>
                    {item.isLive && <span className="live-badge-dot" />}
                  </div>
                  <div className="news-meta">
                    <div className="news-meta-row">
                      <span
                        className="news-category"
                        style={{ color: item.categoryColor, background: item.categoryColor + '18' }}
                      >
                        {item.category}
                      </span>
                      <span
                        className="news-tag"
                        style={{ background: item.tagColor + '20', color: item.tagColor }}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <p className="news-headline">{item.headline}</p>
                    <div className="news-footer-row">
                      <span className="news-source">📡 {item.source}</span>
                      <span className="news-time">🕐 {item.time}</span>
                    </div>
                  </div>
                </div>

                {expanded === item.id && (
                  <div className="news-summary fade-in-up">
                    <p>{item.summary}</p>
                    <div className="news-read-more">
                      {item.link && item.link !== '#' && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="news-link-btn"
                          onClick={e => e.stopPropagation()}
                        >
                          🔗 Read Full Article
                        </a>
                      )}
                      <button
                        className="news-share-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.share?.({ title: item.headline, text: item.summary, url: item.link }).catch(() => {});
                        }}
                        aria-label="Share news"
                      >
                        ↗ Share
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))
        }
      </div>

      {/* Disclaimer */}
      <div className="news-disclaimer">
        <p>📌 Live news via public RSS feeds. For official results visit <strong>results.eci.gov.in</strong></p>
      </div>

      <div style={{ height: 24 }} />
    </div>
  );
}
