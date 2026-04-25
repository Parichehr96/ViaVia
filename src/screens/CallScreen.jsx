import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';
import {
  MicIcon, MicOffIcon, VolumeIcon, KeypadIcon, PhoneEndIcon,
} from '../components/Icons';
import './CallScreen.css';

/* ══════════════════════════════════════════════════════════════════
   CallScreen — simulated phone call to the ViaVia helpline.
   "Calling…" for ~1.6 s → "Connected" with a live mm:ss timer.
   In-call toggles: mute, speaker, keypad. End call → close.
   ══════════════════════════════════════════════════════════════════ */

const HOTLINE = '+31 20 123 4567';
const ASSIGNED_OPERATOR = 'Daan';

function pad(n) { return String(n).padStart(2, '0'); }
function formatDuration(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${pad(m)}:${pad(r)}`;
}

export default function CallScreen() {
  const { callOpen, closeCall } = useApp();
  const t = useT();

  const [phase,     setPhase]     = useState('calling'); // 'calling' | 'connected'
  const [seconds,   setSeconds]   = useState(0);
  const [muted,     setMuted]     = useState(false);
  const [speaker,   setSpeaker]   = useState(false);
  const [keypadOn,  setKeypadOn]  = useState(false);

  // Reset every time the call opens; simulate "connected" after 1.6s
  useEffect(() => {
    if (!callOpen) return;
    setPhase('calling');
    setSeconds(0);
    setMuted(false);
    setSpeaker(false);
    setKeypadOn(false);
    const conn = setTimeout(() => setPhase('connected'), 1600);
    return () => clearTimeout(conn);
  }, [callOpen]);

  // 1-second tick once connected
  useEffect(() => {
    if (!callOpen || phase !== 'connected') return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [callOpen, phase]);

  if (!callOpen) return null;

  const status = phase === 'calling'
    ? t('call.connecting')
    : formatDuration(seconds);

  return (
    <div className="cs-overlay">
      <div className="cs-bg" aria-hidden="true" />

      {/* Top status */}
      <div className="cs-top">
        <p className="cs-status">{status}</p>
        <p className="cs-hotline">{HOTLINE}</p>
      </div>

      {/* Avatar + name */}
      <div className="cs-center">
        <div className={`cs-avatar${phase === 'calling' ? ' calling' : ''}`}>
          <span className="cs-avatar-mark">V</span>
          <span className="cs-avatar-pulse" aria-hidden="true" />
          <span className="cs-avatar-pulse delay" aria-hidden="true" />
        </div>
        <p className="cs-name">{t('call.name')}</p>
        <p className="cs-sub">
          {phase === 'calling'
            ? t('call.subCalling')
            : t('call.subConnected', { operator: ASSIGNED_OPERATOR })}
        </p>
      </div>

      {/* Controls */}
      <div className="cs-controls">
        <button
          type="button"
          className={`cs-control${muted ? ' on' : ''}`}
          onClick={() => setMuted((m) => !m)}
        >
          <span className="cs-control-face">
            {muted
              ? <MicOffIcon size={24} style={{ color: '#1a1a1a' }} />
              : <MicIcon    size={24} style={{ color: '#ffffff' }} />}
          </span>
          <span className="cs-control-lbl">
            {muted ? t('call.unmute') : t('call.mute')}
          </span>
        </button>
        <button
          type="button"
          className={`cs-control${keypadOn ? ' on' : ''}`}
          onClick={() => setKeypadOn((v) => !v)}
        >
          <span className="cs-control-face">
            <KeypadIcon size={24} style={{ color: keypadOn ? '#1a1a1a' : '#ffffff' }} />
          </span>
          <span className="cs-control-lbl">{t('call.keypad')}</span>
        </button>
        <button
          type="button"
          className={`cs-control${speaker ? ' on' : ''}`}
          onClick={() => setSpeaker((v) => !v)}
        >
          <span className="cs-control-face">
            <VolumeIcon size={24} style={{ color: speaker ? '#1a1a1a' : '#ffffff' }} />
          </span>
          <span className="cs-control-lbl">{t('call.speaker')}</span>
        </button>
      </div>

      {/* End call */}
      <div className="cs-end-row">
        <button type="button" className="cs-end-btn" onClick={closeCall} aria-label={t('call.end')}>
          <PhoneEndIcon size={28} style={{ color: '#ffffff' }} />
        </button>
        <p className="cs-end-lbl">{t('call.end')}</p>
      </div>
    </div>
  );
}
