import React from "react";
import "./Form.css";

// ============ BASE FIELD INTERFACE ============
interface BaseField {
  key: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  show?: boolean;
}

// ============ SPECIFIC FIELD TYPES ============
export interface TextField extends BaseField {
  type: "text" | "email";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface NumberField extends BaseField {
  type: "number";
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface DateField extends BaseField {
  type: "date";
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

export interface TextAreaField extends BaseField {
  type: "textarea";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export interface SelectField extends BaseField {
  type: "select";
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

export interface CheckboxField extends BaseField {
  type: "checkbox";
  value: boolean;
  onChange: (value: boolean) => void;
}

export interface DisplayField extends BaseField {
  type: "display";
  value: string | number | React.ReactNode;
}

// ============ UNION TYPE ============
export type FormField =
  | TextField
  | NumberField
  | DateField
  | TextAreaField
  | SelectField
  | CheckboxField
  | DisplayField;

// ============ SECTION CONFIGURATION ============
export interface FieldsSection {
  type: "fields";
  title: string;
  fields: FormField[];
  layout?: "vertical" | "horizontal" | "grid";
  columns?: number; // For grid layout (default: 2)
  className?: string;
}

export interface EntitySection {
  type: "entity";
  className?: string;
  render: React.ReactNode;
}

export type FormSection = FieldsSection | EntitySection;

// ============ BUTTON CONFIGURATION ============
export interface FormButton {
  text: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
}

// ============ MAIN PROPS ============
interface FormProps {
  title?: string;
  sections: FormSection[];
  buttons?: FormButton[];
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

const Form: React.FC<FormProps> = ({
  title,
  sections,
  buttons = [],
  className = "",
  onSubmit,
}) => {
  const renderField = (field: FormField) => {
    // Skip hidden fields
    if (field.show === false) {
      return null;
    }

    const baseClassName = `form-field ${field.className || ""}`;

    // ========== DISPLAY FIELD ==========
    if (field.type === "display") {
      return (
        <div key={field.key} className={`${baseClassName} display-field`}>
          <label className="form-label">{field.label}</label>
          <div className="display-value">{field.value}</div>
        </div>
      );
    }

    // ========== CHECKBOX ==========
    if (field.type === "checkbox") {
      return (
        <div key={field.key} className={`${baseClassName} checkbox-field`}>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id={field.key}
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              className="form-checkbox"
              disabled={field.disabled}
            />
            <label htmlFor={field.key} className="checkbox-label">
              {field.label}
            </label>
          </div>
        </div>
      );
    }

    // ========== SELECT ==========
    if (field.type === "select") {
      return (
        <div key={field.key} className={baseClassName}>
          <label className="form-label" htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="required">*</span>}
          </label>
          <select
            id={field.key}
            className="form-select"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            disabled={field.disabled}
            required={field.required}
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // ========== TEXTAREA ==========
    if (field.type === "textarea") {
      return (
        <div key={field.key} className={baseClassName}>
          <label className="form-label" htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="required">*</span>}
          </label>
          <textarea
            id={field.key}
            className="form-textarea"
            placeholder={field.placeholder}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            disabled={field.disabled}
            required={field.required}
            rows={field.rows || 4}
          />
        </div>
      );
    }

    // ========== NUMBER INPUT ==========
    if (field.type === "number") {
      return (
        <div key={field.key} className={baseClassName}>
          <label className="form-label" htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            id={field.key}
            type="number"
            className="form-input"
            placeholder={field.placeholder}
            value={field.value}
            min={field.min}
            max={field.max}
            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
            disabled={field.disabled}
            required={field.required}
          />
        </div>
      );
    }

    // ========== DATE INPUT ==========
    if (field.type === "date") {
      return (
        <div key={field.key} className={baseClassName}>
          <label className="form-label" htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            id={field.key}
            type="date"
            className="form-input"
            value={field.value}
            min={field.min}
            max={field.max}
            onChange={(e) => field.onChange(e.target.value)}
            disabled={field.disabled}
            required={field.required}
          />
        </div>
      );
    }

    // ========== TEXT/EMAIL INPUT ==========
    if (field.type === "text" || field.type === "email") {
      return (
        <div key={field.key} className={baseClassName}>
          <label className="form-label" htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            id={field.key}
            type={field.type}
            className="form-input"
            placeholder={field.placeholder}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            disabled={field.disabled}
            required={field.required}
          />
        </div>
      );
    }

    return null;
  };

  const getLayoutClass = (section: FieldsSection) => {
    const layout = section.layout || "vertical";
    if (layout === "grid") {
      return `section-fields-grid grid-cols-${section.columns || 2}`;
    }
    return layout === "horizontal"
      ? "section-fields-horizontal"
      : "section-fields-vertical";
  };

  const getButtonClass = (variant?: string) => {
    switch (variant) {
      case "primary":
        return "btn-primary";
      case "secondary":
        return "btn-secondary";
      case "danger":
        return "btn-danger";
      default:
        return "btn-primary";
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className={`form ${className}`}>
      <form className="form-content" onSubmit={handleFormSubmit}>
        {title && (
          <div className="form-header">
            <h1 className="form-title">{title}</h1>
          </div>
        )}

        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`form-section ${section.className || ""}`}
          >
            {section.type === "entity" ? (
              // ========== ENTITY SECTION ==========
              section.render
            ) : (
              // ========== FIELDS SECTION ==========
              <>
                <div className="section-header">
                  <h2 className="section-title">{section.title}</h2>
                </div>

                <div className={`section-fields ${getLayoutClass(section)}`}>
                  {section.fields.map((field) => renderField(field))}
                </div>
              </>
            )}
          </div>
        ))}

        {buttons.length > 0 && (
          <div className="form-actions">
            {buttons.map((button, index) => (
              <button
                key={index}
                type={button.type || "button"}
                className={`form-btn ${getButtonClass(button.variant)}`}
                onClick={button.onClick}
                disabled={button.disabled || button.loading}
              >
                {button.loading ? "Procesando..." : button.text}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default Form;
