import { useRef, useCallback, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { I18nProvider } from './i18n';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ProfilePanel from './components/ProfilePanel';
import NotificationsPanel from './components/NotificationsPanel';
import HomeScreen from './screens/HomeScreen';
import CommunityScreen from './screens/CommunityScreen';
import WalletScreen from './screens/WalletScreen';
import RideRequestScreen from './screens/RideRequestScreen';
import RideDetailSheet from './screens/RideDetailSheet';
import PassengerRideScreen from './screens/PassengerRideScreen';
import DriverRideScreen from './screens/DriverRideScreen';
import RideChatSheet from './screens/RideChatSheet';
import CallScreen from './screens/CallScreen';
import './index.css';

// ── Status Toast ─────────────────────────────────────────────────────────────
function StatusToast() {
  const { statusToast, clearStatusToast } = useApp();

  useEffect(() => {
    if (!statusToast) return;
    const id = setTimeout(clearStatusToast, 4000);
    return () => clearTimeout(id);
  }, [statusToast, clearStatusToast]);

  if (!statusToast) return null;

  return (
    <div className="ride-toast">
      <div className="ride-toast-content">
        <div className="ride-toast-icon">{statusToast.icon}</div>
        <div className="ride-toast-text">
          <p className="ride-toast-title">{statusToast.message}</p>
        </div>
      </div>
    </div>
  );
}

// ── Ride Toast ───────────────────────────────────────────────────────────────
function RideToast() {
  const { rideToast, clearRideToast } = useApp();

  // Auto-dismiss after 4 s
  useEffect(() => {
    if (!rideToast) return;
    const id = setTimeout(clearRideToast, 4000);
    return () => clearTimeout(id);
  }, [rideToast, clearRideToast]);

  if (!rideToast) return null;

  return (
    <div className="ride-toast">
      <div className="ride-toast-content">
        <div className="ride-toast-icon">✓</div>
        <div className="ride-toast-text">
          <p className="ride-toast-title">Ride request submitted successfully</p>
          <p className="ride-toast-sub">
            We'll let you know when someone accepts your ride.
          </p>
        </div>
      </div>
    </div>
  );
}

// Tab order for swipe navigation
const TABS = ['home', 'wallet', 'community'];

// Minimum horizontal distance (px) to register as a swipe
const SWIPE_THRESHOLD = 48;
// Maximum vertical drift allowed — keeps swipe distinct from scrolling
const SWIPE_VERTICAL_LIMIT = 80;

function AppShell() {
  const { activeTab, setActiveTab, profileOpen, notificationsOpen } = useApp();

  const touchStart  = useRef(null);   // { x, y }
  const touchActive = useRef(false);  // guard against phantom events

  const handleTouchStart = useCallback((e) => {
    // Don't intercept if a panel is open
    if (profileOpen || notificationsOpen) return;
    const t = e.touches[0];
    touchStart.current  = { x: t.clientX, y: t.clientY };
    touchActive.current = true;
  }, [profileOpen, notificationsOpen]);

  const handleTouchEnd = useCallback((e) => {
    if (!touchActive.current || !touchStart.current) return;
    touchActive.current = false;

    const t   = e.changedTouches[0];
    const dx  = t.clientX - touchStart.current.x;
    const dy  = t.clientY - touchStart.current.y;
    touchStart.current = null;

    // Ignore if movement is too vertical (user is scrolling)
    if (Math.abs(dy) > SWIPE_VERTICAL_LIMIT) return;
    // Ignore if not far enough horizontally
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    const idx     = TABS.indexOf(activeTab);
    const nextIdx = dx < 0
      ? Math.min(idx + 1, TABS.length - 1)   // swipe left  → next tab
      : Math.max(idx - 1, 0);                 // swipe right → prev tab

    if (nextIdx !== idx) setActiveTab(TABS[nextIdx]);
  }, [activeTab, setActiveTab, profileOpen, notificationsOpen]);

  return (
    <div className="app-shell">
      <Header />

      {/*
        All three screens are always mounted and stacked via position:absolute.
        Only the active one is opacity:1 / pointer-events:all.
        Header and BottomNav never move — only the content cross-fades.
        Touch handlers on this wrapper enable swipe-to-navigate.
      */}
      <main
        className="tab-main"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`tab-screen${activeTab === 'home'      ? ' tab-active' : ''}`}>
          <HomeScreen />
        </div>
        <div className={`tab-screen${activeTab === 'wallet'    ? ' tab-active' : ''}`}>
          <WalletScreen />
        </div>
        <div className={`tab-screen${activeTab === 'community' ? ' tab-active' : ''}`}>
          <CommunityScreen />
        </div>
      </main>

      <BottomNav />

      <ProfilePanel />
      <NotificationsPanel />
      <RideRequestScreen />
      <RideDetailSheet />
      <PassengerRideScreen />
      <DriverRideScreen />
      <RideChatSheet />
      <CallScreen />
      <RideToast />
      <StatusToast />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </I18nProvider>
  );
}
