import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import ElectionProcess from './pages/ElectionProcess';
import Chat from './pages/Chat';
import Timeline from './pages/Timeline';
import Profile from './pages/Profile';
import Splash from './pages/Splash';
import VoterIdIndia from './pages/VoterIdIndia';
import BottomNav from './components/BottomNav';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only once per session
    return !sessionStorage.getItem('splashShown');
  });

  const handleSplashDone = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
    document.body.classList.add('app-ready');
  };

  // If no splash, ensure body class is correct
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
      <Routes>
        <Route path="/"            element={<Home     navigate={navigate} />} />
        <Route path="/process"     element={<ElectionProcess />} />
        <Route path="/chat"        element={<Chat />} />
        <Route path="/timeline"    element={<Timeline />} />
        <Route path="/profile"     element={<Profile />} />
        <Route path="/voter-india" element={<VoterIdIndia />} />
      </Routes>
      <BottomNav
        items={navItems}
        currentPath={location.pathname}
        navigate={navigate}
      />
    </>
  );
}
