/* ══════════════════════════════════════════════════════════════════
   RideRequestScreen — Bolt-style request flow, brand-adapted
   Steps:
     search  → form: pickup / dropoff / quick picks / recents
     pickup  → interactive map to pick precise pickup
     dropoff → interactive map to pick precise dropoff
     confirm → map with route + single ride option + payment + confirm
   ══════════════════════════════════════════════════════════════════ */
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect, useRef } from 'react';
import {
  X, Plus, ArrowUpDown, Map as MapIcon, Navigation2, MapPin,
  Clock, ChevronLeft, Crosshair,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import { useApp } from '../context/AppContext';
import ScheduleRideSheet from '../components/ScheduleRideSheet';
import './RideRequestScreen.css';

// ── Live user-location blue dot ──────────────────────────────────
const USER_DOT_ICON = L.divIcon({
  className: '',
  html: '<div class="rrs-user-dot"><div class="rrs-user-dot-ring"></div><div class="rrs-user-dot-core"></div></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// ── Custom map-pin icons ─────────────────────────────────────────
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

// ── Defaults & mock data ─────────────────────────────────────────
const AMSTERDAM = [52.3676, 4.9041];

const QUICK_PICKS = [
  { label: 'Home',     coords: [52.3728, 4.8936], address: 'Jordaan, Amsterdam' },
  { label: 'Hospital', coords: [52.3408, 4.9020], address: 'AMC Hospital, Amsterdam' },
  { label: 'Charity',  coords: [52.3501, 4.8898], address: 'Charity HQ, Amsterdam' },
  { label: "Mary's",   coords: [52.3600, 4.8850], address: "Mary's Café, Amsterdam" },
];

const RECENT_LOCATIONS = [
  { id: 'r1', name: 'The Social Hub Amsterdam City', address: 'Wibautstraat 129, Weesperzijde, Amsterdam', coords: [52.3581, 4.9085], distance: null },
  { id: 'r2', name: '1075 GB',                       address: 'Wibautstraat 129, Weesperzijde, Amsterdam', coords: [52.3573, 4.8735], distance: '4 Km' },
  { id: 'r3', name: 'Amsterdam Central Station',     address: 'Stationsplein, Amsterdam',                  coords: [52.3791, 4.9003], distance: '5.5 Km' },
  { id: 'r4', name: 'Vondelpark',                    address: 'Vondelpark, Amsterdam',                     coords: [52.3580, 4.8686], distance: '7.4 Km' },
];

// ── Helpers ──────────────────────────────────────────────────────
function haversineKm([lat1, lon1], [lat2, lon2]) {
  const toRad = d => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function priceFromDistance(km) {
  // €1 base + €0.8/km — simple prototype pricing
  return Math.round((1 + km * 0.8) * 10) / 10;
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
    const city = data.address?.city || data.address?.town || data.address?.village || '';
    if (road && city) return `${road}, ${city}`;
    if (road) return road;
    return data.display_name?.split(',').slice(0, 2).join(',').trim()
      || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// ── Leaflet helpers (sub-components) ─────────────────────────────
function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

function MapPanner({ center }) {
  const map = useMap();
  const prevRef = useRef(null);
  useEffect(() => {
    if (!center) return;
    const key = center.join(',');
    if (key === prevRef.current) return;
    prevRef.current = key;
    map.setView(center, Math.max(map.getZoom(), 15), { animate: true });
  }, [center, map]);
  return null;
}

function FitRouteBounds({ from, to }) {
  const map = useMap();
  const doneRef = useRef(false);
  useEffect(() => {
    if (doneRef.current) return;
    if (!from || !to) return;
    map.fitBounds([from, to], { padding: [60, 60], maxZoom: 15, animate: false });
    doneRef.current = true;
  }, [from, to, map]);
  return null;
}

// ── Main component ───────────────────────────────────────────────
export default function RideRequestScreen() {
  const {
    rideFlowOpen, rideFlowStep, closeRideFlow,
    addRideRequest, showRideToast,
    setActiveTab, setMyRidesTab,
  } = useApp();

  const [step, setStep] = useState('search'); // 'search' | 'pickup' | 'dropoff' | 'confirm'
  const [pickupLoc,  setPickupLoc]  = useState({ label: 'Current location', coords: AMSTERDAM });
  const [dropoffLoc, setDropoffLoc] = useState(null);
  const [pickupQuery,  setPickupQuery]  = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [activeField,  setActiveField]  = useState('dropoff'); // 'pickup' | 'dropoff'
  const [activePick, setActivePick] = useState(null);
  const [payment,    setPayment]    = useState('apple'); // 'apple' | 'cash' | 'credit'

  // Map state
  const [mapCenter,    setMapCenter]    = useState(AMSTERDAM);
  const [geocoding,    setGeocoding]    = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [submitting,   setSubmitting]   = useState(false);

  // Live-search results (Nominatim/OSM)
  const [searchResults, setSearchResults] = useState([]);
  const [searching,     setSearching]     = useState(false);

  // Pending pick on the map step — lets users verify before committing
  const [pendingCoords, setPendingCoords] = useState(null);
  const [pendingLabel,  setPendingLabel]  = useState('');

  // Scheduled-pickup state (null = ride leaves "Now")
  const [scheduledFor,  setScheduledFor]  = useState(null);
  const [scheduleOpen,  setScheduleOpen]  = useState(false);

  // ── Reset when overlay opens ─────────────────────────────────
  useEffect(() => {
    if (rideFlowOpen) {
      setStep(rideFlowStep || 'search');
      setPickupLoc({ label: 'Current location', coords: AMSTERDAM });
      setDropoffLoc(null);
      setPickupQuery('');
      setDropoffQuery('');
      setActiveField('dropoff');
      setActivePick(null);
      setMapCenter(AMSTERDAM);
      setPendingCoords(null);
      setPendingLabel('');
      setScheduledFor(null);
      setScheduleOpen(false);
      setPayment('apple');
      setSubmitting(false);
    } else {
      setUserPosition(null);
    }
  }, [rideFlowOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Watch user's live GPS while overlay is open
  useEffect(() => {
    if (!rideFlowOpen || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [rideFlowOpen]);

  // ── Live Nominatim search ────────────────────────────────────
  // Debounced, biased around the user's current position (or pickup, or
  // Amsterdam fallback). Aborts any in-flight request when the query changes.
  useEffect(() => {
    if (!rideFlowOpen || step !== 'search') return;
    const query = (activeField === 'pickup' ? pickupQuery : dropoffQuery).trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const ctrl  = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const center = userPosition || pickupLoc?.coords || AMSTERDAM;
        const offset = 0.5;   // ~50 km box, biased around center
        const viewbox =
          `${center[1] - offset},${center[0] + offset},` +
          `${center[1] + offset},${center[0] - offset}`;
        const url =
          `https://nominatim.openstreetmap.org/search` +
          `?q=${encodeURIComponent(query)}` +
          `&format=json&limit=8&addressdetails=1` +
          `&viewbox=${viewbox}`;
        const res  = await fetch(url, { signal: ctrl.signal });
        const data = await res.json();
        const mapped = data.map(d => {
          const parts  = d.display_name.split(',').map(s => s.trim());
          const coords = [parseFloat(d.lat), parseFloat(d.lon)];
          const km     = haversineKm(center, coords);
          return {
            id:       `n-${d.place_id}`,
            name:     parts[0] || d.display_name,
            address:  parts.slice(1, 3).join(', ') || d.display_name,
            coords,
            distance: km < 100 ? `${km.toFixed(1)} Km` : null,
          };
        });
        setSearchResults(mapped);
        setSearching(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSearchResults([]);
          setSearching(false);
        }
      }
    }, 280);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [rideFlowOpen, step, activeField, pickupQuery, dropoffQuery,
      userPosition, pickupLoc?.coords]);

  // ── Handlers ────────────────────────────────────────────────
  function handleClose() {
    if (step === 'confirm')                    return setStep('search');
    if (step === 'pickup' || step === 'dropoff') return setStep('search');
    closeRideFlow();
  }

  function openMapForPickup() {
    setMapCenter(pickupLoc.coords);
    setPendingCoords(pickupLoc.coords);
    setPendingLabel(pickupLoc.label === 'Current location' ? '' : pickupLoc.label);
    setStep('pickup');
  }

  function openMapForDropoff() {
    const start = dropoffLoc?.coords || pickupLoc.coords;
    setMapCenter(start);
    setPendingCoords(dropoffLoc?.coords || null);
    setPendingLabel(dropoffLoc?.label || '');
    setStep('dropoff');
  }

  function handleSwap() {
    if (!dropoffLoc) return;
    const newPickup  = dropoffLoc;
    const newDropoff = pickupLoc;
    setPickupLoc(newPickup);
    setDropoffLoc(newDropoff);
    setPickupQuery(newPickup.label === 'Current location' ? '' : newPickup.label);
    setDropoffQuery(newDropoff.label === 'Current location' ? '' : newDropoff.label);
  }

  function handleSelectQuickPick(pick) {
    if (activeField === 'pickup') {
      setPickupLoc({ label: pick.address, coords: pick.coords });
      setPickupQuery(pick.address);
    } else {
      setDropoffLoc({ label: pick.address, coords: pick.coords });
      setDropoffQuery(pick.address);
      setActivePick(pick.label);
    }
  }

  function handleSelectRecent(recent) {
    if (activeField === 'pickup') {
      setPickupLoc({ label: recent.name, coords: recent.coords });
      setPickupQuery(recent.name);
    } else {
      setDropoffLoc({ label: recent.name, coords: recent.coords });
      setDropoffQuery(recent.name);
      setActivePick(null);
    }
  }

  // Update the pending pick + reverse-geocode its label.
  // Does NOT commit to pickupLoc/dropoffLoc — that happens on Confirm.
  async function setPendingPick(coords) {
    setPendingCoords(coords);
    setPendingLabel('');
    setGeocoding(true);
    const label = await reverseGeocode(coords[0], coords[1]);
    setGeocoding(false);
    setPendingLabel(label);
  }

  function handleMapClick(latlng) {
    const coords = [latlng.lat, latlng.lng];
    setMapCenter(coords);
    setPendingPick(coords);
  }

  function handleLocateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(coords);
        setPendingPick(coords);
      },
      () => {}
    );
  }

  function handleConfirmMapPick() {
    if (!pendingCoords) return;
    const label = pendingLabel ||
      `${pendingCoords[0].toFixed(4)}, ${pendingCoords[1].toFixed(4)}`;
    if (step === 'pickup') {
      setPickupLoc({ label, coords: pendingCoords });
      setPickupQuery(label);
    } else if (step === 'dropoff') {
      setDropoffLoc({ label, coords: pendingCoords });
      setDropoffQuery(label);
      setActivePick(null);
    }
    setPendingCoords(null);
    setPendingLabel('');
    setStep('search');
  }

  function handleConfirmDestination() {
    if (!dropoffLoc) return;
    setStep('confirm');
  }

  function formatScheduledLabel(d) {
    if (!d) return 'Now';
    const today    = new Date();    today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const dayKey   = new Date(d);    dayKey.setHours(0,0,0,0);
    const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    if (dayKey.getTime() === today.getTime())    return `Today ${time}`;
    if (dayKey.getTime() === tomorrow.getTime()) return `Tomorrow ${time}`;
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} ${time}`;
  }

  function handleConfirmRide() {
    if (submitting || !dropoffLoc) return;
    setSubmitting(true);
    const rideId = Date.now();
    const km    = haversineKm(pickupLoc.coords, dropoffLoc.coords);
    const mins  = Math.max(1, Math.round(km * 3));
    const price = priceFromDistance(km);
    setTimeout(() => {
      addRideRequest({
        id: rideId,
        name: 'John Doe',
        avatar: null,
        initials: 'JD',
        communities: 2,
        verified: true,
        match: Math.floor(75 + Math.random() * 20),
        price: `€ ${price.toFixed(2)}`,
        from: pickupLoc.label,
        to:   dropoffLoc.label,
        when: formatScheduledLabel(scheduledFor),
        scheduledAt: scheduledFor ? scheduledFor.toISOString() : null,
        duration: `~${mins} min`,
        distance: `${km.toFixed(1)} km`,
        fromCoords: pickupLoc.coords,
        toCoords:   dropoffLoc.coords,
        isOwn: true,
      });
      showRideToast({ id: rideId, from: pickupLoc.label, to: dropoffLoc.label });
      setActiveTab('home');
      setMyRidesTab('riding');
      closeRideFlow();
      setSubmitting(false);
    }, 500);
  }

  // ── Computed values for confirm view ──
  const km    = dropoffLoc ? haversineKm(pickupLoc.coords, dropoffLoc.coords) : 0;
  const mins  = Math.max(1, Math.round(km * 3));
  const price = priceFromDistance(km);

  const canConfirmDest = !!dropoffLoc;
  const isMapStep      = step === 'pickup' || step === 'dropoff';

  // ── Suggestion lists ──────────────────────────────────────
  const activeQuery = (activeField === 'pickup' ? pickupQuery : dropoffQuery).trim();
  const hasQuery    = activeQuery.length > 0;
  const lcQuery     = activeQuery.toLowerCase();
  // Quick-pick chips still filter from the local shortcut list.
  const filteredQuickPicks = hasQuery
    ? QUICK_PICKS.filter(p =>
        p.label.toLowerCase().includes(lcQuery) ||
        p.address.toLowerCase().includes(lcQuery))
    : QUICK_PICKS;
  // Bottom list: recents history when idle, real Nominatim hits while typing.
  const displayedPlaces = hasQuery ? searchResults : RECENT_LOCATIONS;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className={`rrs-overlay${rideFlowOpen ? ' open' : ''}`}>

      {/* ═════ SEARCH STEP ═════ */}
      {step === 'search' && (
        <div className="rrs-search-step">

          {/* Header: X + title */}
          <div className="rrs-search-header">
            <button className="rrs-close-btn" onClick={handleClose} aria-label="Close">
              <X size={20} strokeWidth={2.2} color="#1a1a1a" />
            </button>
            <h1 className="rrs-search-title">Request a ride</h1>
            <div className="rrs-header-spacer" />
          </div>

          {/* Pickup / Dropoff card */}
          <div className="rrs-search-card">
            <div className="rrs-search-fields">
              <div className={`rrs-field-row${activeField === 'pickup' ? ' active' : ''}`}>
                <Navigation2 size={22} strokeWidth={2} color="#727272" className="rrs-field-icon" />
                <input
                  type="text"
                  className="rrs-field-input"
                  placeholder="Current location"
                  value={pickupQuery}
                  onChange={(e) => { setActiveField('pickup'); setPickupQuery(e.target.value); }}
                  onFocus={() => setActiveField('pickup')}
                />
                <button
                  className="rrs-field-action"
                  onClick={openMapForPickup}
                  type="button"
                  aria-label="Pick pickup on map"
                >
                  <Plus size={22} strokeWidth={2} color="#1a1a1a" />
                </button>
              </div>

              <div className="rrs-field-divider" />

              <div className={`rrs-field-row${activeField === 'dropoff' ? ' active' : ''}`}>
                <MapPin size={22} strokeWidth={2} color="#ff6038" fill="#ff6038" className="rrs-field-icon" />
                <input
                  type="text"
                  className="rrs-field-input"
                  placeholder="Dropoff location"
                  value={dropoffQuery}
                  onChange={(e) => { setActiveField('dropoff'); setDropoffQuery(e.target.value); }}
                  onFocus={() => setActiveField('dropoff')}
                />
                <button
                  className="rrs-field-action rrs-field-map"
                  onClick={openMapForDropoff}
                  type="button"
                  aria-label="Pick dropoff on map"
                >
                  <MapIcon size={20} strokeWidth={2} color="#ff6038" />
                </button>
              </div>
            </div>

            <button
              className={`rrs-swap-btn${!dropoffLoc ? ' disabled' : ''}`}
              onClick={handleSwap}
              disabled={!dropoffLoc}
              aria-label="Swap pickup and dropoff"
            >
              <ArrowUpDown size={20} strokeWidth={2} color={dropoffLoc ? '#1a1a1a' : '#c9c9c9'} />
            </button>
          </div>

          {/* Quick-pick chips */}
          {filteredQuickPicks.length > 0 && (
            <div className="rrs-quickpick-row">
              {filteredQuickPicks.map(pick => (
                <button
                  key={pick.label}
                  className={`rrs-chip${activePick === pick.label ? ' active' : ''}`}
                  onClick={() => handleSelectQuickPick(pick)}
                >
                  {pick.label}
                </button>
              ))}
            </div>
          )}

          {/* Recent / live-search locations */}
          <div className="rrs-recents">
            {hasQuery && searching && displayedPlaces.length === 0 && (
              <p className="rrs-recents-empty">Searching nearby places…</p>
            )}
            {hasQuery && !searching && displayedPlaces.length === 0 && (
              <p className="rrs-recents-empty">No matching addresses</p>
            )}
            {displayedPlaces.map((r, i) => (
              <button
                key={r.id}
                className="rrs-recent-row"
                onClick={() => handleSelectRecent(r)}
              >
                <Clock size={18} strokeWidth={1.8} color="#727272" className="rrs-recent-ico" />
                <div className="rrs-recent-text">
                  <p className="rrs-recent-name">{r.name}</p>
                  <p className="rrs-recent-addr">{r.address}</p>
                </div>
                {r.distance && <span className="rrs-recent-dist">{r.distance}</span>}
                {i < displayedPlaces.length - 1 && <div className="rrs-recent-divider" />}
              </button>
            ))}
          </div>

          {/* Confirm Destination button */}
          <div className="rrs-search-footer">
            <button
              className={`rrs-confirm-btn${!canConfirmDest ? ' disabled' : ''}`}
              onClick={handleConfirmDestination}
              disabled={!canConfirmDest}
            >
              <span className="rrs-confirm-btn-text">Confirm Destination</span>
            </button>
          </div>
        </div>
      )}

      {/* ═════ MAP-SELECT STEP (pickup or dropoff) ═════ */}
      {isMapStep && (
        <div className="rrs-map-step">
          <div className="rrs-map-container">
            <MapContainer
              center={mapCenter}
              zoom={17}
              zoomControl={false}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              />
              <MapClickHandler onMapClick={handleMapClick} />
              <MapPanner center={mapCenter} />

              {userPosition && (
                <Marker position={userPosition} icon={USER_DOT_ICON} />
              )}

              {/* Pending pick marker — exact tap location, awaiting confirmation */}
              {pendingCoords && (
                <Marker
                  position={pendingCoords}
                  icon={step === 'pickup' ? PICKUP_ICON : DROPOFF_ICON}
                />
              )}

              {/* Show the existing pickup pin while choosing the dropoff so
                  the user can see both endpoints in context */}
              {step === 'dropoff' && pickupLoc.coords && (
                <Marker position={pickupLoc.coords} icon={PICKUP_ICON} />
              )}
            </MapContainer>
          </div>

          {/* Center crosshair — visual feedback for "where will I tap" */}
          <div className="rrs-map-crosshair" aria-hidden="true">
            <span className="rrs-map-crosshair-h" />
            <span className="rrs-map-crosshair-v" />
            <span className="rrs-map-crosshair-dot" />
          </div>

          {/* Header overlay */}
          <div className="rrs-map-header">
            <button className="rrs-close-btn" onClick={handleClose} aria-label="Back">
              <ChevronLeft size={22} strokeWidth={2.2} color="#1a1a1a" />
            </button>
            <div className="rrs-map-header-title">
              {step === 'pickup' ? 'Choose pickup on map' : 'Choose destination on map'}
            </div>
            <div className="rrs-header-spacer" />
          </div>

          {/* Locate-me FAB */}
          <button className="rrs-locate-fab" onClick={handleLocateMe} aria-label="Use my location">
            <Crosshair size={22} strokeWidth={2} color="#1a1a1a" />
          </button>

          {/* Bottom confirm card — the exact tap location is committed only
              when the user taps Confirm. They can re-tap to move the pin. */}
          <div className="rrs-map-confirm">
            <div className="rrs-map-confirm-label-row">
              <MapPin size={18} strokeWidth={2} color="#ff6038" fill="#ff6038" />
              <span className="rrs-map-confirm-label">
                {!pendingCoords
                  ? 'Tap the map to drop a pin'
                  : geocoding
                    ? 'Locating…'
                    : (pendingLabel ||
                        `${pendingCoords[0].toFixed(5)}, ${pendingCoords[1].toFixed(5)}`)}
              </span>
            </div>
            <button
              className={`rrs-confirm-btn rrs-map-confirm-btn${(!pendingCoords || geocoding) ? ' disabled' : ''}`}
              onClick={handleConfirmMapPick}
              disabled={!pendingCoords || geocoding}
            >
              <span className="rrs-confirm-btn-text">
                {step === 'pickup' ? 'Confirm pickup' : 'Confirm destination'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ═════ CONFIRM STEP ═════ */}
      {step === 'confirm' && dropoffLoc && (
        <div className="rrs-confirm-step">

          {/* Leaflet map with route */}
          <div className="rrs-map-container">
            <MapContainer
              center={pickupLoc.coords}
              zoom={14}
              zoomControl={false}
              dragging={true}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              />
              <FitRouteBounds from={pickupLoc.coords} to={dropoffLoc.coords} />
              <Marker position={pickupLoc.coords}  icon={PICKUP_ICON} />
              <Marker position={dropoffLoc.coords} icon={DROPOFF_ICON} />
              <Polyline
                positions={[pickupLoc.coords, dropoffLoc.coords]}
                pathOptions={{ color: '#ff6038', weight: 3, dashArray: '8 6', opacity: 0.95 }}
              />
            </MapContainer>
          </div>

          {/* Top X button */}
          <div className="rrs-confirm-topbar">
            <button className="rrs-close-btn" onClick={handleClose} aria-label="Back">
              <X size={20} strokeWidth={2.2} color="#1a1a1a" />
            </button>
          </div>

          {/* Bottom overlay: ride details + payment + CTAs */}
          <div className="rrs-confirm-bottom">

            {/* Ride option card (single option) */}
            <div className="rrs-ride-card">
              <div className="rrs-ride-header">
                <span className="rrs-ride-from">{pickupLoc.label}</span>
                <span className="rrs-ride-arrow">→</span>
                <span className="rrs-ride-to">{dropoffLoc.label}</span>
              </div>
              <div className="rrs-ride-meta">
                <div className="rrs-ride-left">
                  <span className="rrs-ride-eta">{mins} min</span>
                  <span className="rrs-ride-dist">({km.toFixed(1)} Km)</span>
                </div>
                <span className="rrs-ride-price">€ {price.toFixed(2)}</span>
              </div>
              {scheduledFor && (
                <div className="rrs-ride-scheduled">
                  <Clock size={14} strokeWidth={2} color="#e85733" />
                  <span>Scheduled for {formatScheduledLabel(scheduledFor)}</span>
                  <button
                    type="button"
                    className="rrs-ride-scheduled-edit"
                    onClick={() => setScheduleOpen(true)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Payment card */}
            <div className="rrs-pay-card">
              <button className="rrs-pay-row" onClick={() => setPayment('apple')}>
                <span className="rrs-pay-label">Apple Pay</span>
                <span className={`rrs-radio${payment === 'apple' ? ' selected' : ''}`} />
              </button>
              <div className="rrs-pay-divider" />
              <button className="rrs-pay-row" onClick={() => setPayment('cash')}>
                <span className="rrs-pay-label">Cash payment</span>
                <span className={`rrs-radio${payment === 'cash' ? ' selected' : ''}`} />
              </button>
              <div className="rrs-pay-divider" />
              <button className="rrs-pay-row" onClick={() => setPayment('credit')}>
                <span className="rrs-pay-label">Credit payment</span>
                <span className={`rrs-radio${payment === 'credit' ? ' selected' : ''}`} />
              </button>
            </div>

            {/* CTA row: Confirm Ride + schedule clock */}
            <div className="rrs-cta-row">
              <button
                className={`rrs-confirm-btn rrs-confirm-ride${submitting ? ' loading' : ''}`}
                onClick={handleConfirmRide}
                disabled={submitting}
              >
                {submitting
                  ? <span className="rrs-spinner" />
                  : <span className="rrs-confirm-btn-text">Confirm Ride</span>}
              </button>
              <button
                className={`rrs-schedule-btn${scheduledFor ? ' active' : ''}`}
                onClick={() => setScheduleOpen(true)}
                aria-label="Schedule ride"
                type="button"
              >
                <Clock size={22} strokeWidth={2} color="#f5f5f5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduling sheet — Bolt-style "Select pickup time" */}
      <ScheduleRideSheet
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onConfirm={(when) => { setScheduledFor(when); setScheduleOpen(false); }}
        defaultTime={scheduledFor}
        durationMins={mins}
      />
    </div>
  );
}
