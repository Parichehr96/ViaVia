import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';
import {
  ChevronLeftIcon, BellIcon, PhoneIcon, MessageIcon,
  ClockIcon, EuroIcon, MapPinIcon, RouteIcon, CheckIcon,
} from '../components/Icons';
import './DriverRideScreen.css';

/* ══════════════════════════════════════════════════════════════════
   DriverRideScreen — Bolt-style during-ride flow.
   Full-screen live map + floating bottom sheet with passenger,
   route, ETA and the status-driven primary CTA.
   ══════════════════════════════════════════════════════════════════ */

// Map markers — same SVG pattern as RideRequestScreen
const makePinIcon = (color) => L.divIcon({
  className: '',
  html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 5.437 3.087 10.165 7.622 12.596L14 38l6.378-11.404C24.913 24.165 28 19.437 28 14C28 6.268 21.732 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`,
  iconSize: [28, 38],
  iconAnchor: [14, 38],
});
const PICKUP_ICON  = makePinIcon('#ff6038');
const DROPOFF_ICON = makePinIcon('#2e3b3b');

// Driver marker — orange car silhouette in a white pill
const CAR_ICON = L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;border-radius:50%;background:#ff6038;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:#fff;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.764 4a3 3 0 0 1 2.683 1.658l1.383 2.765c.244-.1.487-.201.723-.318a1 1 0 0 1 .894 1.79c-.494.246-.72.322-.72.322l.956 1.913c.209.417.317.876.317 1.342V16a3 3 0 0 1-1 2.236V19.5a1.5 1.5 0 0 1-3 0V19H6v.5a1.5 1.5 0 0 1-3 0v-1.264c-.614-.55-1-1.348-1-2.236v-2.528a3 3 0 0 1 .317-1.341l.956-1.914a14 14 0 0 1-.718-.321a1 1 0 0 1-.45-1.343a1.01 1.01 0 0 1 1.347-.445q.354.17.718.315l1.383-2.765A3 3 0 0 1 8.236 4Zm3.07 6.904C17.134 11.441 14.715 12 12 12s-5.134-.56-6.834-1.096l-1.06 2.12a1 1 0 0 0-.106.448V16a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.528a1 1 0 0 0-.106-.447l-1.06-2.12ZM7.5 13a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m9 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m-.736-7H8.236a1 1 0 0 0-.894.553L6.072 9.09C7.62 9.555 9.706 10 12 10s4.38-.445 5.927-.91l-1.269-2.537A1 1 0 0 0 15.764 6"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpCoords([la1, lo1], [la2, lo2], t) {
  return [lerp(la1, la2, t), lerp(lo1, lo2, t)];
}
function haversineKm([la1, lo1], [la2, lo2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(la2 - la1);
  const dLon = toRad(lo2 - lo1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Centre/zoom the map on the driver as it moves
function FollowDriver({ pos, deps }) {
  const map = useMap();
  useEffect(() => {
    if (!pos) return;
    map.flyTo(pos, Math.max(map.getZoom(), 14), { duration: 0.6 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return null;
}

export default function DriverRideScreen() {
  const {
    driverRideOpen,
    closeDriverRide,
    activeRide,
    rideFlowStatus,
    beginTrip,
    cancelActiveRide,
    completeRide,
    openChat,
    setActiveTab,
    setMyRidesTab,
    dismissRide,
  } = useApp();
  const t = useT();
  const [showSummary, setShowSummary] = useState(false);

  // Coords with a sane fallback so the map still renders
  const fromCoords = activeRide?.fromCoords || [52.3791, 4.9003];
  const toCoords   = activeRide?.toCoords   || [52.3105, 4.7683];

  // Start the driver at a "nearby" position (~1 km offset south of pickup) so
  // the en-route phase has visible motion. In production this would be the
  // driver's GPS.
  const driverStart = useMemo(
    () => [fromCoords[0] - 0.01, fromCoords[1] + 0.01],
    [fromCoords[0], fromCoords[1]],
  );

  const [driverPos, setDriverPos] = useState(driverStart);
  const animRef = useRef(null);

  // Reset driver position + summary state whenever a new ride opens
  useEffect(() => {
    if (driverRideOpen) {
      setDriverPos(driverStart);
      setShowSummary(false);
    }
  }, [driverRideOpen, driverStart]);

  // Animate the driver from the current spot to the destination once the
  // trip starts. Two stops shown for context (pickup + dropoff) but the
  // motion is a single continuous segment.
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (!driverRideOpen) return;
    if (rideFlowStatus !== 'in_progress') return; // accepted: stay parked

    const from = driverStart;
    const to   = toCoords;
    const durationMs = 14000;

    setDriverPos(from);
    const t0 = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / durationMs);
      setDriverPos(lerpCoords(from, to, k));
      if (k < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => animRef.current && cancelAnimationFrame(animRef.current);
  }, [rideFlowStatus, driverRideOpen, driverStart, toCoords]);

  const isInProgress = rideFlowStatus === 'in_progress';

  const passengerName     = activeRide?.name || 'Passenger';
  const passengerInitials = activeRide?.initials
    || passengerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const passengerVerified = activeRide?.verified ?? false;
  const photoUrl = activeRide?.photo
    || `https://i.pravatar.cc/120?u=viavia-${passengerName.toLowerCase().replace(/\s+/g, '-')}`;
  const [photoFailed, setPhotoFailed] = useState(false);

  // ETA for the status pill while driving
  const remainingKm = useMemo(() => {
    return isInProgress ? haversineKm(driverPos, toCoords) : null;
  }, [driverPos, toCoords, isInProgress]);
  const remainingMin = remainingKm ? Math.max(1, Math.round(remainingKm * 3)) : null;

  // Status copy for the pill at the top
  const statusCopy =
      rideFlowStatus === 'accepted'    ? t('drs.status.ready')
    : rideFlowStatus === 'in_progress' ? t('drs.status.inprogress', { min: remainingMin })
    : '';

  // Two-step flow: Start → I've arrived → summary
  const handleArrived = () => setShowSummary(true);
  const handleDone = () => {
    if (activeRide?.id) dismissRide(activeRide.id);   // archive completed trip
    completeRide();
    setActiveTab('home');
    setMyRidesTab('driving');
  };

  const primaryCta =
      rideFlowStatus === 'accepted'    ? { label: t('drs.cta.start'),   onClick: beginTrip,     variant: 'orange' }
    : rideFlowStatus === 'in_progress' ? { label: t('drs.cta.arrived'), onClick: handleArrived, variant: 'dark'   }
    : null;

  if (!driverRideOpen) return null;

  return (
    <div className="drs-overlay open">

      {/* ── Full-screen live map ────────────────────────── */}
      <div className="drs-map">
        <MapContainer
          key={activeRide?.id || 'driver-map'}
          center={driverStart}
          zoom={14}
          zoomControl={false}
          attributionControl={false}
          dragging={true}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OSM'
          />
          <Marker position={fromCoords} icon={PICKUP_ICON} />
          <Marker position={toCoords}   icon={DROPOFF_ICON} />
          <Marker position={driverPos}  icon={CAR_ICON} />
          {/* Solid orange route while driving, faint dashed before */}
          {isInProgress ? (
            <Polyline
              positions={[driverPos, toCoords]}
              pathOptions={{ color: '#ff6038', weight: 4, opacity: 0.95 }}
            />
          ) : (
            <Polyline
              positions={[fromCoords, toCoords]}
              pathOptions={{ color: '#2e3b3b', weight: 2.5, dashArray: '6 6', opacity: 0.4 }}
            />
          )}
          <FollowDriver pos={driverPos} deps={[rideFlowStatus]} />
        </MapContainer>
      </div>

      {/* ── Floating top bar: back + status pill + bell ────── */}
      <div className="drs-top">
        <button className="drs-icon-btn" onClick={closeDriverRide} aria-label={t('common.back')}>
          <ChevronLeftIcon size={20} style={{ color: '#1a1a1a' }} />
        </button>
        {statusCopy && <div className="drs-status-pill">{statusCopy}</div>}
        <button className="drs-icon-btn" aria-label={t('notif.title')}>
          <BellIcon size={20} style={{ color: '#1a1a1a' }} />
        </button>
      </div>

      {/* ── Bottom sheet — either live trip card OR summary ── */}
      {showSummary ? (
        <div className="drs-sheet drs-summary">
          <div className="drs-summary-check">
            <CheckIcon size={32} style={{ color: '#ffffff' }} />
          </div>
          <h2 className="drs-summary-title">{t('drs.summary.title')}</h2>
          <p className="drs-summary-sub">
            {t('drs.summary.sub', { name: passengerName.split(' ')[0] })}
          </p>

          <div className="drs-summary-route">
            <div className="drs-route-pins" aria-hidden="true">
              <span className="drs-route-dot pickup" />
              <span className="drs-route-line" />
              <span className="drs-route-dot drop" />
            </div>
            <div className="drs-route-text">
              <p className="drs-route-place">{activeRide?.from || 'Pickup'}</p>
              <p className="drs-route-place">{activeRide?.to   || 'Dropoff'}</p>
            </div>
          </div>

          <div className="drs-summary-stats">
            <div className="drs-summary-stat">
              <span className="drs-summary-stat-val">{activeRide?.duration || '—'}</span>
              <span className="drs-summary-stat-lbl">{t('drs.summary.duration')}</span>
            </div>
            <span className="drs-summary-stat-sep" />
            <div className="drs-summary-stat">
              <span className="drs-summary-stat-val">{activeRide?.distance || '—'}</span>
              <span className="drs-summary-stat-lbl">{t('drs.summary.distance')}</span>
            </div>
            <span className="drs-summary-stat-sep" />
            <div className="drs-summary-stat">
              <span className="drs-summary-stat-val drs-summary-earnings">{activeRide?.price || '—'}</span>
              <span className="drs-summary-stat-lbl">{t('drs.summary.earnings')}</span>
            </div>
          </div>

          <button className="drs-primary drs-primary-orange" onClick={handleDone}>
            {t('drs.summary.done')}
          </button>
        </div>
      ) : (
      <div className="drs-sheet">
        <div className="drs-sheet-handle" aria-hidden="true" />

        {/* Passenger row */}
        <div className="drs-pax">
          {!photoFailed ? (
            <img
              src={photoUrl}
              alt={passengerName}
              className="drs-pax-photo"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="drs-pax-fallback" aria-hidden="true">{passengerInitials}</div>
          )}
          <div className="drs-pax-info">
            <p className="drs-pax-name">{passengerName}</p>
            <p className="drs-pax-sub">
              {passengerVerified ? t('rds.verifiedMember') : t('drs.passenger')}
            </p>
          </div>
          <button className="drs-mini-btn" onClick={openChat} aria-label={t('rds.chat')}>
            <MessageIcon size={18} style={{ color: '#1a1a1a' }} />
          </button>
          <button className="drs-mini-btn" aria-label={t('drs.call')}>
            <PhoneIcon size={18} style={{ color: '#1a1a1a' }} />
          </button>
        </div>

        <div className="drs-divider" />

        {/* Trip route */}
        <div className="drs-route">
          <div className="drs-route-pins" aria-hidden="true">
            <span className="drs-route-dot pickup" />
            <span className="drs-route-line" />
            <span className="drs-route-dot drop" />
          </div>
          <div className="drs-route-text">
            <p className="drs-route-place">{activeRide?.from || 'Pickup'}</p>
            <p className="drs-route-place">{activeRide?.to   || 'Dropoff'}</p>
          </div>
        </div>

        {/* Trip stats */}
        <div className="drs-stats">
          <div className="drs-stat">
            <ClockIcon size={18} style={{ color: '#727272' }} />
            <span>{activeRide?.duration || '—'}</span>
          </div>
          <div className="drs-stat">
            <RouteIcon size={18} style={{ color: '#727272' }} />
            <span>{activeRide?.distance || '—'}</span>
          </div>
          <div className="drs-stat">
            <EuroIcon size={18} style={{ color: '#727272' }} />
            <span>{activeRide?.price || '—'}</span>
          </div>
        </div>

        {/* Primary CTA */}
        {primaryCta && (
          <button
            className={`drs-primary drs-primary-${primaryCta.variant}`}
            onClick={primaryCta.onClick}
          >
            {primaryCta.label}
          </button>
        )}

        {/* Cancel — destructive secondary action */}
        {rideFlowStatus !== 'in_progress' && (
          <button className="drs-cancel" onClick={cancelActiveRide}>
            {t('drs.cancel')}
          </button>
        )}
      </div>
      )}
    </div>
  );
}
