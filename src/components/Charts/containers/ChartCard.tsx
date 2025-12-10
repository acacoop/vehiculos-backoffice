import type { ChartCardProps } from "../core/types";
import "../styles/Charts.css";

/**
 * Componente contenedor base para gráficos.
 * Proporciona un layout consistente con título, área de gráfico y footer opcional.
 */
export default function ChartCard({
  title,
  subtitle,
  footer,
  width,
  height,
  fullWidth = false,
  loading = false,
  error,
  children,
  style,
  className = "",
}: ChartCardProps) {
  const containerStyle: React.CSSProperties = {
    ...style,
  };

  if (width) containerStyle.width = width;
  if (height) containerStyle.height = height;

  const cardClasses = [
    "chart-card",
    fullWidth ? "chart-card--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (loading) {
    return (
      <div className={cardClasses} style={containerStyle}>
        <div className="chart-card__header">
          <h3 className="chart-card__title">{title}</h3>
          {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
        </div>
        <div className="chart-card__content chart-card__content--loading">
          <div className="chart-card__spinner" />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cardClasses} style={containerStyle}>
        <div className="chart-card__header">
          <h3 className="chart-card__title">{title}</h3>
          {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
        </div>
        <div className="chart-card__content chart-card__content--error">
          <span className="chart-card__error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} style={containerStyle}>
      <div className="chart-card__header">
        <h3 className="chart-card__title">{title}</h3>
        {subtitle && <p className="chart-card__subtitle">{subtitle}</p>}
      </div>
      <div className="chart-card__content">{children}</div>
      {footer && <div className="chart-card__footer">{footer}</div>}
    </div>
  );
}
