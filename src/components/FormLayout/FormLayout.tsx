import React from "react";
import DateTimePicker from "../DateTimePicker/DateTimePicker";
import {
  UserSearch,
  VehicleSearch,
  CategorySearch,
  MaintenanceSearch,
  BrandSearch,
  VehicleTypeSearch,
} from "../EntitySearch/EntitySearch";
import { CancelButton, DeleteButton, ConfirmButton } from "../Buttons/Buttons";
import "./FormLayout.css";

export enum FieldType {
  TEXT_FIXED = "text_fixed",
  INPUT = "input",
  DATE = "date",
  DATETIME = "datetime",
  TEXTAREA = "textarea",
  SEARCH = "search",
  CHECKBOX = "checkbox",
  DISPLAY = "display",
}

export enum InputType {
  TEXT = "text",
  EMAIL = "email",
  NUMBER = "number",
}

export enum EntityType {
  USER = "user",
  VEHICLE = "vehicle",
  CATEGORY = "category",
  MAINTENANCE = "maintenance",
  BRAND = "brand",
  VEHICLE_TYPE = "vehicle_type",
}

export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export type ValidationFunction = (value: any) => ValidationResult;

export type FormField =
  | {
      type: FieldType.TEXT_FIXED;
      title: string;
      value: string;
      key: string;
      className?: string;
    }
  | {
      type: FieldType.INPUT;
      title: string;
      value: string | number;
      key: string;
      inputType?: InputType;
      placeholder?: string;
      required?: boolean;
      disabled?: boolean;
      readOnly?: boolean;
      className?: string;
      min?: number;
      max?: number;
      minDate?: string;
      validation?: ValidationFunction;
    }
  | {
      type: FieldType.DATE;
      title: string;
      value: string;
      key: string;
      placeholder?: string;
      required?: boolean;
      disabled?: boolean;
      readOnly?: boolean;
      className?: string;
      minDate?: string;
      validation?: ValidationFunction;
    }
  | {
      type: FieldType.DATETIME;
      title: string;
      value: string;
      key: string;
      startDate?: string;
      startTime?: string;
      endDate?: string;
      endTime?: string;
      onStartDateChange?: (date: string) => void;
      onStartTimeChange?: (time: string) => void;
      onEndDateChange?: (date: string) => void;
      onEndTimeChange?: (time: string) => void;
      minDate?: string;
      disabled?: boolean;
      className?: string;
      validation?: ValidationFunction;
    }
  | {
      type: FieldType.TEXTAREA;
      title: string;
      value: string;
      key: string;
      placeholder?: string;
      required?: boolean;
      disabled?: boolean;
      readOnly?: boolean;
      className?: string;
      rows?: number;
      validation?: ValidationFunction;
    }
  | {
      type: FieldType.SEARCH;
      title: string;
      value: any; // User | Vehicle | etc. | null
      key: string;
      entityType: EntityType;
      searchTerm?: string;
      onSearchChange?: (term: string) => void;
      availableEntities?: any[]; // User[] | Vehicle[] | etc.
      showDropdown?: boolean;
      onSelect?: (entity: any) => void;
      onDropdownToggle?: (show: boolean) => void;
      placeholder?: string;
      className?: string;
      required?: boolean;
      validation?: ValidationFunction;
    }
  | {
      type: FieldType.CHECKBOX;
      title: string;
      value: boolean;
      key: string;
      disabled?: boolean;
      className?: string;
      validation?: ValidationFunction;
    }
  | {
      type: FieldType.DISPLAY;
      title: string;
      value: string | React.ReactNode;
      key: string;
      className?: string;
    };

