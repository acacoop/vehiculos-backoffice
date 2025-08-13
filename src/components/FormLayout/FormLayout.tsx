import React from "react";
import DateTimePicker from "../DateTimePicker/DateTimePicker";
import {
  UserSearch,
  VehicleSearch,
  CategorySearch,
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
    | "categorySearch";
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
  showDropdown?: boolean;
  onUserSelect?: (user: User) => void;
  onVehicleSelect?: (vehicle: Vehicle) => void;
  onCategorySelect?: (category: Maintenance) => void;
  onDropdownToggle?: (show: boolean) => void;
  selectedCategory?: Maintenance | null;
}

export interface FormSection {
  title: string;
  fields: FormField[];
  className?: string;
  horizontal?: boolean; // Nueva propiedad para layout horizontal
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
      showDropdown,
      onUserSelect,
      onVehicleSelect,
      onCategorySelect,
      onDropdownToggle,
      selectedCategory,
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
          {selectedCategory && (
            <div className="selected-entity">
              <span>Categoría seleccionada: {selectedCategory.name}</span>
            </div>
          )}
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
            min={type === "number" ? min : undefined}
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
              {section.fields.map((field) => renderField(field, sectionIndex))}
            </div>
          </div>
        ))}

        {children && <div className="form-layout-actions">{children}</div>}
      </div>
    </div>
  );
};

export default FormLayout;
