import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'ride',   title: 'Ride Accepted', desc: 'Emma has accepted your ride to Central Station', time: '3m ago',  read: false },
  { id: 2, type: 'wallet', title: 'Credits Added',  desc: 'Emma has accepted your ride to Central Station', time: '3m ago',  read: false },
  { id: 3, type: 'ride',   title: 'Ride Accepted', desc: 'Emma has accepted your ride to Central Station', time: '3h ago',  read: true  },
  { id: 4, type: 'ride',   title: 'Ride Accepted', desc: 'Emma has accepted your ride to Central Station', time: '23h ago', read: true  },
  { id: 5, type: 'ride',   title: 'Ride Accepted', desc: 'Emma has accepted your ride to Central Station', time: '3m ago',  read: true  },
  { id: 6, type: 'ride',   title: 'Ride Accepted', desc: 'Emma has accepted your ride to Central Station', time: '1 d ago', read: true  },
  { id: 7, type: 'ride',   title: 'Ride Accepted', desc: 'Emma has accepted your ride to Central Station', time: '3 w ago', read: true  },
];

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('home');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [rideFlowOpen, setRideFlowOpen] = useState(false);
  const [rideFlowStep, setRideFlowStep] = useState('pickup'); // 'pickup' | 'dropoff'
  const [rideFlowResult, setRideFlowResultState] = useState(null); // { pickupLoc, dropoffLoc }
  const [rideToast, setRideToast] = useState(null); // { id, from, to }
  const [acceptedRides, setAcceptedRides] = useState(new Set());
  const [acceptToast, setAcceptToast] = useState(null); // { name }
  const [dismissedRides, setDismissedRides] = useState(new Set());
  const [selectedRide, setSelectedRide] = useState(null);
  const [targetCommunityTab, setTargetCommunityTab] = useState(null); // null | 'all' | 'mine'
  const [myRidesTab, setMyRidesTab] = useState('driving'); // 'driving' | 'riding' — Ride-page sub-tab

  // ── New ride flow state ──────────────────────────────────────────
  const [activeRide, setActiveRide] = useState(null);
  const [rideFlowStatus, setRideFlowStatus] = useState(null); // null | 'accepted' | 'driver_en_route' | 'driver_arrived' | 'in_progress' | 'completed' | 'cancelled'
  const [driverRideOpen, setDriverRideOpen] = useState(false);
  const [passengerRideOpen, setPassengerRideOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [statusToast, setStatusToast] = useState(null); // null | { message, icon }
  const [callOpen, setCallOpen] = useState(false);

  function openCall()  { setCallOpen(true); }
  function closeCall() { setCallOpen(false); }

  function openRideFlow(step = 'search') {
    setRideFlowStep(step);
    setRideFlowOpen(true);
  }
  function closeRideFlow() { setRideFlowOpen(false); }
  function setRideFlowResult(data) { setRideFlowResultState(data); }
  function clearRideFlowResult() { setRideFlowResultState(null); }
  function showRideToast(data) { setRideToast(data); }
  function clearRideToast() { setRideToast(null); }
  function acceptRide(id) {
    setAcceptedRides(prev => new Set([...prev, id]));
  }
  function showAcceptToast(data) { setAcceptToast(data); }
  function clearAcceptToast() { setAcceptToast(null); }
  function dismissRide(id) { setDismissedRides(prev => new Set([...prev, id])); }
  function openRideDetail(ride) { setSelectedRide(ride); }
  function closeRideDetail() { setSelectedRide(null); }

  // ── New ride flow functions ──────────────────────────────────────
  function openDriverRide(ride) {
    setActiveRide(ride);
    setRideFlowStatus('accepted');
    setDriverRideOpen(true);
  }
  function closeDriverRide() {
    setDriverRideOpen(false);
  }
  function openPassengerRide(ride) {
    setActiveRide(ride);
    setPassengerRideOpen(true);
  }
  function closePassengerRide() {
    setPassengerRideOpen(false);
  }
  function startRideFlow() {
    setRideFlowStatus('driver_en_route');
    setStatusToast({ message: 'Your driver is on the way!', icon: '🚗' });
  }
  function driverArrive() {
    setRideFlowStatus('driver_arrived');
    setStatusToast({ message: 'Your driver has arrived!', icon: '📍' });
  }
  function beginTrip() {
    setRideFlowStatus('in_progress');
  }
  function cancelActiveRide() {
    setRideFlowStatus('cancelled');
    setDriverRideOpen(false);
    setPassengerRideOpen(false);
    setActiveRide(null);
    setChatMessages([]);
  }
  function completeRide() {
    setRideFlowStatus('completed');
    setDriverRideOpen(false);
    setPassengerRideOpen(false);
    setActiveRide(null);
    setChatMessages([]);
  }
  function openChat() { setChatOpen(true); }
  function closeChat() { setChatOpen(false); }
  function sendChatMessage(text, sender) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [
      ...prev,
      { id: Date.now(), text, sender, time },
    ]);
  }
  function clearStatusToast() { setStatusToast(null); }

  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [walletBalance, setWalletBalance] = useState(125.50);
  const [rideRequests, setRideRequests] = useState([
    {
      id: 1,
      name: 'Emma Visser',
      avatar: null,
      initials: 'EV',
      communities: 3,
      verified: true,
      match: 92,
      price: '€ 8.50',
      from: 'Amsterdam Centraal',
      to: 'Schiphol Airport',
      when: 'Today, 4:30 PM',
      duration: '35 min',
      distance: '18 km',
      fromCoords: [52.3791, 4.9003],
      toCoords: [52.3105, 4.7683],
    },
    {
      id: 2,
      name: 'Lars de Boer',
      avatar: null,
      initials: 'LB',
      communities: 1,
      verified: true,
      match: 78,
      price: '€ 3.00',
      from: 'Vondelpark',
      to: 'Amsterdam Zuid',
      when: 'Today, 5:00 PM',
      duration: '12 min',
      distance: '4 km',
      fromCoords: [52.3580, 4.8686],
      toCoords: [52.3388, 4.8722],
    },
    {
      id: 3,
      name: 'Sofia Müller',
      avatar: null,
      initials: 'SM',
      communities: 5,
      verified: false,
      match: 85,
      price: '€ 5.50',
      from: 'De Pijp',
      to: 'Amsterdam Noord',
      when: 'Tomorrow, 9:00 AM',
      duration: '20 min',
      distance: '8 km',
      fromCoords: [52.3525, 4.8978],
      toCoords: [52.4001, 4.9219],
    },
    {
      id: 4, name: 'Daan Janssen', initials: 'DJ', communities: 2, verified: true,
      match: 88, price: '€ 4.20', from: 'Jordaan', to: 'Westerpark',
      when: 'Today, 6:15 PM', duration: '8 min', distance: '2.5 km',
      fromCoords: [52.3742, 4.8838], toCoords: [52.3865, 4.8780],
    },
    {
      id: 5, name: 'Iris van Dijk', initials: 'IV', communities: 4, verified: true,
      match: 95, price: '€ 6.80', from: 'Amsterdam Oost', to: 'Rijksmuseum',
      when: 'Today, 7:45 PM', duration: '18 min', distance: '6 km',
      fromCoords: [52.3625, 4.9286], toCoords: [52.3600, 4.8852],
    },
    {
      id: 6, name: 'Nora El Idrissi', initials: 'NE', communities: 6, verified: true,
      match: 81, price: '€ 11.00', from: 'Amstelveen', to: 'Haarlem Station',
      when: 'Tomorrow, 7:30 AM', duration: '40 min', distance: '22 km',
      fromCoords: [52.3081, 4.8595], toCoords: [52.3878, 4.6383],
    },
    {
      id: 7, name: 'Tom Jansen', initials: 'TJ', communities: 1, verified: false,
      match: 72, price: '€ 2.50', from: 'Centraal Station', to: 'Dam Square',
      when: 'Today, 9:20 PM', duration: '5 min', distance: '1.2 km',
      fromCoords: [52.3791, 4.9003], toCoords: [52.3731, 4.8926],
    },
    {
      id: 8, name: 'Anouk Bakker', initials: 'AB', communities: 3, verified: true,
      match: 90, price: '€ 7.20', from: 'Sloterdijk', to: 'IJburg',
      when: 'Tomorrow, 11:00 AM', duration: '28 min', distance: '14 km',
      fromCoords: [52.3886, 4.8378], toCoords: [52.3589, 4.9810],
    },
    {
      id: 9, name: 'Pieter Hofman', initials: 'PH', communities: 2, verified: true,
      match: 76, price: '€ 5.00', from: 'Olympiaplein', to: 'NEMO Science Museum',
      when: 'Today, 10:00 PM', duration: '14 min', distance: '5 km',
      fromCoords: [52.3445, 4.8615], toCoords: [52.3737, 4.9123],
    },
    {
      id: 10, name: 'Mei Tan', initials: 'MT', communities: 4, verified: true,
      match: 94, price: '€ 9.50', from: 'Zuidas', to: 'Artis Zoo',
      when: 'Tomorrow, 2:15 PM', duration: '22 min', distance: '9 km',
      fromCoords: [52.3388, 4.8722], toCoords: [52.3661, 4.9180],
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  function addRideRequest(ride) {
    setRideRequests(prev => [ride, ...prev]);
  }

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      profileOpen, setProfileOpen,
      notificationsOpen, setNotificationsOpen,
      notifications, markAllRead,
      unreadCount,
      walletBalance, setWalletBalance,
      rideRequests, addRideRequest,
      rideFlowOpen, rideFlowStep, openRideFlow, closeRideFlow,
      rideFlowResult, setRideFlowResult, clearRideFlowResult,
      rideToast, showRideToast, clearRideToast,
      targetCommunityTab, setTargetCommunityTab,
      myRidesTab, setMyRidesTab,
      acceptedRides, acceptRide,
      acceptToast, showAcceptToast, clearAcceptToast,
      dismissedRides, dismissRide,
      selectedRide, openRideDetail, closeRideDetail,
      // New ride flow
      activeRide,
      rideFlowStatus,
      driverRideOpen, openDriverRide, closeDriverRide,
      passengerRideOpen, openPassengerRide, closePassengerRide,
      startRideFlow, driverArrive, beginTrip,
      cancelActiveRide, completeRide,
      chatOpen, openChat, closeChat,
      chatMessages, sendChatMessage,
      statusToast, clearStatusToast,
      callOpen, openCall, closeCall,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
