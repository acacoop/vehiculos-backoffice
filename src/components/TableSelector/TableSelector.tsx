import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import "./TableSelector.css";

export interface TableTab {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** The table component to render */
  table: React.ReactNode;
}

export interface TableSelectorProps {
  /** Array of tabs with their tables */
  tabs: TableTab[];
  /** Default selected tab id (optional, defaults to first tab) */
  defaultTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Variant of the selector: 'tabs' for horizontal tabs, 'dropdown' for select dropdown */
  variant?: "tabs" | "dropdown";
}

export function TableSelector({
  tabs,
  defaultTab,
  onTabChange,
  variant = "tabs",
}: TableSelectorProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeTable = tabs.find((tab) => tab.id === activeTab);

  if (tabs.length === 0) {
    return null;
  }

  if (variant === "dropdown") {
    return (
      <div className="table-selector">
        <div className="table-selector-dropdown-container">
          <select
            className="table-selector-dropdown"
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value)}
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
          {activeTable && (
            <div className="table-selector-dropdown-icon">
              <activeTable.icon size={20} />
            </div>
          )}
        </div>
        <div className="table-selector-content">{activeTable?.table}</div>
      </div>
    );
  }

  return (
    <div className="table-selector">
      <div className="table-selector-tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              className={`table-selector-tab ${isActive ? "active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
              type="button"
            >
              <IconComponent size={18} className="table-selector-tab-icon" />
              <span className="table-selector-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="table-selector-content">{activeTable?.table}</div>
    </div>
  );
}

export default TableSelector;
