import "./BentoHome.css";
import type { LucideIcon } from "lucide-react";

interface BentoHomeProps {
  icon?: LucideIcon;
  customIcon?: string;
  text: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function BentoHome({
  icon: Icon,
  customIcon,
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
        {customIcon ? (
          <img
            className="bento-home-icon bento-home-custom-icon"
            src={customIcon}
            alt={text}
          />
        ) : Icon ? (
          <Icon
            className="bento-home-icon bento-home-lucide-icon"
            size={40}
            strokeWidth={2}
          />
        ) : null}
        <p className="bento-home-text">{text}</p>
      </div>
    </button>
  );
}
