import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

// Splash & BottomNav are NOT lazy — must be available instantly
import Splash   from './pages/Splash';
import BottomNav from './components/BottomNav';

// Code-split all pages for faster initial load
const Home            = lazy(() => import('./pages/Home'));
const ElectionProcess = lazy(() => import('./pages/ElectionProcess'));
const Chat            = lazy(() => import('./pages/Chat'));
const Timeline        = lazy(() => import('./pages/Timeline'));
const Profile         = lazy(() => import('./pages/Profile'));
const VoterIdIndia    = lazy(() => import('./pages/VoterIdIndia'));
const NotFound        = lazy(() => import('./pages/NotFound'));

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(() =>
    !sessionStorage.getItem('splashShown')
  );

  const handleSplashDone = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
    document.body.classList.add('app-ready');
  };

  useEffect(() => {
    if (!showSplash) document.body.classList.add('app-ready');
  }, [showSplash]);

  const navItems = [
    { path: '/',         label: 'Home',     icon: 'home'     },
    { path: '/chat',     label: 'Chat',     icon: 'chat'     },
    { path: '/timeline', label: 'Timeline', icon: 'timeline' },
    { path: '/profile',  label: 'Profile',  icon: 'profile'  },
  ];

  if (showSplash) return <Splash onDone={handleSplashDone} />;

  return (
    <>
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
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </Suspense>
      <BottomNav
        items={navItems}
        currentPath={location.pathname}
        navigate={navigate}
      />
    </>
  );
}
