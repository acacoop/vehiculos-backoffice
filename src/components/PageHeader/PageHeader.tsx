import { Link, useNavigate } from "react-router-dom";
import {
  Breadcrumbs,
  Button,
  COLORS,
  type BreadcrumbItem,
} from "@acacoop/react-components-library";
import { ArrowLeft } from "lucide-react";
import { popPageContext, ROUTES } from "../../common";
import "./PageHeader.css";

export interface BackButtonConfig {
  text?: string;
  /** Ruta de fallback si no hay historial de navegación */
  fallbackHref?: string;
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
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (backButton?.onClick) {
      backButton.onClick();
      return;
    }

    // Usar el navigation stack existente
    const context = popPageContext();
    if (context) {
      navigate(context.returnPath);
    } else {
      // Fallback a la ruta especificada o al inicio
      navigate(backButton?.fallbackHref ?? ROUTES.HOME);
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
        <Button size="sm" variant="outline" onClick={handleBackClick}>
          <ArrowLeft size={16} />
          {backButton.text ?? "Volver"}
        </Button>
      )}
    </div>
  );
}
