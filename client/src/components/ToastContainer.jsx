import { useNotif } from '../context/NotifContext';
import './NotificationPanel.css'; // shares CSS

export default function ToastContainer() {
  const { toasts, dismissToast } = useNotif();
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.toastId} className="toast">
          <span className="toast-icon">{t.icon}</span>
          <div className="toast-body">
            <p className="toast-title">{t.title}</p>
            <p className="toast-desc">{t.body}</p>
          </div>
          <button
            className="toast-close"
            onClick={() => dismissToast(t.toastId)}
            aria-label="Dismiss"
          >✕</button>
        </div>
      ))}
    </div>
  );
}
