/* ══════════════════════════════════════════════════════════════════
   Icons — standalone SVG files in /assets/icons/.
   Used as CSS `mask-image` so the icon tints to `currentColor` and
   stays crisp at any size. Vite's URL import gives us the asset URL.
   ══════════════════════════════════════════════════════════════════ */
import userSvg         from '../assets/icons/user.svg?url';
import bellSvg         from '../assets/icons/bell.svg?url';
import carSvg          from '../assets/icons/car.svg?url';
import phoneSvg        from '../assets/icons/phone.svg?url';
import walletSvg       from '../assets/icons/wallet.svg?url';
import usersSvg        from '../assets/icons/users.svg?url';
import clockSvg        from '../assets/icons/clock.svg?url';
import verifiedSvg     from '../assets/icons/verified.svg?url';
import starSvg         from '../assets/icons/star.svg?url';
import historySvg      from '../assets/icons/history.svg?url';
import shieldSvg       from '../assets/icons/shield.svg?url';
import helpSvg         from '../assets/icons/help.svg?url';
import settingsSvg     from '../assets/icons/settings.svg?url';
import globeSvg        from '../assets/icons/globe.svg?url';
import chevronLeftSvg  from '../assets/icons/chevron-left.svg?url';
import chevronRightSvg from '../assets/icons/chevron-right.svg?url';
import closeSvg        from '../assets/icons/close.svg?url';
import checkSvg        from '../assets/icons/check.svg?url';
import mapPinSvg       from '../assets/icons/map-pin.svg?url';
import creditCardSvg   from '../assets/icons/credit-card.svg?url';
import euroSvg         from '../assets/icons/euro.svg?url';
import messageSvg      from '../assets/icons/message.svg?url';
import navigationSvg   from '../assets/icons/navigation.svg?url';
import routeSvg        from '../assets/icons/route.svg?url';
import micSvg          from '../assets/icons/mic.svg?url';
import micOffSvg       from '../assets/icons/mic-off.svg?url';
import volumeSvg       from '../assets/icons/volume.svg?url';
import keypadSvg       from '../assets/icons/keypad.svg?url';
import phoneEndSvg     from '../assets/icons/phone-end.svg?url';
import './Icons.css';

function MaskIcon({ src, size = 24, width, height, className = '', style = {} }) {
  const w = width  ?? size;
  const h = height ?? size;
  // CSS-safe quoting: production builds inline small SVGs as
  // `data:image/svg+xml,%3csvg…xmlns='…'…%3c/svg%3e` URLs whose single
  // quotes break an unquoted `url(...)`. Wrap in double quotes so the
  // single quotes inside are contained.
  const url = `url("${src}")`;
  return (
    <span
      aria-hidden="true"
      className={`ico ${className}`}
      style={{
        width: w,
        height: h,
        WebkitMaskImage: url,
        maskImage: url,
        ...style,
      }}
    />
  );
}

export function UserIcon(props)         { return <MaskIcon src={userSvg}         {...props} />; }
export function BellIcon(props)         { return <MaskIcon src={bellSvg}         {...props} />; }
export function CarIcon(props)          { return <MaskIcon src={carSvg}          {...props} />; }
export function PhoneIcon(props)        { return <MaskIcon src={phoneSvg}        size={22} {...props} />; }
export function WalletIcon(props)       { return <MaskIcon src={walletSvg}       {...props} />; }
export function UsersIcon(props)        { return <MaskIcon src={usersSvg}        {...props} />; }
export function ClockIcon(props)        { return <MaskIcon src={clockSvg}        {...props} />; }
export function VerifiedIcon(props)     { return <MaskIcon src={verifiedSvg}     size={16} {...props} />; }
export function StarIcon(props)         { return <MaskIcon src={starSvg}         {...props} />; }
export function HistoryIcon(props)      { return <MaskIcon src={historySvg}      {...props} />; }
export function ShieldIcon(props)       { return <MaskIcon src={shieldSvg}       {...props} />; }
export function HelpIcon(props)         { return <MaskIcon src={helpSvg}         {...props} />; }
export function SettingsIcon(props)     { return <MaskIcon src={settingsSvg}     {...props} />; }
export function GlobeIcon(props)        { return <MaskIcon src={globeSvg}        {...props} />; }
export function ChevronLeftIcon(props)  { return <MaskIcon src={chevronLeftSvg}  {...props} />; }
export function ChevronRightIcon(props) { return <MaskIcon src={chevronRightSvg} {...props} />; }
export function CloseIcon(props)        { return <MaskIcon src={closeSvg}        {...props} />; }
export function CheckIcon(props)        { return <MaskIcon src={checkSvg}        {...props} />; }
export function MapPinIcon(props)       { return <MaskIcon src={mapPinSvg}       {...props} />; }
export function CreditCardIcon(props)   { return <MaskIcon src={creditCardSvg}   {...props} />; }
export function EuroIcon(props)         { return <MaskIcon src={euroSvg}         {...props} />; }
export function MessageIcon(props)      { return <MaskIcon src={messageSvg}      {...props} />; }
export function NavigationIcon(props)   { return <MaskIcon src={navigationSvg}   {...props} />; }
export function RouteIcon(props)        { return <MaskIcon src={routeSvg}        {...props} />; }
export function MicIcon(props)          { return <MaskIcon src={micSvg}          {...props} />; }
export function MicOffIcon(props)       { return <MaskIcon src={micOffSvg}       {...props} />; }
export function VolumeIcon(props)       { return <MaskIcon src={volumeSvg}       {...props} />; }
export function KeypadIcon(props)       { return <MaskIcon src={keypadSvg}       {...props} />; }
export function PhoneEndIcon(props)     { return <MaskIcon src={phoneEndSvg}     {...props} />; }
