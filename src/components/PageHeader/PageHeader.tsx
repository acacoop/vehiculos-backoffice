import { Link, useNavigate } from "react-router-dom";
import { Breadcrumbs, Button } from "@acacoop/react-components-library";
import type { ReactNode } from "react";
import "./PageHeader.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BackButtonConfig {
  icon?: ReactNode;
  text?: string;
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
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (backButton?.onClick) {
      backButton.onClick();
    } else if (backButton?.href) {
      navigate(backButton.href);
    }
  };

  return (
    <div className="page-header">
      <Breadcrumbs
        items={breadcrumbItems}
        size="lg"
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
