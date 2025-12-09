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
  span?: number;
}

// ============ SPECIFIC FIELD TYPES ============
export interface TextField extends BaseField {
  type: "text" | "email";
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface NumberField extends BaseField {
  type: "number";
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface DateField extends BaseField {
  type: "date";
  value: string | undefined;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

export interface TimeField extends BaseField {
  type: "time";
  value: string | undefined;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  step?: number;
}

export interface TextAreaField extends BaseField {
  type: "textarea";
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export interface SelectField extends BaseField {
  type: "select";
  value: string | undefined;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export interface CheckboxField extends BaseField {
  type: "checkbox";
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}

export interface SwitchField extends BaseField {
  type: "switch";
  value: boolean | undefined;
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
  | TimeField
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
  render: (props: { disabled: boolean }) => React.ReactNode;
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

// ============ MODE CONFIGURATION ============
export type FormMode = "create" | "edit" | "view";

export interface FormModeConfig {
  isNew: boolean;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  saving?: boolean;
  entityName?: string; // Ej: "Vehículo", "Categoría"
  // Textos personalizables
  texts?: {
    create?: string; // Default: "Crear {entityName}"
    save?: string; // Default: "Guardar Cambios"
    saving?: string; // Default: "Guardando..."
    cancel?: string; // Default: "Cancelar"
    edit?: string; // Default: "Editar"
    delete?: string; // Default: "Eliminar"
  };
}

// Helper para calcular el modo basado en isNew e isEditing
const getFormMode = (isNew: boolean, isEditing: boolean): FormMode => {
  if (isNew) return "create";
  if (isEditing) return "edit";
  return "view";
};

// ============ MAIN PROPS ============
interface FormProps {
  title?: string;
  sections: FormSection[];
  /** @deprecated Use modeConfig instead */
  buttons?: FormButton[];
  modeConfig?: FormModeConfig;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

const Form: React.FC<FormProps> = ({
  title,
  sections,
  buttons = [],
  modeConfig,
  className = "",
  onSubmit,
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    field?: SwitchField;
    newValue?: boolean;
    onConfirm?: () => void;
  }>({ open: false });

  // ========== MODE-BASED LOGIC ==========
  const mode = modeConfig
    ? getFormMode(modeConfig.isNew, modeConfig.isEditing)
    : undefined;
  const isViewMode = mode === "view";

  const renderField = (field: FormField) => {
    // Skip hidden fields
    if (field.show === false) {
      return null;
    }

    // Apply mode-based disabled state
    const isDisabled = field.disabled || isViewMode;

    const baseClassName = `form-field ${field.className || ""}`;
    const spanStyle = field.span ? { gridColumn: `span ${field.span}` } : {};

    // ========== DISPLAY FIELD ==========
    if (field.type === "display") {
      return (
        <div
          key={field.key}
          className={`${baseClassName} display-field`}
          style={spanStyle}
        >
          <label className="form-label">{field.label}</label>
          <div className="display-value">{field.value}</div>
        </div>
      );
    }

    // ========== CHECKBOX ==========
    if (field.type === "checkbox") {
      return (
        <div
          key={field.key}
          className={`${baseClassName} checkbox-field`}
          style={spanStyle}
        >
          <div className="checkbox-group">
            <input
              type="checkbox"
              id={field.key}
              checked={field.value ?? false}
              onChange={(e) => field.onChange(e.target.checked)}
              className="form-checkbox"
              disabled={isDisabled}
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
        <div key={field.key} className={baseClassName} style={spanStyle}>
          <label className="form-label" htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="required">*</span>}
          </label>
          <select
            id={field.key}
            className="form-select"
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            disabled={isDisabled}
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
        <div key={field.key} className={baseClassName} style={spanStyle}>
          <label className="form-label" htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="required">*</span>}
          </label>
          <textarea
            id={field.key}
            className="form-textarea"
            placeholder={field.placeholder}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            disabled={isDisabled}
            required={field.required}
            rows={field.rows || 4}
          />
        </div>
      );
    }

    // ========== NUMBER INPUT ==========
    if (field.type === "number") {
      return (
        <div key={field.key} className={baseClassName} style={spanStyle}>
          <label className="form-label" htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            id={field.key}
            type="number"
            className="form-input"
            placeholder={field.placeholder}
            value={field.value ?? ""}
            min={field.min}
            max={field.max}
            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
            disabled={isDisabled}
            required={field.required}
          />
        </div>
      );
    }

    // ========== DATE INPUT ==========
    if (field.type === "date") {
      return (
        <div key={field.key} className={baseClassName} style={spanStyle}>
          <label className="form-label" htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            id={field.key}
            type="date"
            className="form-input"
            value={field.value ?? ""}
            min={field.min}
            max={field.max}
            onChange={(e) => field.onChange(e.target.value)}
            disabled={isDisabled}
            required={field.required}
          />
        </div>
      );
    }

    // ========== TIME INPUT ==========
    if (field.type === "time") {
      return (
        <div key={field.key} className={baseClassName}>
          <label className="form-label" htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            id={field.key}
            type="time"
            className="form-input"
            value={field.value ?? ""}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(e) => field.onChange(e.target.value)}
            disabled={isDisabled}
            required={field.required}
          />
        </div>
      );
    }

    // ========== TEXT/EMAIL INPUT ==========
    if (field.type === "text" || field.type === "email") {
      return (
        <div key={field.key} className={baseClassName} style={spanStyle}>
          <label className="form-label" htmlFor={field.key}>
            {field.label}{" "}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            id={field.key}
            type={field.type}
            className="form-input"
            placeholder={field.placeholder}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            disabled={isDisabled}
            required={field.required}
          />
        </div>
      );
    }

    // ========== SWITCH INPUT ==========
    if (field.type === "switch") {
      const activeText = field.activeText || "Activo";
      const inactiveText = field.inactiveText || "Inactivo";
      const checked = field.value ?? false;

      return (
        <div
          key={field.key}
          className={`${baseClassName} switch-field`}
          style={spanStyle}
        >
          <label className="form-label">{field.label}</label>
          <div className="switch-container">
            <div className="switch-status">
              <span className={`status-text ${checked ? "active" : ""}`}>
                {checked ? activeText : inactiveText}
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={checked}
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
                disabled={isDisabled}
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

  // Generate buttons based on modeConfig or use legacy buttons
  const getButtons = (): FormButton[] => {
    if (!modeConfig) {
      return buttons;
    }

    const {
      isNew,
      isEditing,
      onSave,
      onCancel,
      onEdit,
      onDelete,
      saving = false,
      entityName = "",
      texts = {},
    } = modeConfig;

    const mode = getFormMode(isNew, isEditing);

    // Textos con defaults
    const t = {
      create: texts.create || `Crear ${entityName}`.trim(),
      save: texts.save || "Guardar Cambios",
      saving: texts.saving || "Guardando...",
      cancel: texts.cancel || "Cancelar",
      edit: texts.edit || "Editar",
      delete: texts.delete || "Eliminar",
    };

    // Crear todos los botones disponibles
    const cancelButton: FormButton = {
      text: t.cancel,
      variant: "secondary",
      onClick: onCancel,
      disabled: saving,
    };

    const createButton: FormButton = {
      text: saving ? t.saving : t.create,
      variant: "primary",
      onClick: onSave,
      disabled: saving,
      loading: saving,
    };

    const saveButton: FormButton = {
      text: saving ? t.saving : t.save,
      variant: "primary",
      onClick: onSave,
      disabled: saving,
      loading: saving,
    };

    const editButton: FormButton = {
      text: t.edit,
      variant: "primary",
      onClick: onEdit || (() => {}),
    };

    const deleteButton: FormButton = {
      text: t.delete,
      variant: "danger",
      onClick: onDelete || (() => {}),
      disabled: saving,
    };

    // Construir array según el modo
    const result: FormButton[] = [];

    switch (mode) {
      case "create":
        result.push(cancelButton);
        result.push(createButton);
        break;

      case "edit":
        result.push(cancelButton);
        if (onDelete) result.push(deleteButton);
        result.push(saveButton);
        break;

      case "view":
        if (onEdit) result.push(editButton);
        if (onDelete) result.push(deleteButton);
        break;
    }

    return result;
  };

  const finalButtons = getButtons();

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
              section.render({ disabled: isViewMode })
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

        {finalButtons.length > 0 && (
          <div className="form-actions">
            {finalButtons.map((button, index) => {
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
