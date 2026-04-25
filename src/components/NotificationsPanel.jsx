import { useApp } from '../context/AppContext';
import { useT } from '../i18n';
import { CarIcon, CreditCardIcon, BellIcon, CloseIcon } from './Icons';
import './NotificationsPanel.css';

// Per-type styling: which icon, what tint behind it
const TYPE_META = {
  ride:   { Icon: CarIcon,        bg: '#f7e3de',              color: '#e85733' },
  wallet: { Icon: CreditCardIcon, bg: 'rgba(52,199,89,0.12)', color: '#1f9b4a' },
  system: { Icon: BellIcon,       bg: '#f1f3f4',              color: '#1a1a1a' },
};

export default function NotificationsPanel() {
  const {
    notificationsOpen, setNotificationsOpen, notifications, markAllRead,
  } = useApp();
  const t = useT();

  const close = () => setNotificationsOpen(false);

  return (
    <>
      <div
        className={`np-overlay${notificationsOpen ? ' visible' : ''}`}
        onClick={close}
      />

      <aside className={`np-panel${notificationsOpen ? ' open' : ''}`}>

        {/* ── Header ──────────────────────────────────────── */}
        <div className="np-header">
          <p className="np-title">{t('notif.title')}</p>
          <div className="np-header-right">
            <button className="np-mark-read" onClick={markAllRead}>
              {t('notif.markAllRead')}
            </button>
            <button className="np-close" onClick={close} aria-label={t('common.close')}>
              <CloseIcon size={18} style={{ color: '#1a1a1a' }} />
            </button>
          </div>
        </div>

        <div className="np-divider" />

        {/* ── List ────────────────────────────────────────── */}
        <div className="np-list">
          {notifications.length === 0 ? (
            <div className="np-empty">
              <BellIcon size={36} style={{ color: '#c9c9c9' }} />
              <p>{t('notif.empty')}</p>
            </div>
          ) : (
            notifications.map((n) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.system;
              const Icon = meta.Icon;
              return (
                <button
                  key={n.id}
                  type="button"
                  className={`np-item${!n.read ? ' np-item--unread' : ''}`}
                >
                  <div className="np-icon-wrap" style={{ background: meta.bg }}>
                    <Icon size={22} style={{ color: meta.color }} />
                  </div>
                  <div className="np-body">
                    <div className="np-body-row">
                      <p className="np-item-title">{n.title}</p>
                      <p className="np-item-time">{n.time}</p>
                    </div>
                    <p className="np-item-desc">{n.desc}</p>
                  </div>
                  {!n.read && <span className="np-unread-dot" aria-hidden="true" />}
                </button>
              );
            })
          )}
        </div>

      </aside>
    </>
  );
}
