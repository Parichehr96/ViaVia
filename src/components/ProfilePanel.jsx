import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useT, useLocale, useFontBoost, LOCALES } from '../i18n';
import {
  UserIcon, BellIcon, CarIcon, ClockIcon, StarIcon, HistoryIcon,
  ShieldIcon, HelpIcon, GlobeIcon, VerifiedIcon,
  ChevronLeftIcon, ChevronRightIcon, CloseIcon, CheckIcon,
} from './Icons';
import './ProfilePanel.css';

/* ══════════════════════════════════════════════════════════════════
   ProfilePanel — pixel-perfect main view + nested sub-pages.
   Sub-pages slide in over the main view; back button returns.
   ══════════════════════════════════════════════════════════════════ */

const PAGES = {
  PERSONAL:    'personal',
  VEHICLE:     'vehicle',
  AVAILABILITY:'availability',
  FAVORITES:   'favorites',
  HISTORY:     'history',
  PREFERENCES: 'preferences',
  LANGUAGE:    'language',
  FONT_SIZE:   'font-size',
  PRIVACY:     'privacy',
  HELP:        'help',
};

// ── Generic menu row ─────────────────────────────────────────────
function MenuItem({ icon: Icon, label, onClick, withChevron = true, value, danger }) {
  return (
    <button className={`pp-item${danger ? ' danger' : ''}`} onClick={onClick}>
      {Icon && (
        <span className="pp-item-icon-slot">
          <Icon size={22} style={{ color: danger ? '#e85733' : '#1a1a1a' }} />
        </span>
      )}
      <span className="pp-item-label">{label}</span>
      {value && <span className="pp-item-value">{value}</span>}
      {withChevron && <ChevronRightIcon size={14} style={{ color: 'rgba(0,0,0,0.4)' }} />}
    </button>
  );
}

// ── Toggle switch ────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      className={`pp-toggle${checked ? ' on' : ''}`}
      onClick={() => onChange?.(!checked)}
      aria-pressed={checked}
      aria-label="Toggle"
      type="button"
    >
      <span className="pp-toggle-knob" />
    </button>
  );
}

// ── Sub-page chrome (back button + title) ────────────────────────
function SubPage({ title, onBack, children }) {
  return (
    <div className="pp-subpage">
      <header className="pp-subheader">
        <button className="pp-subback" onClick={onBack} aria-label="Back">
          <ChevronLeftIcon size={20} style={{ color: '#1a1a1a' }} />
        </button>
        <h2 className="pp-subtitle">{title}</h2>
        <span className="pp-subspacer" />
      </header>
      <div className="pp-subbody">{children}</div>
    </div>
  );
}

// ── Form row used by sub-pages ───────────────────────────────────
function FormRow({ label, value, readOnly = true }) {
  return (
    <label className="pp-form-row">
      <span className="pp-form-label">{label}</span>
      <input className="pp-form-input" defaultValue={value} readOnly={readOnly} />
    </label>
  );
}

// ── Sub-pages ────────────────────────────────────────────────────
function PersonalInfoPage({ onBack }) {
  const t = useT();
  return (
    <SubPage title={t('profile.personal')} onBack={onBack}>
      <FormRow label={t('pers.name')}  value="John Doe" />
      <FormRow label={t('pers.email')} value="john.doe@viavia.app" />
      <FormRow label={t('pers.phone')} value="+31 6 12 34 56 78" />
      <FormRow label={t('pers.id')}    value="•••••• 4821" />
    </SubPage>
  );
}

function VehicleInfoPage({ onBack }) {
  const t = useT();
  return (
    <SubPage title={t('profile.vehicle')} onBack={onBack}>
      <FormRow label={t('veh.make')}  value="Volkswagen" />
      <FormRow label={t('veh.model')} value="ID.3" />
      <FormRow label={t('veh.year')}  value="2024" />
      <FormRow label={t('veh.color')} value="White" />
      <FormRow label={t('veh.plate')} value="NL-XX-001" />
      <FormRow label={t('veh.seats')} value="4" />
    </SubPage>
  );
}

