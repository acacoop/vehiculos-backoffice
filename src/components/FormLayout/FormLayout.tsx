import React from "react";
import DateTimePicker from "../DateTimePicker/DateTimePicker";
import {
  UserSearch,
  VehicleSearch,
  CategorySearch,
  MaintenanceSearch,
} from "../EntitySearch/EntitySearch";
import type { User } from "../../types/user";
import type { Vehicle } from "../../types/vehicle";
import type { Maintenance } from "../../types/maintenance";
import "./FormLayout.css";

export interface FormField {
  key: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "date"
    | "textarea"
    | "datetime"
    | "userSearch"
    | "vehicleSearch"
    | "categorySearch"
    | "maintenanceSearch"
    | "checkbox"
    | "display";
  placeholder?: string;
  value: string | number;
  onChange: (key: string, value: string | number) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  min?: number;
  max?: number;

  // DateTimePicker props
  dateTimePicker?: boolean;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  onStartDateChange?: (date: string) => void;
  onStartTimeChange?: (time: string) => void;
  onEndDateChange?: (date: string) => void;
  onEndTimeChange?: (time: string) => void;
  minDate?: string;

  // EntitySearch props
  entitySearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  availableUsers?: User[];
  availableVehicles?: Vehicle[];
  availableCategories?: Maintenance[];
  availableMaintenances?: Maintenance[];
  showDropdown?: boolean;
  onUserSelect?: (user: User) => void;
  onVehicleSelect?: (vehicle: Vehicle) => void;
  onCategorySelect?: (category: Maintenance) => void;
  onMaintenanceSelect?: (maintenance: Maintenance) => void;
  onDropdownToggle?: (show: boolean) => void;

  // Checkbox props
  checked?: boolean;

  // Display props
  displayValue?: string | React.ReactNode;

  // Conditional rendering
  condition?: () => boolean;
}

export interface FormSection {
  title: string;
  fields: FormField[];
  className?: string;
  horizontal?: boolean;
  actionButton?: {
    text: string;
    onClick: () => void;
    className?: string;
  };
}

interface FormLayoutProps {
  title: string;
  sections: FormSection[];
  children?: React.ReactNode;
  className?: string;
}

