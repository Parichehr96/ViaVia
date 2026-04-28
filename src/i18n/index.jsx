/* ══════════════════════════════════════════════════════════════════
   i18n — minimal translation layer.
   Add new keys at the bottom of `dictionaries.en` first, then mirror
   them in every other locale. Missing keys fall back to the key itself.
   ══════════════════════════════════════════════════════════════════ */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'viavia.locale';
export const LOCALES = [
  { code: 'en', label: 'English',    native: 'English'    },
  { code: 'nl', label: 'Dutch',      native: 'Nederlands' },
  { code: 'de', label: 'German',     native: 'Deutsch'    },
  { code: 'fr', label: 'French',     native: 'Français'   },
];

const dictionaries = {
  en: {
    /* — Bottom nav — */
    'nav.ride':            'Ride',
    'nav.wallet':          'Wallet',
    'nav.community':       'Community',

    /* — Header — */
    'header.greeting':     'Hi, {name}!',
    'header.role.driver':  'Verified Driver',
    'header.tagline':      'Helping each other get around Zeeland!',

    /* — Home — */
    'home.cta.title':      'Need to be somewhere?',
    'home.cta.request':    'Request a Ride',
    'home.cta.call':       'Call for a Ride',
    'home.myrides':        'My Rides',
    'home.tab.driving':    "I'm Driving",
    'home.tab.riding':     "I'm Getting a Ride",
    'home.empty':          'You have no active rides at the moment.',
    'home.empty.browseCta':'See who needs a ride',
    'home.now':            'Now',

    /* — Wallet — */
    'wallet.balance':      'Credit balance',
    'wallet.send':         'Send',
    'wallet.receive':      'Receive',
    'wallet.transactions': 'Transactions',
    'wallet.offers':       'Offers for you',

    /* — Community — */
    'community.friends':       'My Friends',
    'community.requests':      'Ride Requests',
    'community.rides':         '{n} Rides',
    'community.accept':        'Accept',
    'community.moreinfo':      'More Info',

    /* — Request flow — */
    'rrs.title':                  'Request a ride',
    'rrs.pickup.placeholder':     'Current location',
    'rrs.dropoff.placeholder':    'Dropoff location',
    'rrs.recents.searching':      'Searching nearby places…',
    'rrs.recents.empty':          'No matching addresses',
    'rrs.confirm.destination':    'Confirm Destination',
    'rrs.confirm.ride':           'Confirm Ride',
    'rrs.map.confirm.pickup':     'Confirm pickup',
    'rrs.map.confirm.dropoff':    'Confirm destination',
    'rrs.map.tap.hint':           'Tap the map to drop a pin',
    'rrs.map.locating':           'Locating…',
    'rrs.map.title.pickup':       'Choose pickup on map',
    'rrs.map.title.dropoff':      'Choose destination on map',
    'rrs.pay.apple':              'Apple Pay',
    'rrs.pay.cash':               'Cash payment',
    'rrs.pay.credit':             'Credit payment',
    'rrs.scheduled.for':          'Scheduled for {when}',
    'rrs.scheduled.edit':         'Edit',

    /* — Schedule sheet — */
    'sched.title':         'Select pickup time',
    'sched.sub':           'From 30 min to 90 days in advance',
    'sched.date':          'Date',
    'sched.time':          'Pickup time',
    'sched.dropoff':       'Estimated dropoff:',
    'sched.terms':         'Terms of Scheduled Rides',
    'sched.continue':      'Continue',

    /* — Profile menu — */
    'profile.personal':       'Personal Information',
    'profile.vehicle':        'Vehicle Information',
    'profile.availability':   'Availability',
    'profile.favorites':      'Favorite places',
    'profile.history':        'Ride History',
    'profile.preferences':    'Preferences',
    'profile.privacy':        'Privacy & Policy',
    'profile.help':           'Help',
    'profile.stat.joined':    'Joined',
    'profile.stat.contrib':   'Contribution',
    'profile.stat.rides':     'Rides',

    /* — Preferences sub-page — */
    'prefs.language':         'Language',
    'prefs.notifications':    'Notifications',
    'prefs.distance':         'Distance unit',
    'prefs.theme':            'Theme',

    /* — Language sub-page — */
    'lang.title':             'Language',
    'lang.sub':               'Choose the language for the whole app.',

    /* — Personal info — */
    'pers.name':              'Full name',
    'pers.email':             'Email',
    'pers.phone':             'Phone',
    'pers.id':                'National ID',

    /* — Vehicle info — */
    'veh.make':               'Make',
    'veh.model':              'Model',
    'veh.year':               'Year',
    'veh.color':              'Color',
    'veh.plate':              'License plate',
    'veh.seats':              'Seats',

    /* — Availability — */
    'avail.title':            'Availability',
    'avail.sub':              'Pick the days and hours you can offer rides.',
    'avail.weekday.mon':      'Mon',
    'avail.weekday.tue':      'Tue',
    'avail.weekday.wed':      'Wed',
    'avail.weekday.thu':      'Thu',
    'avail.weekday.fri':      'Fri',
    'avail.weekday.sat':      'Sat',
    'avail.weekday.sun':      'Sun',

    /* — Favorites — */
    'fav.add':                'Add a favorite place',
    'fav.empty':              "You haven't saved any places yet.",

    /* — Ride history — */
    'hist.empty':             'Your past rides will show up here.',

    /* — Privacy / Help — */
    'priv.body':              'We respect your privacy. ViaVia stores only the minimum data needed to match you with rides in your community. You can request export or deletion of your account at any time.',
    'help.faq':               'Frequently asked questions',
    'help.contact':           'Contact support',
    'help.contactBody':       'Email support@viavia.app or call +31 20 123 4567 weekdays 9:00–17:00.',

    /* — Common — */
    'common.back':            'Back',
    'common.save':            'Save',
    'common.cancel':          'Cancel',
    'common.edit':            'Edit',
    'common.close':           'Close',

    /* — Notifications panel — */
    'notif.title':            'Notifications',
    'notif.markAllRead':      'Mark all read',
    'notif.empty':            'No notifications yet',

    /* — Ride detail sheet — */
    'rds.title':              'Ride Details',
    'rds.pickup':             'Pickup:',
    'rds.dropoff':            'Drop-off:',
    'rds.free':               'Free (community ride)',
    'rds.pickupNote':         'Exact pickup shared after confirmation',
    'rds.verifiedMember':     'Verified Member',
    'rds.sharedCommunities':  '{n} shared communities',
    'rds.acceptRide':         'Accept Ride',
    'rds.startRide':          'Start Ride',
    'rds.chat':               'Chat with Passenger',
    'rds.chatBefore':         'Chat with {name}',

    /* — Driver in-ride flow — */
    'drs.passenger':          'Passenger',
    'drs.call':               'Call passenger',
    'drs.cancel':             'Cancel ride',
    'drs.status.heading':     'Heading to pickup',
    'drs.status.enroute':     'On the way · {min} min',
    'drs.status.arrived':     'Arrived at pickup — waiting',
    'drs.status.inprogress':  'On trip · {min} min to arrival',
    'drs.cta.start':          'Start the ride',
    'drs.cta.arrived':        "I've arrived",
    'drs.cta.begin':          'Begin trip',
    'drs.cta.complete':       'Complete trip',
    'drs.status.ready':       'Ready when you are',
    'drs.summary.title':      'Trip completed',
    'drs.summary.sub':        'Thanks for driving {name}.',
    'drs.summary.duration':   'Duration',
    'drs.summary.distance':   'Distance',
    'drs.summary.earnings':   'Earnings',
    'drs.summary.done':       'Done',

    /* — Call screen (Call for a Ride hotline) — */
    'call.connecting':        'Calling…',
    'call.name':              'ViaVia Helpline',
    'call.subCalling':        'A community operator will pick up shortly.',
    'call.subConnected':      "{operator} from ViaVia is here to help — tell them where you'd like to go.",
    'call.mute':              'Mute',
    'call.unmute':            'Unmute',
    'call.keypad':            'Keypad',
    'call.speaker':           'Speaker',
    'call.end':               'End call',
  },

  nl: {
    'nav.ride':            'Rit',
    'nav.wallet':          'Portemonnee',
    'nav.community':       'Community',

    'header.greeting':     'Hoi, {name}!',
    'header.role.driver':  'Geverifieerde chauffeur',
    'header.tagline':      'Samen Zeeland doorkruisen!',

    'home.cta.title':      'Moet je ergens heen?',
    'home.cta.request':    'Vraag een rit aan',
    'home.cta.call':       'Bel voor een rit',
    'home.myrides':        'Mijn ritten',
    'home.tab.driving':    'Ik rijd',
    'home.tab.riding':     'Ik krijg een rit',
    'home.empty':          'Je hebt op dit moment geen actieve ritten.',
    'home.empty.browseCta':'Kijk wie een rit nodig heeft',
    'home.now':            'Nu',

    'wallet.balance':      'Tegoed',
    'wallet.send':         'Versturen',
    'wallet.receive':      'Ontvangen',
    'wallet.transactions': 'Transacties',
    'wallet.offers':       'Aanbiedingen voor jou',

    'community.friends':       'Mijn vrienden',
    'community.requests':      'Ritaanvragen',
    'community.rides':         '{n} ritten',
    'community.accept':        'Accepteren',
    'community.moreinfo':      'Meer info',

    'rrs.title':                  'Vraag een rit aan',
    'rrs.pickup.placeholder':     'Huidige locatie',
    'rrs.dropoff.placeholder':    'Bestemming',
    'rrs.recents.searching':      'Plaatsen in de buurt zoeken…',
    'rrs.recents.empty':          'Geen overeenkomstige adressen',
    'rrs.confirm.destination':    'Bestemming bevestigen',
    'rrs.confirm.ride':           'Rit bevestigen',
    'rrs.map.confirm.pickup':     'Ophaalpunt bevestigen',
    'rrs.map.confirm.dropoff':    'Bestemming bevestigen',
    'rrs.map.tap.hint':           'Tik op de kaart om een pin te zetten',
    'rrs.map.locating':           'Locatie zoeken…',
    'rrs.map.title.pickup':       'Kies ophaalpunt op de kaart',
    'rrs.map.title.dropoff':      'Kies bestemming op de kaart',
    'rrs.pay.apple':              'Apple Pay',
    'rrs.pay.cash':               'Contante betaling',
    'rrs.pay.credit':             'Betaling met krediet',
    'rrs.scheduled.for':          'Gepland voor {when}',
    'rrs.scheduled.edit':         'Wijzigen',

    'sched.title':         'Kies ophaaltijd',
    'sched.sub':           'Van 30 min tot 90 dagen vooruit',
    'sched.date':          'Datum',
    'sched.time':          'Ophaaltijd',
    'sched.dropoff':       'Verwachte aankomst:',
    'sched.terms':         'Voorwaarden voor geplande ritten',
    'sched.continue':      'Doorgaan',

    'profile.personal':       'Persoonlijke gegevens',
    'profile.vehicle':        'Voertuiggegevens',
    'profile.availability':   'Beschikbaarheid',
    'profile.favorites':      'Favoriete plaatsen',
    'profile.history':        'Ritgeschiedenis',
    'profile.preferences':    'Voorkeuren',
    'profile.privacy':        'Privacy & beleid',
    'profile.help':           'Hulp',
    'profile.stat.joined':    'Lid sinds',
    'profile.stat.contrib':   'Bijdrage',
    'profile.stat.rides':     'Ritten',

    'prefs.language':         'Taal',
    'prefs.notifications':    'Meldingen',
    'prefs.distance':         'Afstandseenheid',
    'prefs.theme':            'Thema',

    'lang.title':             'Taal',
    'lang.sub':               'Kies de taal voor de hele app.',

    'pers.name':              'Volledige naam',
    'pers.email':             'E-mail',
    'pers.phone':             'Telefoon',
    'pers.id':                'BSN',

    'veh.make':               'Merk',
    'veh.model':              'Model',
    'veh.year':               'Bouwjaar',
    'veh.color':              'Kleur',
    'veh.plate':              'Kenteken',
    'veh.seats':              'Zitplaatsen',

    'avail.title':            'Beschikbaarheid',
    'avail.sub':              'Kies de dagen en uren dat je ritten kunt aanbieden.',
    'avail.weekday.mon':      'Ma',
    'avail.weekday.tue':      'Di',
    'avail.weekday.wed':      'Wo',
    'avail.weekday.thu':      'Do',
    'avail.weekday.fri':      'Vr',
    'avail.weekday.sat':      'Za',
    'avail.weekday.sun':      'Zo',

    'fav.add':                'Favoriete plek toevoegen',
    'fav.empty':              'Je hebt nog geen plekken opgeslagen.',

    'hist.empty':             'Eerdere ritten verschijnen hier.',

    'priv.body':              'We respecteren je privacy. ViaVia bewaart alleen de minimaal benodigde gegevens om je met ritten in jouw community te matchen. Je kunt op elk moment een export of verwijdering van je account aanvragen.',
    'help.faq':               'Veelgestelde vragen',
    'help.contact':           'Contact opnemen',
    'help.contactBody':       'Mail support@viavia.app of bel +31 20 123 4567 op werkdagen van 9:00–17:00.',

    'common.back':            'Terug',
    'common.save':            'Opslaan',
    'common.cancel':          'Annuleren',
    'common.edit':            'Wijzigen',
    'common.close':           'Sluiten',

    'notif.title':            'Meldingen',
    'notif.markAllRead':      'Alles gelezen',
    'notif.empty':            'Nog geen meldingen',

    'rds.title':              'Ritdetails',
    'rds.pickup':             'Ophalen:',
    'rds.dropoff':            'Bestemming:',
    'rds.free':               'Gratis (community-rit)',
    'rds.pickupNote':         'Het exacte ophaaladres wordt na bevestiging gedeeld',
    'rds.verifiedMember':     'Geverifieerd lid',
    'rds.sharedCommunities':  '{n} gedeelde communities',
    'rds.acceptRide':         'Rit accepteren',
    'rds.startRide':          'Rit starten',
    'rds.chat':               'Chat met passagier',
    'rds.chatBefore':         'Chat met {name}',

    'drs.passenger':          'Passagier',
    'drs.call':               'Bel passagier',
    'drs.cancel':             'Rit annuleren',
    'drs.status.heading':     'Onderweg naar ophaalpunt',
    'drs.status.enroute':     'Onderweg · over {min} min',
    'drs.status.arrived':     'Aangekomen bij ophaalpunt — wachten',
    'drs.status.inprogress':  'Op rit · {min} min tot aankomst',
    'drs.cta.start':          'Start de rit',
    'drs.cta.arrived':        'Ik ben er',
    'drs.cta.begin':          'Trip starten',
    'drs.cta.complete':       'Trip afronden',
    'drs.status.ready':       'Klaar wanneer jij bent',
    'drs.summary.title':      'Rit voltooid',
    'drs.summary.sub':        'Bedankt voor het rijden van {name}.',
    'drs.summary.duration':   'Duur',
    'drs.summary.distance':   'Afstand',
    'drs.summary.earnings':   'Verdiensten',
    'drs.summary.done':       'Klaar',

    'call.connecting':        'Bellen…',
    'call.name':              'ViaVia Hulplijn',
    'call.subCalling':        'Een community-medewerker neemt zo op.',
    'call.subConnected':      '{operator} van ViaVia helpt je — vertel waar je naartoe wil.',
    'call.mute':              'Dempen',
    'call.unmute':            'Dempen uit',
    'call.keypad':            'Toetsen',
    'call.speaker':           'Speaker',
    'call.end':               'Ophangen',
  },

  de: {
    'nav.ride': 'Fahrt', 'nav.wallet': 'Wallet', 'nav.community': 'Community',
    'header.greeting': 'Hi, {name}!', 'header.role.driver': 'Verifizierter Fahrer',
    'header.tagline': 'Gemeinsam Zeeland erkunden!',
    'home.cta.title': 'Musst du irgendwohin?', 'home.cta.request': 'Fahrt anfragen',
    'home.cta.call': 'Fahrt anrufen', 'home.myrides': 'Meine Fahrten',
    'home.tab.driving': 'Ich fahre', 'home.tab.riding': 'Ich werde gefahren',
    'home.empty': 'Aktuell hast du keine aktiven Fahrten.', 'home.now': 'Jetzt',
    'profile.personal': 'Persönliche Daten', 'profile.vehicle': 'Fahrzeugdaten',
    'profile.availability': 'Verfügbarkeit', 'profile.favorites': 'Lieblingsorte',
    'profile.history': 'Fahrtenverlauf', 'profile.preferences': 'Einstellungen',
    'profile.privacy': 'Datenschutz', 'profile.help': 'Hilfe',
    'profile.stat.joined': 'Beigetreten', 'profile.stat.contrib': 'Beitrag',
    'profile.stat.rides': 'Fahrten',
    'prefs.language': 'Sprache', 'lang.title': 'Sprache',
    'lang.sub': 'Wähle die Sprache für die gesamte App.',
    'common.back': 'Zurück', 'common.save': 'Speichern',
  },

  fr: {
    'nav.ride': 'Trajet', 'nav.wallet': 'Portefeuille', 'nav.community': 'Communauté',
    'header.greeting': 'Salut, {name} !', 'header.role.driver': 'Conducteur vérifié',
    'header.tagline': 'On s\'entraide pour traverser la Zélande !',
    'home.cta.title': 'Besoin d\'aller quelque part ?', 'home.cta.request': 'Demander un trajet',
    'home.cta.call': 'Appeler pour un trajet', 'home.myrides': 'Mes trajets',
    'home.tab.driving': 'Je conduis', 'home.tab.riding': 'Je suis passager',
    'home.empty': 'Vous n\'avez aucun trajet actif pour le moment.', 'home.now': 'Maintenant',
    'profile.personal': 'Informations personnelles', 'profile.vehicle': 'Informations véhicule',
    'profile.availability': 'Disponibilité', 'profile.favorites': 'Lieux favoris',
    'profile.history': 'Historique des trajets', 'profile.preferences': 'Préférences',
    'profile.privacy': 'Confidentialité', 'profile.help': 'Aide',
    'profile.stat.joined': 'Inscrit', 'profile.stat.contrib': 'Contribution',
    'profile.stat.rides': 'Trajets',
    'prefs.language': 'Langue', 'lang.title': 'Langue',
    'lang.sub': 'Choisissez la langue pour toute l\'application.',
    'common.back': 'Retour', 'common.save': 'Enregistrer',
  },
};

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

const I18nContext = createContext({ locale: 'en', setLocale: () => {}, t: (k) => k });

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    if (typeof localStorage === 'undefined') return 'en';
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && dictionaries[saved] ? saved : 'en';
  });

  useEffect(() => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, locale);
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l) => {
    if (dictionaries[l]) setLocaleState(l);
  }, []);

  const t = useCallback((key, vars) => {
    const dict = dictionaries[locale] || dictionaries.en;
    const fallback = dictionaries.en;
    const value = (key in dict) ? dict[key] : (key in fallback ? fallback[key] : key);
    return interpolate(value, vars);
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  return useContext(I18nContext).t;
}
export function useLocale() {
  const { locale, setLocale } = useContext(I18nContext);
  return { locale, setLocale };
}
