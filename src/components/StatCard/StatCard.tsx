import { type LucideIcon } from "lucide-react";
import "./StatCard.css";

export interface StatCardData {
  key: string;
  label: string;
  count: number;
  severity: "high" | "medium" | "low";
  icon: LucideIcon;
  span?: number;
}

export interface StatCardProps {
  data: StatCardData;
  onClick?: () => void;
}

export function StatCard({ data, onClick }: StatCardProps) {
  const { label, count, severity, icon: Icon, span } = data;

  return (
    <button
      type="button"
      className={`stat-card stat-card--${severity} ${
        span ? `stat-card--span-${span}` : ""
      }`}
      onClick={onClick}
    >
      <div className="stat-card__icon-container">
        <Icon size={24} className="stat-card__icon" />
      </div>
      <div className="stat-card__content">
        <span className="stat-card__count">{count}</span>
        <span className="stat-card__label">{label}</span>
      </div>
    </button>
  );
}

export interface StatCardsGridProps {
  cards: StatCardData[];
  onCardClick?: (key: string) => void;
  loading?: boolean;
}

export function StatCardsGrid({
  cards,
  onCardClick,
  loading = false,
}: StatCardsGridProps) {
  if (loading) {
    return (
      <div className="stat-cards-grid">
        {cards.map((i) => (
          <div key={i.key} className="stat-card stat-card--loading">
            <div className="stat-card__skeleton-icon" />
            <div className="stat-card__skeleton-content">
              <div className="stat-card__skeleton-count" />
              <div className="stat-card__skeleton-label" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stat-cards-grid">
      {cards.map((card) => (
        <StatCard
          key={card.key}
          data={card}
          onClick={() => onCardClick?.(card.key)}
        />
      ))}
    </div>
  );
}

export default StatCard;
