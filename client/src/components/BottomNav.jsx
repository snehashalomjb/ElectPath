/* BottomNav.jsx */
import './BottomNav.css';

const icons = {
  home: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#2D7FF9' : 'none'}
      stroke={active ? '#2D7FF9' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  chat: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#2D7FF9' : 'none'}
      stroke={active ? '#2D7FF9' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  timeline: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#2D7FF9' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="3" cy="6"  r="1.5" fill={active ? '#2D7FF9' : '#94a3b8'}/>
      <circle cx="3" cy="12" r="1.5" fill={active ? '#2D7FF9' : '#94a3b8'}/>
      <circle cx="3" cy="18" r="1.5" fill={active ? '#2D7FF9' : '#94a3b8'}/>
    </svg>
  ),
  profile: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#2D7FF9' : 'none'}
      stroke={active ? '#2D7FF9' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  news: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#2D7FF9' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" fill={active ? '#dbeafe' : 'none'}/>
    </svg>
  ),
  ballot: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#2D7FF9' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill={active ? '#2D7FF9' : '#94a3b8'}/>
      <circle cx="8.5" cy="15.5" r="1.5" fill={active ? '#2D7FF9' : '#94a3b8'}/>
      <line x1="12" y1="8.5" x2="19" y2="8.5"/>
      <line x1="12" y1="15.5" x2="19" y2="15.5"/>
    </svg>
  ),
  results: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={active ? '#2D7FF9' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
      {active && <>
        <rect x="15" y="10" width="6" height="10" fill="#dbeafe" stroke="none" rx="1"/>
        <rect x="9"  y="4"  width="6" height="16" fill="#bfdbfe" stroke="none" rx="1"/>
        <rect x="3"  y="14" width="6" height="6"  fill="#dbeafe" stroke="none" rx="1"/>
      </>}
    </svg>
  ),
};

export default function BottomNav({ items, currentPath, navigate }) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {items.map((item) => {
        const active = currentPath === item.path ||
          (item.path !== '/' && currentPath.startsWith(item.path));
        return (
          <button
            key={item.path}
            id={`nav-${item.label.toLowerCase()}`}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            {icons[item.icon]?.(active)}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
