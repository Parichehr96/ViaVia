import { useApp } from '../context/AppContext';
import { useT } from '../i18n';
import { CarIcon, WalletIcon, UsersIcon } from './Icons';
import './BottomNav.css';

const TABS = [
  { id: 'home',      Icon: CarIcon,    key: 'nav.ride'      },
  { id: 'wallet',    Icon: WalletIcon, key: 'nav.wallet'    },
  { id: 'community', Icon: UsersIcon,  key: 'nav.community' },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useApp();
  const t = useT();

  return (
    <nav className="bottom-nav-blur">
      <div className="bottom-nav-wrapper">
        <div className="bottom-nav-pill">
          {TABS.map(({ id, Icon, key }) => {
            const active = activeTab === id;
            const label = t(key);
            return (
              <button
                key={id}
                className={`nav-btn${active ? ' active' : ''}`}
                onClick={() => setActiveTab(id)}
                aria-label={label}
              >
                <Icon size={24} className="nav-btn-icon" />
                <span className="nav-label">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="home-indicator" />
    </nav>
  );
}
