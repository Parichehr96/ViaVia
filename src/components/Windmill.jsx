import windmillBlades from '../assets/icons/windmill-blades.svg';
import windmillTower  from '../assets/icons/windmill-tower.svg';
import './Windmill.css';

/**
 * Windmill — vector composite. Blades (top, rotating) over tower (static).
 * SVG sources live in `src/assets/icons/`.
 */
export default function Windmill({ className = '' }) {
  return (
    <div className={`windmill ${className}`} aria-hidden="true">
      <img src={windmillBlades} alt="" className="windmill-blades" />
      <img src={windmillTower}  alt="" className="windmill-tower"  />
    </div>
  );
}
