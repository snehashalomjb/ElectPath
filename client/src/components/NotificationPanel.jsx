import { useState } from 'react';
import { useNotif } from '../context/NotifContext';
import { useLang } from '../context/LangContext';
import './NotificationPanel.css';

const URGENCY_STYLES = {
  critical: { border: '#ef4444', bg: '#fff5f5', badge: '#ef4444', badgeBg: '#fee2e2', label: 'Tomorrow!' },
  high:     { border: '#f97316', bg: '#fff7ed', badge: '#f97316', badgeBg: '#ffedd5', label: 'This week' },
  medium:   { border: '#2D7FF9', bg: '#eff6ff', badge: '#2D7FF9', badgeBg: '#dbeafe', label: 'Soon' },
  info:     { border: '#e2e8f0', bg: '#f8fafc', badge: '#64748b', badgeBg: '#f1f5f9', label: 'Upcoming' },
  done:     { border: '#22c55e', bg: '#f0fdf4', badge: '#22c55e', badgeBg: '#dcfce7', label: 'Today!' },
};

function NotifItem({ notif, onRead }) {
  const { t } = useLang();
  const sty = URGENCY_STYLES[notif.urgency] || URGENCY_STYLES.info;
  const dLabel = notif.daysLeft === 0
    ? t('today')
    : notif.daysLeft === 1
    ? t('tomorrow')
    : `${notif.daysLeft} ${t('daysLeft')}`;

  return (
    <div
      className={`notif-item ${notif.read ? 'notif-read' : 'notif-unread'} fade-in-up`}
      style={{ borderLeftColor: sty.border, background: notif.read ? '#f8fafc' : sty.bg }}
      onClick={() => onRead(notif.id)}
      role="button"
      tabIndex={0}
    >
      <div className="notif-icon">{notif.icon}</div>
      <div className="notif-body">
        <div className="notif-top">
          <span className="notif-title">{notif.title}</span>
          {!notif.read && <span className="notif-dot" />}
        </div>
        <p className="notif-desc">{notif.body}</p>
        <div className="notif-meta">
          <span className="notif-date">📅 {notif.date}</span>
          <span className="notif-badge" style={{ color: sty.badge, background: sty.badgeBg }}>
            {dLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function NotificationPanel({ onClose }) {
  const { notifications, markRead, markAllRead } = useNotif();
  const { t } = useLang();
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="notif-panel fade-in" role="dialog" aria-label="Notifications">
      {/* Header */}
      <div className="notif-header">
        <div className="notif-header-left">
          <span className="notif-header-title">{t('notifications')}</span>
          {unread > 0 && <span className="notif-badge-count">{unread}</span>}
        </div>
        <div className="notif-header-actions">
          {unread > 0 && (
            <button className="notif-mark-all" onClick={markAllRead}>
              {t('markAllRead')}
            </button>
          )}
          <button className="notif-close-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <span className="notif-empty-icon">🔔</span>
            <p>{t('noNotifications')}</p>
          </div>
        ) : (
          notifications.map(n => (
            <NotifItem key={n.id} notif={n} onRead={markRead} />
          ))
        )}
      </div>
    </div>
  );
}
