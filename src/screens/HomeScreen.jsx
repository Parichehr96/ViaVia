import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';
import { CarIcon, PhoneIcon, ClockIcon, VerifiedIcon } from '../components/Icons';
import emptyStateIllustration from '../assets/empty-state-carpool.png';
import './HomeScreen.css';

// Profile-photo avatar (img → initials fallback). Same pattern as Community.
function RideAvatar({ name, photo, initials, size = 41 }) {
  const [failed, setFailed] = useState(false);
  const url = photo
    || `https://i.pravatar.cc/120?u=viavia-${(name || 'r').toLowerCase().replace(/\s+/g, '-')}`;
  if (!failed) {
    return (
      <img
        src={url}
        alt={name}
        className="hs-ride-avatar-img"
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className="hs-ride-avatar-fallback"
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {initials || '?'}
    </div>
  );
}

// ── Ride card — Figma 83:20748 ──────────────────────────────────
function RideCard({ ride, onMoreInfo }) {
  return (
    <div className="hs-ride-card">
      {/* Date/time header */}
      <div className="hs-ride-header">
        <ClockIcon size={24} style={{ color: '#1e1e1e' }} />
        <p className="hs-ride-when">{ride.when || '14:15, Today'}</p>
      </div>

      <div className="hs-ride-divider" />

      {/* User row */}
      <div className="hs-ride-user">
        <RideAvatar name={ride.name} photo={ride.photo} initials={ride.initials} />
        <div className="hs-ride-user-info">
          <div className="hs-ride-name-row">
            <span className="hs-ride-name">{ride.name}</span>
            {ride.verified && (
              <VerifiedIcon size={16} style={{ color: '#ff6038' }} />
            )}
          </div>
          <div className="hs-ride-mutuals">
            <span className="hs-mutual-dots">
              <span /><span /><span />
            </span>
            <span className="hs-mutual-text">
              {ride.communities ? `${ride.communities} mutual friends!` : '3 mutual friends!'}
            </span>
          </div>
        </div>
      </div>

      {/* Pickup / Dropoff with vertical connector */}
      <div className="hs-ride-route">
        <div className="hs-ride-route-dots" aria-hidden="true">
          <span className="hs-route-dot" />
          <span className="hs-route-line" />
          <span className="hs-route-dot filled" />
        </div>
        <div className="hs-ride-route-text">
          <p className="hs-route-place">{ride.from}</p>
          <p className="hs-route-place">{ride.to}</p>
        </div>
      </div>

      {/* More Info button */}
      <button className="hs-more-info-btn" onClick={() => onMoreInfo(ride)}>
        More Info
      </button>
    </div>
  );
}

function EmptyState({ tab, onBrowseCommunity }) {
  const t = useT();
  return (
    <div className="hs-empty-state">
      <img
        src={emptyStateIllustration}
        alt=""
        className="hs-empty-illustration"
      />
      <p>{t('home.empty')}</p>
      {tab === 'driving' && (
        <button
          type="button"
          className="hs-cta-secondary hs-empty-cta"
          onClick={onBrowseCommunity}
        >
          <span>{t('home.empty.browseCta')}</span>
        </button>
      )}
    </div>
  );
}

export default function HomeScreen() {
  const {
    openRideFlow, rideRequests, acceptedRides, dismissedRides, openRideDetail,
    myRidesTab, setMyRidesTab,
    openCall,
    setActiveTab,
  } = useApp();
  const t = useT();

  const drivingRides = rideRequests.filter(
    r => acceptedRides.has(r.id) && !r.isOwn && !dismissedRides.has(r.id)
  );
  const ridingRides  = rideRequests.filter(
    r => r.isOwn && !dismissedRides.has(r.id)
  );
  const activeRides  = myRidesTab === 'driving' ? drivingRides : ridingRides;

  function handleCallForRide() {
    openCall();
  }

  return (
    <div className="hs-root">
      {/* ═════ "Need to be anywhere?" card ═════ */}
      <div className="hs-request-card">
        <h2 className="hs-card-title">{t('home.cta.title')}</h2>

        <div className="hs-cta-group">
          <button
            className="hs-cta-primary"
            onClick={() => openRideFlow('search')}
          >
            <CarIcon size={24} style={{ color: '#f5f5f5' }} />
            <span>{t('home.cta.request')}</span>
          </button>

          <button
            className="hs-cta-secondary"
            onClick={handleCallForRide}
          >
            <PhoneIcon size={22} style={{ color: '#e85733' }} />
            <span>{t('home.cta.call')}</span>
          </button>
        </div>
      </div>

      {/* ═════ My Rides section ═════ */}
      <div className="hs-rides-section">
        <h2 className="hs-section-title">{t('home.myrides')}</h2>

        <div className="hs-tabbar">
          <button
            className={`hs-tab${myRidesTab === 'driving' ? ' active' : ''}`}
            onClick={() => setMyRidesTab('driving')}
          >
            {t('home.tab.driving')}
          </button>
          <button
            className={`hs-tab${myRidesTab === 'riding' ? ' active' : ''}`}
            onClick={() => setMyRidesTab('riding')}
          >
            {t('home.tab.riding')}
          </button>
        </div>

        <div className="hs-rides-list">
          {activeRides.length === 0 ? (
            <EmptyState
              tab={myRidesTab}
              onBrowseCommunity={() => setActiveTab('community')}
            />
          ) : (
            activeRides.map(ride => (
              <RideCard key={ride.id} ride={ride} onMoreInfo={openRideDetail} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
