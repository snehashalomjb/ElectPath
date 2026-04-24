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
