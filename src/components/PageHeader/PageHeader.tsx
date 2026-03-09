import { Link } from "react-router-dom";
import { Breadcrumbs, Button, COLORS } from "@acacoop/react-components-library";
import type { ReactNode } from "react";
import { useNavigation } from "../../contexts";
import "./PageHeader.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BackButtonConfig {
  icon?: ReactNode;
  text?: string;
  /** Ruta de fallback si no hay historial de navegación */
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  breadcrumbItems: BreadcrumbItem[];
  backButton?: BackButtonConfig;
}

export default function PageHeader({
  breadcrumbItems,
  backButton,
}: PageHeaderProps) {
  const { goBack } = useNavigation();

  const handleBackClick = () => {
    if (backButton?.onClick) {
      backButton.onClick();
    } else {
      // Usa el historial de navegación, con href como fallback
      goBack(backButton?.href);
    }
  };

  return (
    <div className="page-header">
      <Breadcrumbs
        items={breadcrumbItems}
        size="lg"
        activeColor={COLORS.primary}
        hoverColor={COLORS.secondary}
        linkComponent={({
          href,
          children,
          style,
          onMouseEnter,
          onMouseLeave,
        }) => (
          <Link
            to={href}
            style={style}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {children}
          </Link>
        )}
      />
      {backButton && (
        <Button variant="outline" onClick={handleBackClick}>
          {backButton.icon}
          {backButton.text || "Volver"}
        </Button>
      )}
    </div>
  );
}
