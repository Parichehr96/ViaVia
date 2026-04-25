import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import './WalletScreen.css';

const CHIPS = ['All', 'Rides', 'Restaurants', 'Cafes', 'Groceries'];

const DEALS = {
  All: [
    { id: 1, name: 'Coffee Corner',   discount: '20% off on all drinks',   credits: 2, expires: '2d : 3h : 12m' },
    { id: 2, name: 'First Ride Free', discount: 'Free shared ride, on us', credits: 5, expires: '0d : 6h : 45m' },
    { id: 3, name: 'Pizza Palace',    discount: '15% off on all orders',   credits: 3, expires: '1d : 5h : 30m' },
    { id: 4, name: 'Albert Heijn',    discount: '5% off your full basket', credits: 2, expires: '3d : 1h : 0m'  },
  ],
  Rides: [
    { id: 1, name: 'First Ride Free', discount: 'Free shared ride, on us',       credits: 5, expires: '0d : 6h : 45m' },
    { id: 2, name: 'Weekend Rides',   discount: '10% off all weekend rides',     credits: 2, expires: '3d : 0h : 0m'  },
  ],
  Restaurants: [
    { id: 1, name: 'Pizza Palace',   discount: '15% off on all orders',          credits: 3, expires: '1d : 5h : 30m' },
    { id: 2, name: 'Burger Barn',    discount: 'Buy 1 get 1 free on burgers',    credits: 4, expires: '0d : 8h : 45m' },
  ],
  Cafes: [
    { id: 1, name: 'Coffee Corner',  discount: '20% off on all drinks',          credits: 2, expires: '2d : 3h : 12m' },
    { id: 2, name: 'The Tea House',  discount: 'Free pastry with any tea',       credits: 1, expires: '0d : 12h : 0m' },
  ],
  Groceries: [
    { id: 1, name: 'Albert Heijn',   discount: '5% off your full basket',        credits: 2, expires: '3d : 6h : 0m'  },
    { id: 2, name: 'Jumbo Market',   discount: 'Free delivery on orders €30+',   credits: 3, expires: '1d : 0h : 30m' },
  ],
};

function ActionButton({ icon, label }) {
  return (
    <button className="ws-action" type="button">
      <span className="ws-action-circle">{icon}</span>
      <span className="ws-action-label">{label}</span>
    </button>
  );
}

function DealCard({ deal }) {
  return (
    <div className="ws-deal-card">
      <div className="ws-deal-top">
        <div className="ws-deal-image" aria-hidden="true" />
        <div className="ws-deal-info">
          <div className="ws-deal-header">
            <span className="ws-deal-name">{deal.name}</span>
            <span className="ws-deal-time">{deal.expires}</span>
          </div>
          <span className="ws-deal-desc">{deal.discount}</span>
        </div>
      </div>
      <div className="ws-deal-divider" />
      <div className="ws-deal-footer">
        <span className="ws-deal-credits">{deal.credits} Credits</span>
        <button className="ws-redeem-btn">Redeem</button>
      </div>
    </div>
  );
}

const SCROLL_THRESHOLD = 40;   // px before the hero collapses

export default function WalletScreen() {
  const [activeChip, setActiveChip] = useState('All');
  const [scrolled,   setScrolled]   = useState(false);
  const scrollRef = useRef(null);
  const deals = DEALS[activeChip];

  // Toggle the collapsed hero state when the user scrolls past the threshold
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > SCROLL_THRESHOLD);
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="ws-root" ref={scrollRef}>

      {/* Sticky hero — balance + actions, collapses on scroll */}
      <section className={`ws-hero${scrolled ? ' scrolled' : ''}`}>
        <div className="ws-balance-card">
          <p className="ws-balance-label">Credit Balance</p>
          <p className="ws-amount">12,7</p>
          <p className="ws-balance-sub">3h 42min</p>
        </div>

        <div className="ws-actions-row">
          <ActionButton
            icon={<ArrowUp size={20} strokeWidth={2} color="#ff6038" />}
            label="Send"
          />
          <ActionButton
            icon={<ArrowDown size={20} strokeWidth={2} color="#ff6038" />}
            label="Receive"
          />
          <ActionButton
            icon={<ArrowUpDown size={20} strokeWidth={2} color="#ff6038" />}
            label="Transactions"
          />
        </div>
      </section>

      {/* Sticky offers header — title + chips, sit just under the hero */}
      <section className={`ws-offers-header${scrolled ? ' scrolled' : ''}`}>
        <h2 className="ws-offers-title">Offers for you</h2>
        <div className="ws-chips-row">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              className={`ws-chip${activeChip === chip ? ' active' : ''}`}
              onClick={() => setActiveChip(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* Deal cards scroll under the two sticky bands */}
      <div className="ws-deals-list">
        {deals.map((deal) => <DealCard key={deal.id} deal={deal} />)}
      </div>
    </div>
  );
}
