import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import './ScheduleRideSheet.css';

/* ══════════════════════════════════════════════════════════════════
   ScheduleRideSheet — Bolt-style "Select pickup time" bottom sheet.
   Pickups must be 30 min – 90 days from now.
   ══════════════════════════════════════════════════════════════════ */

const MIN_LEAD_MIN = 30;
const MAX_LEAD_DAYS = 90;

const pad2 = (n) => n.toString().padStart(2, '0');

function ymd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function hm(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
function formatDateChip(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function addMinutes(d, m) {
  const n = new Date(d);
  n.setMinutes(n.getMinutes() + m);
  return n;
}

function clampToWindow(d) {
  const earliest = addMinutes(new Date(), MIN_LEAD_MIN);
  const latest   = new Date();
  latest.setDate(latest.getDate() + MAX_LEAD_DAYS);
  if (d < earliest) return earliest;
  if (d > latest)   return latest;
  return d;
}

export default function ScheduleRideSheet({
  open,
  onClose,
  onConfirm,
  defaultTime,
  durationMins = 0,
}) {
  // Initialise to defaultTime (or now + 30 min) and round to next 5-min slot
  const [pickupAt, setPickupAt] = useState(() => {
    const start = defaultTime ? new Date(defaultTime) : addMinutes(new Date(), MIN_LEAD_MIN);
    start.setSeconds(0, 0);
    const remainder = start.getMinutes() % 5;
    if (remainder) start.setMinutes(start.getMinutes() + (5 - remainder));
    return clampToWindow(start);
  });

  // Reset when reopened
  useEffect(() => {
    if (!open) return;
    const start = defaultTime ? new Date(defaultTime) : addMinutes(new Date(), MIN_LEAD_MIN);
    start.setSeconds(0, 0);
    const remainder = start.getMinutes() % 5;
    if (remainder) start.setMinutes(start.getMinutes() + (5 - remainder));
    setPickupAt(clampToWindow(start));
  }, [open, defaultTime]);

  if (!open) return null;

  const earliest = addMinutes(new Date(), MIN_LEAD_MIN);
  const latest   = (() => {
    const d = new Date();
    d.setDate(d.getDate() + MAX_LEAD_DAYS);
    return d;
  })();

  const handleDateChange = (e) => {
    const [y, mo, d] = e.target.value.split('-').map(Number);
    if (!y) return;
    const next = new Date(pickupAt);
    next.setFullYear(y, mo - 1, d);
    setPickupAt(clampToWindow(next));
  };

  const handleTimeChange = (e) => {
    const [h, mi] = e.target.value.split(':').map(Number);
    if (Number.isNaN(h)) return;
    const next = new Date(pickupAt);
    next.setHours(h, mi || 0, 0, 0);
    setPickupAt(clampToWindow(next));
  };

  const dropoffAt = addMinutes(pickupAt, durationMins);

  return (
    <div className="sched-backdrop" onClick={onClose}>
      <div className="sched-sheet" onClick={(e) => e.stopPropagation()}>
        <header className="sched-header">
          <button className="sched-close" onClick={onClose} aria-label="Close">
            <X size={20} strokeWidth={2.2} color="#1a1a1a" />
          </button>
        </header>

        <h2 className="sched-title">Select pickup time</h2>
        <p className="sched-sub">From 30 min to 90 days in advance</p>

        <div className="sched-row">
          <span className="sched-label">Date</span>
          <label className="sched-chip">
            <span className="sched-chip-text">{formatDateChip(pickupAt)}</span>
            <input
              type="date"
              className="sched-native-input"
              value={ymd(pickupAt)}
              min={ymd(earliest)}
              max={ymd(latest)}
              onChange={handleDateChange}
            />
          </label>
        </div>
        <div className="sched-divider" />
        <div className="sched-row">
          <span className="sched-label">Pickup time</span>
          <label className="sched-chip">
            <span className="sched-chip-text">{hm(pickupAt)}</span>
            <input
              type="time"
              className="sched-native-input"
              value={hm(pickupAt)}
              onChange={handleTimeChange}
            />
          </label>
        </div>

        <p className="sched-est">
          Estimated dropoff: <strong>{hm(dropoffAt)}</strong>
        </p>
        <button type="button" className="sched-terms">
          Terms of Scheduled Rides
        </button>

        <button
          className="sched-continue"
          onClick={() => onConfirm(pickupAt)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