function AvailabilityPage({ onBack }) {
  const t = useT();
  const days = [
    { key: 'mon', enabled: true  },
    { key: 'tue', enabled: true  },
    { key: 'wed', enabled: false },
    { key: 'thu', enabled: true  },
    { key: 'fri', enabled: true  },
    { key: 'sat', enabled: false },
    { key: 'sun', enabled: false },
  ];
  const [state, setState] = useState(() => Object.fromEntries(days.map(d => [d.key, d.enabled])));
  return (
    <SubPage title={t('avail.title')} onBack={onBack}>
      <p className="pp-sub-help">{t('avail.sub')}</p>
      <div className="pp-avail-grid">
        {days.map(d => (
          <button
            key={d.key}
            className={`pp-avail-day${state[d.key] ? ' on' : ''}`}
            onClick={() => setState(s => ({ ...s, [d.key]: !s[d.key] }))}
          >
            {t(`avail.weekday.${d.key}`)}
          </button>
        ))}
      </div>
      <div className="pp-form-row">
        <span className="pp-form-label">From</span>
        <input className="pp-form-input" type="time" defaultValue="08:00" />
      </div>
      <div className="pp-form-row">
        <span className="pp-form-label">To</span>
        <input className="pp-form-input" type="time" defaultValue="18:00" />
      </div>
    </SubPage>
  );
}

function FavoritesPage({ onBack }) {
  const t = useT();
  const places = [
    { name: 'Home',     addr: 'Jordaan, Amsterdam' },
    { name: 'Work',     addr: 'Zuidas, Amsterdam' },
    { name: 'Hospital', addr: 'AMC Amsterdam'     },
  ];
  return (
    <SubPage title={t('profile.favorites')} onBack={onBack}>
      <ul className="pp-list">
        {places.map(p => (
          <li key={p.name}>
            <div className="pp-row">
              <StarIcon size={22} style={{ color: '#ff6038' }} />
              <div className="pp-row-text">
                <span className="pp-row-label">{p.name}</span>
                <span className="pp-row-sub">{p.addr}</span>
              </div>
              <ChevronRightIcon size={14} style={{ color: 'rgba(0,0,0,0.4)' }} />
            </div>
          </li>
        ))}
      </ul>
      <button className="pp-add-btn">{t('fav.add')}</button>
    </SubPage>
  );
}