export interface ButtonConfig {
  text: string;
  onClick: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

interface FormLayoutProps {
  title: string;
  subtitle?: string;
  formFields: FormField[];
  buttonConfig?: {
    primary?: ButtonConfig;
    secondary?: ButtonConfig;
    cancel?: ButtonConfig;
  };
  onFieldChange: (key: string, value: any) => void;
  className?: string;
}

const FormLayout: React.FC<FormLayoutProps> = ({
  title,
  subtitle,
  formFields,
  buttonConfig,
  onFieldChange,
  className = "",
}) => {
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({});

  const validateField = (field: FormField, value: any): string | null => {
    if ("validation" in field && field.validation) {
      const result = field.validation(value);
      return result.isValid ? null : result.message || "Valor inválido";
    }
    return null;
  };

  const handleFieldChange = (key: string, value: any) => {
    const field = formFields.find((f) => f.key === key);
    if (field) {
      const error = validateField(field, value);
      setValidationErrors((prev) => ({
        ...prev,
        [key]: error || "",
      }));
    }
    onFieldChange(key, value);
  };

  const renderField = (field: FormField) => {
    const error = validationErrors[field.key];

    const fieldContent = (() => {
      switch (field.type) {
        case FieldType.TEXT_FIXED:
          return <div className="display-value">{field.value}</div>;

        case FieldType.INPUT:
          return (
            <input
              id={field.key}
              type={
                field.inputType === InputType.NUMBER
                  ? "number"
                  : field.inputType === InputType.EMAIL
                  ? "email"
                  : "text"
              }
              className="form-input"
              placeholder={field.placeholder}
              value={field.value}
              min={field.min}
              max={field.max}
              onChange={(e) => {
                const newValue =
                  field.inputType === InputType.NUMBER
                    ? Number(e.target.value) || 0
                    : e.target.value;
                handleFieldChange(field.key, newValue);
              }}
              disabled={field.disabled}
              readOnly={field.readOnly}
              required={field.required}
            />
          );

        case FieldType.DATE:
          return (
            <input
              id={field.key}
              type="date"
              className="form-input"
              placeholder={field.placeholder}
              value={field.value}
              min={field.minDate}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              disabled={field.disabled}
              readOnly={field.readOnly}
              required={field.required}
            />
          );

        case FieldType.DATETIME:
          return (
            <DateTimePicker
              startDate={field.startDate || ""}
              startTime={field.startTime || ""}
              endDate={field.endDate || ""}
              endTime={field.endTime || ""}
              onStartDateChange={field.onStartDateChange || (() => {})}
              onStartTimeChange={field.onStartTimeChange || (() => {})}
              onEndDateChange={field.onEndDateChange || (() => {})}
              onEndTimeChange={field.onEndTimeChange || (() => {})}
              disabled={field.disabled}
              minDate={field.minDate}
            />
          );

        case FieldType.TEXTAREA:
          return (
            <textarea
              id={field.key}
              className="form-textarea"
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              disabled={field.disabled}
              readOnly={field.readOnly}
              required={field.required}
              rows={field.rows || 4}
            />
          );

        case FieldType.SEARCH:
          const renderSearchComponent = () => {
            switch (field.entityType) {
              case EntityType.USER:
                return (
                  <UserSearch
                    searchTerm={field.searchTerm || ""}
                    onSearchChange={field.onSearchChange || (() => {})}
                    availableUsers={field.availableEntities || []}
                    showDropdown={field.showDropdown || false}
                    onUserSelect={field.onSelect || (() => {})}
                    onDropdownToggle={field.onDropdownToggle || (() => {})}
                    placeholder={field.placeholder}
                    className="form-input"
                  />
                );
              case EntityType.VEHICLE:
                return (
                  <VehicleSearch
                    searchTerm={field.searchTerm || ""}
                    onSearchChange={field.onSearchChange || (() => {})}
                    availableVehicles={field.availableEntities || []}
                    showDropdown={field.showDropdown || false}
                    onVehicleSelect={field.onSelect || (() => {})}
                    onDropdownToggle={field.onDropdownToggle || (() => {})}
                    placeholder={field.placeholder}
                    className="form-input"
                  />
                );
              case EntityType.CATEGORY:
                return (
                  <CategorySearch
                    searchTerm={field.searchTerm || ""}
                    onSearchChange={field.onSearchChange || (() => {})}
                    availableCategories={field.availableEntities || []}
                    showDropdown={field.showDropdown || false}
                    onCategorySelect={field.onSelect || (() => {})}
                    onDropdownToggle={field.onDropdownToggle || (() => {})}
                    placeholder={field.placeholder}
                    className="form-input"
                  />
                );
              case EntityType.MAINTENANCE:
                return (
                  <MaintenanceSearch
                    searchTerm={field.searchTerm || ""}
                    onSearchChange={field.onSearchChange || (() => {})}
                    availableMaintenances={field.availableEntities || []}
                    showDropdown={field.showDropdown || false}
                    onMaintenanceSelect={field.onSelect || (() => {})}
                    onDropdownToggle={field.onDropdownToggle || (() => {})}
                    placeholder={field.placeholder}
                    className="form-input"
                  />
                );
              case EntityType.BRAND:
                return (
                  <BrandSearch
                    searchTerm={field.searchTerm || ""}
                    onSearchChange={field.onSearchChange || (() => {})}
                    availableBrands={field.availableEntities || []}
                    showDropdown={field.showDropdown || false}
                    onBrandSelect={field.onSelect || (() => {})}
                    onDropdownToggle={field.onDropdownToggle || (() => {})}
                    placeholder={field.placeholder}
                    className="form-input"
                  />
                );
              case EntityType.VEHICLE_TYPE:
                return (
                  <VehicleTypeSearch
                    searchTerm={field.searchTerm || ""}
                    onSearchChange={field.onSearchChange || (() => {})}
                    availableVehicleTypes={field.availableEntities || []}
                    showDropdown={field.showDropdown || false}
                    onVehicleTypeSelect={field.onSelect || (() => {})}
                    onDropdownToggle={field.onDropdownToggle || (() => {})}
                    placeholder={field.placeholder}
                    className="form-input"
                  />
                );
              default:
                return null;
            }
          };

          return renderSearchComponent();

        case FieldType.CHECKBOX:
          return (
            <div className="checkbox-group">
              <input
                type="checkbox"
                id={field.key}
                checked={field.value}
                onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                className="form-checkbox"
                disabled={field.disabled}
              />
              <label htmlFor={field.key} className="checkbox-label">
                {field.title}
              </label>
            </div>
          );

        case FieldType.DISPLAY:
          return <div className="display-value">{field.value}</div>;

        default:
          return null;
      }
    })();

    return (
      <div key={field.key} className={`form-field ${field.className || ""}`}>
        {field.type !== FieldType.CHECKBOX && (
          <label
            className="form-label"
            htmlFor={
              field.type !== FieldType.DISPLAY &&
              field.type !== FieldType.TEXT_FIXED
                ? field.key
                : undefined
            }
          >
            {field.title}{" "}
            {"required" in field && field.required && (
              <span className="required">*</span>
            )}
          </label>
        )}
        {fieldContent}
        {error && <div className="field-error">{error}</div>}
      </div>
    );
  };

  return (
    <div className={`form-layout-container ${className}`}>
      <div className="form-layout-content">
        <div className="form-layout-header">
          <h1 className="title">{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
        <div className="form-fields">
          {formFields.map((field) => renderField(field))}
        </div>
        {buttonConfig && (
          <div className="form-layout-actions">
            {buttonConfig.cancel && (
              <CancelButton
                text={buttonConfig.cancel.text}
                onClick={buttonConfig.cancel.onClick}
                className={buttonConfig.cancel.className}
                type={buttonConfig.cancel.type}
              />
            )}
            {buttonConfig.secondary && (
              <DeleteButton
                text={buttonConfig.secondary.text}
                onClick={buttonConfig.secondary.onClick}
                className={buttonConfig.secondary.className}
                type={buttonConfig.secondary.type}
              />
            )}
            {buttonConfig.primary && (
              <ConfirmButton
                text={buttonConfig.primary.text}
                onClick={buttonConfig.primary.onClick}
                className={buttonConfig.primary.className}
                type={buttonConfig.primary.type}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormLayout;
