import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClockIcon, VerifiedIcon } from '../components/Icons';
import './CommunityScreen.css';

// Mock friends — pravatar.cc gives a stable face per `?u=<seed>`.
const FRIENDS = [
  { id: 1, name: 'John Doe', rides: 2, initials: 'JD', photo: 'https://i.pravatar.cc/120?u=viavia-john'  },
  { id: 2, name: 'Emma V.',  rides: 4, initials: 'EV', photo: 'https://i.pravatar.cc/120?u=viavia-emma'  },
  { id: 3, name: 'Mark Doe', rides: 3, initials: 'MD', photo: 'https://i.pravatar.cc/120?u=viavia-mark'  },
  { id: 4, name: 'Lars B.',  rides: 1, initials: 'LB', photo: 'https://i.pravatar.cc/120?u=viavia-lars'  },
];

// User's "current location" used for distance-from-pickup math (Amsterdam).
const USER_POS = [52.3676, 4.9041];

// ── Avatar helper — img with initials fallback ──────────────────
function Avatar({ name, photo, initials, size = 38, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt={name}
        className={`cs-avatar-img ${className}`}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className={`cs-avatar-fallback ${className}`}
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

function FriendCard({ friend }) {
  return (
    <div className="cs-friend-card">
      <Avatar name={friend.name} photo={friend.photo} initials={friend.initials} size={38} />
      <div className="cs-friend-text">
        <p className="cs-friend-name">{friend.name}</p>
        <p className="cs-friend-rides">{friend.rides} Rides</p>
      </div>
    </div>
  );
}

// ── Custom dropdown ─────────────────────────────────────────────
function FilterSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="cs-select-wrap" ref={ref}>
      <button
        type="button"
        className={`cs-select${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="cs-select-value">{current.label}</span>
        <ChevronDown size={16} strokeWidth={2} color="#1e1e1e" />
      </button>
      {open && (
        <ul className="cs-select-menu" role="listbox">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                className={`cs-select-opt${opt.value === value ? ' active' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Distance helper (haversine) ─────────────────────────────────
function haversineKm([la1, lo1], [la2, lo2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(la2 - la1);
  const dLon = toRad(lo2 - lo1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ── Time predicate ──────────────────────────────────────────────
function whenInfo(ride) {
  // Best signal: scheduledAt (ISO). Fallback: parse the text.
  if (ride.scheduledAt) {
    const d = new Date(ride.scheduledAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}
function matchesTime(ride, when) {
  if (when === 'any') return true;
  const d = whenInfo(ride);
  if (d) {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const weekEnd  = new Date(today); weekEnd.setDate(today.getDate() + 7);
    const dayKey = new Date(d); dayKey.setHours(0,0,0,0);
    if (when === 'today')    return dayKey.getTime() === today.getTime();
    if (when === 'tomorrow') return dayKey.getTime() === tomorrow.getTime();
    if (when === 'week')     return dayKey >= today && dayKey <= weekEnd;
    return true;
  }
  // Fallback to text matching for the seeded mock data
  const w = (ride.when || '').toLowerCase();
  if (when === 'today')    return w.includes('today') || w === 'now';
  if (when === 'tomorrow') return w.includes('tomorrow');
  if (when === 'week')     return w.includes('today') || w.includes('tomorrow');
  return true;
}

// Ride request card — Figma 83:21073
function RideRequestCard({ ride, accepted, dismissing, onAccept, onMoreInfo }) {
  const photo = ride.photo
    || `https://i.pravatar.cc/120?u=viavia-${(ride.name || 'r').toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className={`cs-ride-card${accepted ? ' accepted' : ''}${dismissing ? ' dismissing' : ''}`}>
      <div className="cs-ride-header">
        <ClockIcon size={24} style={{ color: '#1e1e1e' }} />
        <p className="cs-ride-when">{ride.when || '14:15, Today'}</p>
      </div>

      <div className="cs-ride-divider" />

      <div className="cs-ride-user">
        <Avatar name={ride.name} photo={photo} initials={ride.initials} size={41} className="cs-ride-avatar-photo" />
        <div className="cs-ride-user-info">
          <div className="cs-ride-name-row">
            <span className="cs-ride-name">{ride.name}</span>
            {ride.verified && (
              <VerifiedIcon size={16} style={{ color: '#ff6038' }} />
            )}
          </div>
          <div className="cs-ride-mutuals">
            <span className="cs-mutual-dots">
              <span /><span /><span />
            </span>
            <span className="cs-mutual-text">
              {ride.communities ? `${ride.communities} mutual friends!` : '3 mutual friends!'}
            </span>
          </div>
        </div>
      </div>

      <div className="cs-ride-route">
        <div className="cs-route-dots" aria-hidden="true">
          <span className="cs-route-dot" />
          <span className="cs-route-line" />
          <span className="cs-route-dot filled" />
        </div>
        <div className="cs-route-text">
          <p className="cs-route-place">
            {ride.fromCoords
              ? `Near you (~ ${haversineKm(USER_POS, ride.fromCoords).toFixed(1)} km)`
              : 'Near you'}
          </p>
          <p className="cs-route-place">{ride.to}</p>
        </div>
      </div>

      <p className="cs-ride-note">Exact pickup shared after confirmation</p>

      <div className="cs-ride-actions">
        <button
          className={`cs-btn cs-btn-primary${accepted ? ' accepted' : ''}`}
          onClick={() => !accepted && onAccept(ride)}
          disabled={accepted}
        >
          {accepted ? 'Accepted' : 'Accept'}
        </button>
        <button className="cs-btn cs-btn-secondary" onClick={() => onMoreInfo(ride)}>
          More Info
        </button>
      </div>
    </div>
  );
}

export default function CommunityScreen() {
  const {
    rideRequests,
    acceptedRides, acceptRide,
    acceptToast, showAcceptToast, clearAcceptToast,
    openRideDetail,
    dismissedRides, dismissRide,
  } = useApp();

  // Filter state
  const [whenFilter, setWhenFilter] = useState('any');
  const [distFilter, setDistFilter] = useState(0); // km, 0 = any
  const [dismissingIds, setDismissingIds] = useState(() => new Set());

  // Auto-dismiss accept toast after 4 s
  useEffect(() => {
    if (!acceptToast) return;
    const id = setTimeout(clearAcceptToast, 4000);
    return () => clearTimeout(id);
  }, [acceptToast, clearAcceptToast]);

  const TIME_OPTIONS = useMemo(() => ([
    { value: 'today',    label: 'Today'    },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'week',     label: 'This week' },
    { value: 'any',      label: 'Any time' },
  ]), []);

  const DIST_OPTIONS = useMemo(() => ([
    { value: 5,   label: '5 km'  },
    { value: 10,  label: '10 km' },
    { value: 25,  label: '25 km' },
    { value: 50,  label: '50 km' },
    { value: 0,   label: 'Any range' },
  ]), []);

  // Filter pipeline
  const visibleRides = rideRequests.filter((r) => {
    if (r.isOwn) return false;
    if (dismissedRides.has(r.id)) return false;
    if (!matchesTime(r, whenFilter)) return false;
    if (distFilter > 0 && r.fromCoords) {
      const km = haversineKm(USER_POS, r.fromCoords);
      if (km > distFilter) return false;
    }
    return true;
  });

  function handleAccept(req) {
    acceptRide(req.id);
    showAcceptToast({ name: req.name.split(' ')[0] });
    // Visual fade after 4.5 s, then unmount at 5 s
    setTimeout(() => {
      setDismissingIds((s) => new Set([...s, req.id]));
    }, 4500);
    setTimeout(() => {
      dismissRide(req.id);
      setDismissingIds((s) => {
        const n = new Set(s);
        n.delete(req.id);
        return n;
      });
    }, 5000);
  }

  return (
    <div className="cs-root">
      {/* ── Single sticky cluster (opaque) — friends card + requests header.
          Combining them prevents scrolling cards from peeking through the gap. */}
      <div className="cs-sticky">
        <section className="cs-friends-card">
          <h2 className="cs-friends-title">My Friends</h2>
          <div className="cs-friends-row">
            {FRIENDS.map((f) => <FriendCard key={f.id} friend={f} />)}
          </div>
        </section>

        <section className="cs-requests-header">
          <h2 className="cs-section-title">Ride Requests</h2>
          <div className="cs-filter-row">
            <FilterSelect value={whenFilter} options={TIME_OPTIONS} onChange={setWhenFilter} />
            <FilterSelect value={distFilter} options={DIST_OPTIONS} onChange={setDistFilter} />
          </div>
        </section>
      </div>

      {/* ── Only the ride cards scroll under the sticky cluster ──── */}
      <div className="cs-ride-list">
        {visibleRides.length === 0 ? (
          <p className="cs-empty">No ride requests nearby right now.</p>
        ) : (
          visibleRides.map((ride) => (
            <RideRequestCard
              key={ride.id}
              ride={ride}
              accepted={acceptedRides.has(ride.id)}
              dismissing={dismissingIds.has(ride.id)}
              onAccept={handleAccept}
              onMoreInfo={openRideDetail}
            />
          ))
        )}
      </div>

      {acceptToast && (
        <div className="cs-accept-toast">
          <div className="cs-toast-icon">✓</div>
          <div>
            <p className="cs-toast-title">Thanks!</p>
            <p className="cs-toast-sub">You&apos;re driving {acceptToast.name} soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}