function HistoryPage({ onBack }) {
  const t = useT();
  const history = [
    { date: 'Apr 22 2026', from: 'Jordaan',           to: 'Schiphol',        price: '€ 14.20' },
    { date: 'Apr 18 2026', from: 'Centrum',           to: 'Vondelpark',      price: '€ 4.80'  },
    { date: 'Apr 12 2026', from: 'Amsterdam Central', to: 'Dam Square',      price: '€ 2.60'  },
  ];
  return (
    <SubPage title={t('profile.history')} onBack={onBack}>
      {history.length === 0 ? (
        <p className="pp-sub-help">{t('hist.empty')}</p>
      ) : (
        <ul className="pp-list">
          {history.map((h) => (
            <li key={h.date}>
              <div className="pp-row pp-row-history">
                <HistoryIcon size={22} style={{ color: '#1a1a1a' }} />
                <div className="pp-row-text">
                  <span className="pp-row-label">{h.from} → {h.to}</span>
                  <span className="pp-row-sub">{h.date}</span>
                </div>
                <span className="pp-row-price">{h.price}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SubPage>
  );
}

function PreferencesPage({ onBack, onNavigate }) {
  const t = useT();
  const { locale } = useLocale();
  const { fontBoost } = useFontBoost();
  const langName = LOCALES.find(l => l.code === locale)?.native || 'English';
  const [notif, setNotif] = useState(true);
  const [units, setUnits] = useState('km');
  return (
    <SubPage title={t('profile.preferences')} onBack={onBack}>
      <ul className="pp-list">
        <li>
          <button className="pp-row" onClick={() => onNavigate(PAGES.LANGUAGE)}>
            <GlobeIcon size={22} style={{ color: '#1a1a1a' }} />
            <span className="pp-row-label">{t('prefs.language')}</span>
            <span className="pp-row-value">{langName}</span>
            <ChevronRightIcon size={14} style={{ color: 'rgba(0,0,0,0.4)' }} />
          </button>
        </li>
        <li>
          <button className="pp-row" onClick={() => onNavigate(PAGES.FONT_SIZE)}>
            {/* Two stacked A glyphs as a quick visual cue for the font-size step */}
            <span className="pp-row-glyph" aria-hidden="true">
              <span className="pp-row-glyph-sm">A</span>
              <span className="pp-row-glyph-lg">A</span>
            </span>
            <span className="pp-row-label">{t('prefs.fontSize')}</span>
            <span className="pp-row-value">{t('prefs.fontSize.level', { n: fontBoost })}</span>
            <ChevronRightIcon size={14} style={{ color: 'rgba(0,0,0,0.4)' }} />
          </button>
        </li>
        <li>
          <div className="pp-row">
            <BellIcon size={22} style={{ color: '#1a1a1a' }} />
            <span className="pp-row-label">{t('prefs.notifications')}</span>
            <Toggle checked={notif} onChange={setNotif} />
          </div>
        </li>
        <li>
          <button
            className="pp-row"
            onClick={() => setUnits(u => u === 'km' ? 'mi' : 'km')}
          >
            <ClockIcon size={22} style={{ color: '#1a1a1a' }} />
            <span className="pp-row-label">{t('prefs.distance')}</span>
            <span className="pp-row-value">{units === 'km' ? 'km' : 'mi'}</span>
          </button>
        </li>
      </ul>
    </SubPage>
  );
}

function FontSizePage({ onBack }) {
  const t = useT();
  const { fontBoost, setFontBoost, min, max } = useFontBoost();
  const levels = [];
  for (let n = min; n <= max; n++) levels.push(n);
  return (
    <SubPage title={t('prefs.fontSize')} onBack={onBack}>
      <p className="pp-sub-help">{t('prefs.fontSize.help')}</p>

      {/* Live preview — its inherited font-size scales with --fb */}
      <div className="pp-fs-preview">
        <p className="pp-fs-preview-title">{t('prefs.fontSize.previewTitle')}</p>
        <p className="pp-fs-preview-body">{t('prefs.fontSize.previewBody')}</p>
      </div>

      {/* 1..5 segmented stepper */}
      <div className="pp-fs-stepper" role="radiogroup" aria-label={t('prefs.fontSize')}>
        {levels.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={fontBoost === n}
            className={`pp-fs-step${fontBoost === n ? ' active' : ''}`}
            onClick={() => setFontBoost(n)}
          >
            <span className="pp-fs-step-glyph" style={{ fontSize: `${12 + (n - 1) * 2}px` }}>A</span>
            <span className="pp-fs-step-label">{n}</span>
          </button>
        ))}
      </div>

      <p className="pp-sub-help" style={{ marginTop: 4 }}>
        {t('prefs.fontSize.note', { n: fontBoost - 1 })}
      </p>
    </SubPage>
  );
}

function LanguagePage({ onBack }) {
  const t = useT();
  const { locale, setLocale } = useLocale();
  return (
    <SubPage title={t('lang.title')} onBack={onBack}>
      <p className="pp-sub-help">{t('lang.sub')}</p>
      <ul className="pp-list">
        {LOCALES.map(l => (
          <li key={l.code}>
            <button className="pp-row" onClick={() => setLocale(l.code)}>
              <span className="pp-lang-code">{l.code.toUpperCase()}</span>
              <span className="pp-row-text">
                <span className="pp-row-label">{l.native}</span>
                <span className="pp-row-sub">{l.label}</span>
              </span>
              {locale === l.code && (
                <CheckIcon size={20} style={{ color: '#ff6038' }} />
              )}
            </button>
          </li>
        ))}
      </ul>
    </SubPage>
  );
}

function PrivacyPage({ onBack }) {
  const t = useT();
  return (
    <SubPage title={t('profile.privacy')} onBack={onBack}>
      <p className="pp-prose">{t('priv.body')}</p>
    </SubPage>
  );
}

function HelpPage({ onBack }) {
  const t = useT();
  return (
    <SubPage title={t('profile.help')} onBack={onBack}>
      <h3 className="pp-section-title">{t('help.faq')}</h3>
      <ul className="pp-list">
        <li>
          <div className="pp-row pp-row-faq">
            <HelpIcon size={20} style={{ color: '#1a1a1a' }} />
            <span className="pp-row-label">How does ViaVia work?</span>
          </div>
        </li>
        <li>
          <div className="pp-row pp-row-faq">
            <HelpIcon size={20} style={{ color: '#1a1a1a' }} />
            <span className="pp-row-label">How are payments handled?</span>
          </div>
        </li>
        <li>
          <div className="pp-row pp-row-faq">
            <HelpIcon size={20} style={{ color: '#1a1a1a' }} />
            <span className="pp-row-label">Cancellation policy</span>
          </div>
        </li>
      </ul>
      <h3 className="pp-section-title">{t('help.contact')}</h3>
      <p className="pp-prose">{t('help.contactBody')}</p>
    </SubPage>
  );
}

// ── Main view ─────────────────────────────────────────────────────
function MainView({ onClose, onNavigate }) {
  const t = useT();
  return (
    <>
      <div className="pp-header">
        <div className="pp-header-inner">
          <div className="pp-avatar-wrap">
            <UserIcon size={32} style={{ color: '#1a1a1a' }} />
          </div>
          <div className="pp-identity">
            <p className="pp-name">John Doe</p>
            <div className="pp-role-row">
              <span className="pp-role">{t('header.role.driver')}</span>
              <VerifiedIcon size={14} style={{ color: '#ff6038' }} />
            </div>
          </div>
        </div>
        <button className="pp-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={20} style={{ color: '#1a1a1a' }} />
        </button>
      </div>

      <div className="pp-body">
        <div className="pp-stats">
          <div className="pp-stat">
            <span className="pp-stat-val">Nov 2026</span>
            <span className="pp-stat-lbl">{t('profile.stat.joined')}</span>
          </div>
          <div className="pp-stat-sep" />
          <div className="pp-stat">
            <span className="pp-stat-val">12h 32m</span>
            <span className="pp-stat-lbl">{t('profile.stat.contrib')}</span>
          </div>
          <div className="pp-stat-sep" />
          <div className="pp-stat">
            <span className="pp-stat-val">10</span>
            <span className="pp-stat-lbl">{t('profile.stat.rides')}</span>
          </div>
        </div>

        <div className="pp-rule" />
        <MenuItem icon={UserIcon}    label={t('profile.personal')}     onClick={() => onNavigate(PAGES.PERSONAL)} />
        <div className="pp-rule" />
        <MenuItem icon={CarIcon}     label={t('profile.vehicle')}      onClick={() => onNavigate(PAGES.VEHICLE)} />
        <div className="pp-rule" />

        <div className="pp-group">
          <MenuItem icon={ClockIcon}   label={t('profile.availability')} onClick={() => onNavigate(PAGES.AVAILABILITY)} />
          <MenuItem icon={StarIcon}    label={t('profile.favorites')}    onClick={() => onNavigate(PAGES.FAVORITES)} />
          <MenuItem icon={HistoryIcon} label={t('profile.history')}      onClick={() => onNavigate(PAGES.HISTORY)} />
        </div>
        <div className="pp-rule" />

        <MenuItem label={t('profile.preferences')} onClick={() => onNavigate(PAGES.PREFERENCES)} />
        <MenuItem label={t('profile.privacy')}     onClick={() => onNavigate(PAGES.PRIVACY)} />
        <MenuItem label={t('profile.help')}        onClick={() => onNavigate(PAGES.HELP)} />
      </div>
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────
export default function ProfilePanel() {
  const { profileOpen, setProfileOpen } = useApp();
  const [page, setPage] = useState(null);

  // Reset to main view whenever the panel is closed
  useEffect(() => { if (!profileOpen) setPage(null); }, [profileOpen]);

  const close = () => setProfileOpen(false);
  const back  = () => setPage(null);
  // Sub-page → sub-page navigation (used for Preferences → Language)
  const goPrefsBack = () => setPage(PAGES.PREFERENCES);

  return (
    <>
      <div
        className={`pp-overlay${profileOpen ? ' visible' : ''}`}
        onClick={close}
      />
      <aside className={`pp-panel${profileOpen ? ' open' : ''}`}>
        {page === null              && <MainView onClose={close} onNavigate={setPage} />}
        {page === PAGES.PERSONAL    && <PersonalInfoPage onBack={back} />}
        {page === PAGES.VEHICLE     && <VehicleInfoPage onBack={back} />}
        {page === PAGES.AVAILABILITY&& <AvailabilityPage onBack={back} />}
        {page === PAGES.FAVORITES   && <FavoritesPage onBack={back} />}
        {page === PAGES.HISTORY     && <HistoryPage onBack={back} />}
        {page === PAGES.PREFERENCES && <PreferencesPage onBack={back} onNavigate={setPage} />}
        {page === PAGES.LANGUAGE    && <LanguagePage onBack={goPrefsBack} />}
        {page === PAGES.FONT_SIZE   && <FontSizePage onBack={goPrefsBack} />}
        {page === PAGES.PRIVACY     && <PrivacyPage onBack={back} />}
        {page === PAGES.HELP        && <HelpPage onBack={back} />}
      </aside>
    </>
  );
}
