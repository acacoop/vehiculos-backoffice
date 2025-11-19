import React, { useState } from "react";
import "./Form.css";
import { CancelButton, DeleteButton, ConfirmButton } from "../Buttons/Buttons";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";

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
  placeholder?: string;
}

export interface CheckboxField extends BaseField {
  type: "checkbox";
  value: boolean;
  onChange: (value: boolean) => void;
}

export interface SwitchField extends BaseField {
  type: "switch";
  value: boolean;
  onChange: (value: boolean) => void;
  activeText?: string;
  inactiveText?: string;
  confirmTitle?: string;
  confirmMessage?: string;
  confirmText?: string;
  cancelText?: string;
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
  | SwitchField
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
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    field?: SwitchField;
    newValue?: boolean;
    onConfirm?: () => void;
  }>({ open: false });
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
            {field.placeholder && (
              <option value="" disabled>
                {field.placeholder}
              </option>
            )}
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

    // ========== SWITCH INPUT ==========
    if (field.type === "switch") {
      const activeText = field.activeText || "Activo";
      const inactiveText = field.inactiveText || "Inactivo";

      return (
        <div key={field.key} className={`${baseClassName} switch-field`}>
          <label className="form-label">{field.label}</label>
          <div className="switch-container">
            <div className="switch-status">
              <span className={`status-text ${field.value ? "active" : ""}`}>
                {field.value ? activeText : inactiveText}
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  if (field.confirmMessage) {
                    setConfirmDialog({
                      open: true,
                      field,
                      newValue,
                      onConfirm: () => {
                        field.onChange(newValue);
                        setConfirmDialog({ open: false });
                      },
                    });
                  } else {
                    field.onChange(newValue);
                  }
                }}
                disabled={field.disabled}
              />
              <span className="switch-slider"></span>
            </label>
          </div>
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
            {buttons.map((button, index) => {
              const buttonProps = {
                text: button.text,
                onClick: button.onClick,
                disabled: button.disabled,
                loading: button.loading,
                type: button.type || ("button" as const),
              };

              // Usar el componente apropiado según la variante
              switch (button.variant) {
                case "secondary":
                  return <CancelButton {...buttonProps} key={index} />;
                case "danger":
                  return <DeleteButton {...buttonProps} key={index} />;
                case "primary":
                default:
                  return <ConfirmButton {...buttonProps} key={index} />;
              }
            })}
          </div>
        )}
      </form>

      {confirmDialog.field && (
        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.field.confirmTitle || "Confirmar acción"}
          message={
            confirmDialog.field.confirmMessage ||
            "¿Estás seguro de que quieres cambiar este valor?"
          }
          onConfirm={confirmDialog.onConfirm || (() => {})}
          onCancel={() => setConfirmDialog({ open: false })}
          confirmText={confirmDialog.field.confirmText || "Confirmar"}
          cancelText={confirmDialog.field.cancelText || "Cancelar"}
        />
      )}
    </div>
  );
};

export default Form;
