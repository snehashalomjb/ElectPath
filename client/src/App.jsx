import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import Splash    from './pages/Splash';
import BottomNav from './components/BottomNav';
import NotificationPanel from './components/NotificationPanel';
import ToastContainer    from './components/ToastContainer';
import LanguagePicker    from './components/LanguagePicker';

import { LangProvider,  useLang  } from './context/LangContext';
import { NotifProvider, useNotif } from './context/NotifContext';

const Home            = lazy(() => import('./pages/Home'));
const ElectionProcess = lazy(() => import('./pages/ElectionProcess'));
const Chat            = lazy(() => import('./pages/Chat'));
const Timeline        = lazy(() => import('./pages/Timeline'));
const Profile         = lazy(() => import('./pages/Profile'));
const VoterIdIndia    = lazy(() => import('./pages/VoterIdIndia'));
const News            = lazy(() => import('./pages/News'));
const BallotDemo      = lazy(() => import('./pages/BallotDemo'));
const ElectionResults = lazy(() => import('./pages/ElectionResults'));
const NotFound        = lazy(() => import('./pages/NotFound'));

/* ── Inner app (needs access to both contexts) ─────────────────────────────── */
function AppInner() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { t }     = useLang();
  const { unreadCount } = useNotif();

  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('splashShown')
  );
  const [showNotifs, setShowNotifs] = useState(false);

  const handleSplashDone = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
    document.body.classList.add('app-ready');
  };

  useEffect(() => {
    if (!showSplash) document.body.classList.add('app-ready');
  }, [showSplash]);

  // Hide notification panel when navigating
  useEffect(() => { setShowNotifs(false); }, [location.pathname]);

  const navItems = [
    { path: '/',        label: t('home'),  icon: 'home'    },
    { path: '/news',    label: 'News',     icon: 'news'    },
    { path: '/results', label: 'Results',  icon: 'results' },
    { path: '/chat',    label: t('chat'),  icon: 'chat'    },
  ];

  if (showSplash) return <Splash onDone={handleSplashDone} />;

  /* pages that show the top action bar */
  const showBar = !['/voter-india'].includes(location.pathname);

  return (
    <>
      {/* ── Global top action bar (bell + lang) ─────────────────────────── */}
      {showBar && (
        <div className="global-top-bar">
          <LanguagePicker />
          <button
            id="notif-bell-btn"
            className="notif-bell-btn"
            onClick={() => setShowNotifs(o => !o)}
            aria-label="Notifications"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="notif-bell-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── Notification slide-down panel ──────────────────────────────── */}
      {showNotifs && (
        <NotificationPanel onClose={() => setShowNotifs(false)} />
      )}

      {/* ── Page routes ────────────────────────────────────────────────── */}
      <Suspense fallback={
        <div className="page-loading">
          <div className="spinner" />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12 }}>Loading…</p>
        </div>
      }>
        <Routes>
          <Route path="/"            element={<Home navigate={navigate} />} />
          <Route path="/process"     element={<ElectionProcess />} />
          <Route path="/chat"        element={<Chat />} />
          <Route path="/timeline"    element={<Timeline />} />
          <Route path="/profile"     element={<Profile />} />
          <Route path="/voter-india" element={<VoterIdIndia />} />
          <Route path="/news"        element={<News />} />
          <Route path="/ballot"      element={<BallotDemo />} />
          <Route path="/results"     element={<ElectionResults />} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* ── Bottom navigation ──────────────────────────────────────────── */}
      <BottomNav
        items={navItems}
        currentPath={location.pathname}
        navigate={navigate}
      />

      {/* ── Toast stack ────────────────────────────────────────────────── */}
      <ToastContainer />
    </>
  );
}

/* ── Root: wrap everything in providers ─────────────────────────────────────── */
export default function App() {
  return (
    <LangProvider>
      <NotifProvider>
        <AppInner />
      </NotifProvider>
    </LangProvider>
  );
}
