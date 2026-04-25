import { useApp } from '../context/AppContext';
import { useT } from '../i18n';
import { UserIcon, BellIcon } from './Icons';
import Windmill from './Windmill';
import './Header.css';

export default function Header() {
  const { setProfileOpen, setNotificationsOpen, unreadCount, activeTab } = useApp();
  const t = useT();
  const isHome = activeTab === 'home';
  // Greet "Hi, John!" — split so we can keep the bolded name span
  const greetingParts = t('header.greeting', { name: '__NAME__' }).split('__NAME__');

  return (
    <header className={`header-pill-wrapper tab-${activeTab}${isHome ? ' home' : ''}`}>
      {/* Rotating windmill — bleeds out top-right on every tab */}
      <div className="header-windmill">
        <Windmill />
      </div>

      <div className="header-pill">
        {/* Left: avatar + name */}
        <button className="header-left" onClick={() => setProfileOpen(true)}>
          <div className="header-avatar">
            <UserIcon size={24} style={{ color: '#232d2d' }} />
          </div>
          <div className="header-name-block">
            <p className="header-name">
              {greetingParts[0]}
              <span className="header-name-bold">John</span>
              {greetingParts[1] || ''}
            </p>
            <p className="header-role">{t('header.role.driver')}</p>
          </div>
        </button>

        {/* Right: bell */}
        <button
          className="header-bell"
          onClick={() => setNotificationsOpen(true)}
          aria-label="Notifications"
        >
          {unreadCount > 0 && <span className="header-badge" />}
          <BellIcon size={24} style={{ color: '#232d2d' }} />
        </button>
      </div>

      {/* Tagline — only on Ride (home) tab; the others use the same teal hero */}
      {isHome && (
        <p className="header-tagline">{t('header.tagline')}</p>
      )}
      {!isHome && <div className="header-spacer" aria-hidden="true" />}
    </header>
  );
}
