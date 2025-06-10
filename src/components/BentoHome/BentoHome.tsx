import "./BentoHome.css";

interface BentoHomeProps {
  icon: string;
  text: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function BentoHome({
  icon,
  text,
  selected = false,
  onClick,
}: BentoHomeProps) {
  return (
    <button
      className={`bento-home${selected ? " selected" : ""}`}
      onClick={onClick}
      type="button"
    >
      <div className="bento-home-content">
        <img className="bento-home-icon" src={icon} alt="icono" />
        <p className="bento-home-text">{text}</p>
      </div>
    </button>
  );
}
