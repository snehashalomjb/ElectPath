import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// ── Hardcoded upcoming election events that trigger alerts ────────────────────
const ELECTION_ALERTS = [
  {
    id: 'ea-1', icon: '📋',
    title: 'Voter Registration Deadline',
    body: 'Last day to register for the 2026 General Election.',
    date: '2026-05-10', category: 'registration', priority: 'high',
  },
  {
    id: 'ea-2', icon: '🗳️',
    title: 'Early Voting Begins',
    body: 'In-person early voting opens across all districts.',
    date: '2026-05-20', category: 'voting', priority: 'medium',
  },
  {
    id: 'ea-3', icon: '📅',
    title: 'Election Day',
    body: 'General Election Day — polls open 7 AM to 8 PM.',
    date: '2026-06-05', category: 'voting', priority: 'high',
  },
  {
    id: 'ea-4', icon: '📬',
    title: 'Mail-in Ballot Deadline',
    body: 'Last day to request a mail-in / absentee ballot.',
    date: '2026-05-25', category: 'registration', priority: 'medium',
  },
  {
    id: 'ea-5', icon: '🏛️',
    title: 'Lok Sabha Session Opens',
    body: 'First session of the newly elected Lok Sabha begins.',
    date: '2026-06-15', category: 'results', priority: 'low',
  },
  {
    id: 'ea-6', icon: '📊',
    title: 'Results Day',
    body: 'Official election results announced by the Election Commission.',
    date: '2026-06-08', category: 'results', priority: 'high',
  },
];

/** Days until a date string "YYYY-MM-DD" */
function daysUntil(dateStr) {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / 86400000);
}

function buildNotifications(readIds) {
  return ELECTION_ALERTS
    .map(a => {
      const d = daysUntil(a.date);
      let urgency = 'info';
      if (d <= 0) urgency = 'done';
      else if (d === 1) urgency = 'critical';
      else if (d <= 3) urgency = 'high';
      else if (d <= 7) urgency = 'medium';
      return { ...a, daysLeft: d, urgency, read: readIds.includes(a.id) };
    })
    .filter(a => a.daysLeft >= 0)   // don't show past events
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

// ── Toast queue ───────────────────────────────────────────────────────────────
let toastCounter = 0;

const NotifContext = createContext(null);

export function NotifProvider({ children }) {
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('electpath_read_notifs') || '[]'); } catch { return []; }
  });
  const [toasts, setToasts] = useState([]);
  const shownRef = useRef(false);

  // Derive notifications from ELECTION_ALERTS + readIds
  const notifications = buildNotifications(readIds);
  const unreadCount   = notifications.filter(n => !n.read).length;

  // On first load, show toast for the nearest upcoming event (if not read)
  useEffect(() => {
    if (shownRef.current) return;
    shownRef.current = true;
    const first = notifications.find(n => !n.read && n.daysLeft <= 7);
    if (first) {
      setTimeout(() => addToast(first), 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = useCallback((id) => {
    setReadIds(prev => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try { localStorage.setItem('electpath_read_notifs', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    const all = ELECTION_ALERTS.map(a => a.id);
    setReadIds(all);
    try { localStorage.setItem('electpath_read_notifs', JSON.stringify(all)); } catch {}
  }, []);

  const addToast = useCallback((notif) => {
    const id = ++toastCounter;
    setToasts(prev => [...prev, { ...notif, toastId: id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.toastId !== id)), 5000);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  }, []);

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, toasts, dismissToast, addToast }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotif = () => useContext(NotifContext);