const FormLayout: React.FC<FormLayoutProps> = ({
  title,
  sections,
  children,
  className = "",
}) => {
  const handleFieldChange = (
    sectionIndex: number,
    fieldKey: string,
    value: string | number
  ) => {
    const field = sections[sectionIndex].fields.find((f) => f.key === fieldKey);
    if (field && field.onChange) {
      field.onChange(fieldKey, value);
    }
  };

  const renderField = (field: FormField, sectionIndex: number) => {
    const {
      key,
      label,
      type,
      placeholder,
      value,
      disabled,
      readOnly,
      required,
      className: fieldClassName,
      min,
      max,
      dateTimePicker,
      startDate,
      startTime,
      endDate,
      endTime,
      onStartDateChange,
      onStartTimeChange,
      onEndDateChange,
      onEndTimeChange,
      minDate,
      entitySearch,
      searchTerm,
      onSearchChange,
      availableUsers,
      availableVehicles,
      availableCategories,
      availableMaintenances,
      showDropdown,
      onUserSelect,
      onVehicleSelect,
      onCategorySelect,
      onMaintenanceSelect,
      onDropdownToggle,
    } = field;

    // DateTimePicker component
    if (type === "datetime" && dateTimePicker) {
      return (
        <div key={key} className={`form-field ${fieldClassName || ""}`}>
          <label className="form-label">
            {label} {required && <span className="required">*</span>}
          </label>
          <DateTimePicker
            startDate={startDate || ""}
            startTime={startTime || ""}
            endDate={endDate || ""}
            endTime={endTime || ""}
            onStartDateChange={onStartDateChange || (() => {})}
            onStartTimeChange={onStartTimeChange || (() => {})}
            onEndDateChange={onEndDateChange || (() => {})}
            onEndTimeChange={onEndTimeChange || (() => {})}
            disabled={disabled}
            minDate={minDate}
          />
        </div>
      );
    }

    // UserSearch component
    if (type === "userSearch" && entitySearch) {
      return (
        <div key={key} className={`form-field ${fieldClassName || ""}`}>
          <label className="form-label">
            {label} {required && <span className="required">*</span>}
          </label>
          <UserSearch
            searchTerm={searchTerm || ""}
            onSearchChange={onSearchChange || (() => {})}
            availableUsers={availableUsers || []}
            showDropdown={showDropdown || false}
            onUserSelect={onUserSelect || (() => {})}
            onDropdownToggle={onDropdownToggle || (() => {})}
            placeholder={placeholder}
            className="form-input"
          />
        </div>
      );
    }

    // VehicleSearch component
    if (type === "vehicleSearch" && entitySearch) {
      return (
        <div key={key} className={`form-field ${fieldClassName || ""}`}>
          <label className="form-label">
            {label} {required && <span className="required">*</span>}
          </label>
          <VehicleSearch
            searchTerm={searchTerm || ""}
            onSearchChange={onSearchChange || (() => {})}
            availableVehicles={availableVehicles || []}
            showDropdown={showDropdown || false}
            onVehicleSelect={onVehicleSelect || (() => {})}
            onDropdownToggle={onDropdownToggle || (() => {})}
            placeholder={placeholder}
            className="form-input"
          />
        </div>
      );
    }

    // CategorySearch component
    if (type === "categorySearch" && entitySearch) {
      return (
        <div key={key} className={`form-field ${fieldClassName || ""}`}>
          <label className="form-label">
            {label} {required && <span className="required">*</span>}
          </label>
          <CategorySearch
            searchTerm={searchTerm || ""}
            onSearchChange={onSearchChange || (() => {})}
            availableCategories={availableCategories || []}
            showDropdown={showDropdown || false}
            onCategorySelect={onCategorySelect || (() => {})}
            onDropdownToggle={onDropdownToggle || (() => {})}
            placeholder={placeholder}
            className="form-input"
          />
        </div>
      );
    }

    // MaintenanceSearch component
    if (type === "maintenanceSearch" && entitySearch) {
      return (
        <div key={key} className={`form-field ${fieldClassName || ""}`}>
          <label className="form-label">
            {label} {required && <span className="required">*</span>}
          </label>
          <MaintenanceSearch
            searchTerm={searchTerm || ""}
            onSearchChange={onSearchChange || (() => {})}
            availableMaintenances={availableMaintenances || []}
            showDropdown={showDropdown || false}
            onMaintenanceSelect={onMaintenanceSelect || (() => {})}
            onDropdownToggle={onDropdownToggle || (() => {})}
            placeholder={placeholder}
            className="form-input"
          />
        </div>
      );
    }

    // Checkbox component
    if (type === "checkbox") {
      return (
        <div
          key={key}
          className={`form-field checkbox-field ${fieldClassName || ""}`}
        >
          <div className="checkbox-group">
            <input
              type="checkbox"
              id={key}
              checked={field.checked || false}
              onChange={(e) =>
                handleFieldChange(sectionIndex, key, e.target.checked ? 1 : 0)
              }
              className="form-checkbox"
              disabled={disabled}
            />
            <label htmlFor={key} className="checkbox-label">
              {label}
            </label>
          </div>
        </div>
      );
    }

    // Display component for showing read-only information
    if (type === "display") {
      return (
        <div
          key={key}
          className={`form-field display-field ${fieldClassName || ""}`}
        >
          <label className="form-label">{label}</label>
          <div className="display-value">{field.displayValue || value}</div>
        </div>
      );
    }

    return (
      <div key={key} className={`form-field ${fieldClassName || ""}`}>
        <label className="form-label" htmlFor={key}>
          {label} {required && <span className="required">*</span>}
        </label>

        {type === "textarea" ? (
          <textarea
            id={key}
            className="form-textarea"
            placeholder={placeholder}
            value={value as string}
            onChange={(e) =>
              handleFieldChange(sectionIndex, key, e.target.value)
            }
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            rows={4}
          />
        ) : (
          <input
            id={key}
            type={type}
            className="form-input"
            placeholder={placeholder}
            value={value}
            min={
              type === "number" ? min : type === "date" ? minDate : undefined
            }
            max={type === "number" ? max : undefined}
            onChange={(e) => {
              const newValue =
                type === "number"
                  ? Number(e.target.value) || 0
                  : e.target.value;
              handleFieldChange(sectionIndex, key, newValue);
            }}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`form-layout-container ${className}`}>
      <div className="form-layout-content">
        <div className="form-layout-header">
          <h1 className="title">{title}</h1>
        </div>
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`form-section ${section.className || ""}`}
          >
            <div className="section-header">
              <h2 className="section-title">{section.title}</h2>
              {section.actionButton && (
                <button
                  type="button"
                  className={`action-button ${
                    section.actionButton.className || ""
                  }`}
                  onClick={section.actionButton.onClick}
                >
                  {section.actionButton.text}
                </button>
              )}
            </div>

            <div
              className={`section-fields ${
                section.horizontal ? "horizontal-layout" : ""
              }`}
            >
              {section.fields
                .filter((field) => !field.condition || field.condition())
                .map((field) => renderField(field, sectionIndex))}
            </div>
          </div>
        ))}

        {children && <div className="form-layout-actions">{children}</div>}
      </div>
    </div>
  );
};

export default FormLayout;
