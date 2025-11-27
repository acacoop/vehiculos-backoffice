import { useState, useEffect, useRef } from "react";
import type { User } from "../../types/user";
import type { Vehicle } from "../../types/vehicle";
import type { Maintenance } from "../../types/maintenance";
import type { VehicleBrand } from "../../types/vehicleBrand";
import type { VehicleModel } from "../../types/vehicleModel";
import type { Category } from "../../types/category";
import type { Assignment } from "../../types/assignment";
import type { MaintenanceChecklist } from "../../types/maintenanceChecklist";
import { getVehicles } from "../../services/vehicles";
import { getUsers } from "../../services/users";
import { getVehicleModels } from "../../services/vehicleModels";
import { getVehicleBrands } from "../../services/vehicleBrands";
import { getMaintenanceCategories } from "../../services/categories";
import { getMaintenances } from "../../services/maintenances";
import { getAssignments } from "../../services/assignments";
import { getMaintenanceChecklists } from "../../services/maintenanceChecklists";
import { QUARTER_LABELS } from "../../common";
import "./EntitySearch.css";

interface DisplayField<T> {
  path: keyof T | string;
  label: string;
}

interface EntitySearchProps<T> {
  entity: T | null;
  onEntityChange: (entity: T | null) => void;
  searchFunction: (term: string) => Promise<T[]>;
  displayFields: DisplayField<T>[];
  dropdownRender: (item: T) => string;

  placeholder?: string;
  title: string;
  changeButtonText?: string;

  minChars?: number;
  debounceMs?: number;
  disabled?: boolean;
}

export function EntitySearch<T>({
  entity,
  onEntityChange,
  searchFunction,
  displayFields,
  dropdownRender,

  placeholder = "Buscar...",
  title,
  changeButtonText = "Cambiar",

  minChars = 1,
  debounceMs = 300,
  disabled = false,
}: EntitySearchProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const debounceTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (searchTerm.length < minChars) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchFunction(searchTerm);
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, searchFunction, minChars, debounceMs]);

  useEffect(() => {
    // Reset or clamp selected index when results change
    if (results.length === 0) {
      setSelectedIndex(-1);
    } else if (selectedIndex < 0) {
      setSelectedIndex(0);
    } else if (selectedIndex >= results.length) {
      setSelectedIndex(results.length - 1);
    }
  }, [results, selectedIndex]);

  useEffect(() => {
    if (!showDropdown) return;
    if (selectedIndex < 0) return;

    const el = itemRefs.current[selectedIndex];
    if (el && typeof el.scrollIntoView === "function") {
      // Use nearest so the container scrolls minimally to show the item
      el.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, showDropdown]);

  const handleSelect = (item: T) => {
    onEntityChange(item);
    setSearchTerm("");
    setShowDropdown(false);
    setResults([]);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    onEntityChange(null);
  };

  const getNestedValue = (obj: T, path: string): string => {
    const keys = path.split(".");
    let value: unknown = obj;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return "";
      }
    }

    return String(value || "");
  };

  const renderSelectedEntity = (item: T) => {
    return (
      <div className="entity-search-selected-grid">
        {displayFields.map((field, index) => (
          <div key={index} className="entity-search-selected-field">
            <span className="entity-search-selected-label">{field.label}:</span>
            <span className="entity-search-selected-value">
              {getNestedValue(item, String(field.path))}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="entity-search">
      <div className="entity-search-header">
        <h3 className="entity-search-title">{title}</h3>
        {entity && !disabled && (
          <button
            type="button"
            className="entity-search-change-button"
            onClick={handleClear}
          >
            {changeButtonText}
          </button>
        )}
      </div>
      {entity ? (
        renderSelectedEntity(entity)
      ) : (
        <div className="entity-search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() =>
              searchTerm.length >= minChars && setShowDropdown(true)
            }
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onKeyDown={(e) => {
              if (
                !showDropdown &&
                results.length > 0 &&
                (e.key === "ArrowDown" || e.key === "ArrowUp")
              ) {
                setShowDropdown(true);
              }

              switch (e.key) {
                case "ArrowDown":
                  e.preventDefault();
                  setSelectedIndex((prev) => {
                    const next =
                      prev < 0 ? 0 : Math.min(prev + 1, results.length - 1);
                    return next;
                  });
                  break;
                case "ArrowUp":
                  e.preventDefault();
                  setSelectedIndex((prev) => Math.max(prev - 1, 0));
                  break;
                case "Enter":
                  e.preventDefault(); // Always prevent default to avoid form submission
                  if (
                    showDropdown &&
                    selectedIndex >= 0 &&
                    selectedIndex < results.length
                  ) {
                    handleSelect(results[selectedIndex]);
                  }
                  break;
                case "Escape":
                  setShowDropdown(false);
                  setSelectedIndex(-1);
                  break;
                default:
                  break;
              }
            }}
            placeholder={placeholder}
            className="entity-search-input"
            aria-haspopup="listbox"
            aria-expanded={showDropdown}
            aria-controls="entity-search-dropdown"
            disabled={disabled}
          />
          {isLoading && (
            <div className="entity-search-loading">Buscando...</div>
          )}
          {showDropdown && results.length > 0 && (
            <div
              id="entity-search-dropdown"
              className="entity-search-dropdown"
              role="listbox"
            >
              {results.map((item, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  id={`entity-search-item-${index}`}
                  role="option"
                  aria-selected={selectedIndex === index}
                  className={`entity-search-dropdown-item ${
                    selectedIndex === index ? "selected" : ""
                  }`}
                  onMouseDown={(e) => {
                    // prevent blur before click handler runs
                    e.preventDefault();
                  }}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {dropdownRender(item)}
                </div>
              ))}
            </div>
          )}
          {showDropdown &&
            !isLoading &&
            results.length === 0 &&
            searchTerm.length >= minChars && (
              <div className="entity-search-no-results">
                No se encontraron resultados
              </div>
            )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Search Functions
// =============================================================================

async function searchVehicles(term: string): Promise<Vehicle[]> {
  const response = await getVehicles({
    search: term,
    pagination: { offset: 0, limit: 10 },
  });
  return response.success ? response.data : [];
}

async function searchUsers(term: string): Promise<User[]> {
  const response = await getUsers({
    search: term,
    pagination: { offset: 0, limit: 10 },
  });
  return response.success ? response.data : [];
}

async function searchVehicleModels(term: string): Promise<VehicleModel[]> {
  const response = await getVehicleModels({
    search: term,
    pagination: { offset: 0, limit: 10 },
  });
  return response.success ? response.data : [];
}

async function searchVehicleBrands(term: string): Promise<VehicleBrand[]> {
  const response = await getVehicleBrands({
    search: term,
    pagination: { offset: 0, limit: 10 },
  });
  return response.success ? response.data : [];
}

async function searchCategories(term: string): Promise<Category[]> {
  const response = await getMaintenanceCategories({
    search: term,
    pagination: { offset: 0, limit: 10 },
  });
  return response.success ? response.data : [];
}

async function searchMaintenances(term: string): Promise<Maintenance[]> {
  const response = await getMaintenances({
    search: term,
    pagination: { offset: 0, limit: 5 },
  });
  return response.success ? response.data : [];
}

async function searchAssignments(term: string): Promise<Assignment[]> {
  const response = await getAssignments({
    search: term,
    pagination: { offset: 0, limit: 10 },
  });
  return response.success ? response.data : [];
}

async function searchMaintenanceChecklists(
  term: string,
): Promise<MaintenanceChecklist[]> {
  const response = await getMaintenanceChecklists({
    search: term,
    pagination: { offset: 0, limit: 10 },
  });
  return response.success ? response.data : [];
}

// =============================================================================
// Wrapper Components
// =============================================================================

interface EntitySearchWrapperProps<T> {
  entity: T | null;
  onEntityChange: (entity: T | null) => void;
  disabled?: boolean;
}

export function VehicleEntitySearch({
  entity,
  onEntityChange,
  disabled = false,
}: EntitySearchWrapperProps<Vehicle>) {
  const dropdownRender = (vehicle: Vehicle) => {
    const brand = vehicle.model?.brand?.name || "";
    const model = vehicle.model?.name || "";
    return `${brand} ${model} - ${vehicle.licensePlate}`;
  };

  return (
    <EntitySearch<Vehicle>
      entity={entity}
      onEntityChange={onEntityChange}
      searchFunction={searchVehicles}
      displayFields={[
        { path: "model.brand.name", label: "Marca" },
        { path: "model.name", label: "Modelo" },
        { path: "licensePlate", label: "Patente" },
        { path: "year", label: "Año" },
      ]}
      dropdownRender={dropdownRender}
      placeholder="Buscar vehículo..."
      title="Datos del Vehículo"
      changeButtonText="Cambiar vehículo"
      disabled={disabled}
    />
  );
}

export function UserEntitySearch({
  entity,
  onEntityChange,
  disabled = false,
}: EntitySearchWrapperProps<User>) {
  const dropdownRender = (user: User) => {
    return `${user.firstName} ${user.lastName} - ${user.email}`;
  };

  return (
    <EntitySearch<User>
      entity={entity}
      onEntityChange={onEntityChange}
      searchFunction={searchUsers}
      displayFields={[
        { path: "firstName", label: "Nombre" },
        { path: "lastName", label: "Apellido" },
        { path: "email", label: "Email" },
        { path: "cuit", label: "CUIT" },
      ]}
      dropdownRender={dropdownRender}
      placeholder="Buscar usuario..."
      title="Datos del Usuario"
      changeButtonText="Cambiar usuario"
      disabled={disabled}
    />
  );
}

export function VehicleModelEntitySearch({
  entity,
  onEntityChange,
  disabled = false,
}: EntitySearchWrapperProps<VehicleModel>) {
  const searchFunction = (term: string) => searchVehicleModels(term);

  const dropdownRender = (model: VehicleModel) => {
    const brand = model.brand?.name || "";
    return `${brand} - ${model.name}`;
  };

  return (
    <EntitySearch<VehicleModel>
      entity={entity}
      onEntityChange={onEntityChange}
      searchFunction={searchFunction}
      displayFields={[
        { path: "brand.name", label: "Marca" },
        { path: "name", label: "Modelo" },
        { path: "vehicleType", label: "Tipo" },
      ]}
      dropdownRender={dropdownRender}
      placeholder="Buscar modelo..."
      title="Datos del Modelo"
      changeButtonText="Cambiar modelo"
      disabled={disabled}
    />
  );
}

export function VehicleBrandEntitySearch({
  entity,
  onEntityChange,
  disabled = false,
}: EntitySearchWrapperProps<VehicleBrand>) {
  const dropdownRender = (brand: VehicleBrand) => brand.name;

  return (
    <EntitySearch<VehicleBrand>
      entity={entity}
      onEntityChange={onEntityChange}
      searchFunction={searchVehicleBrands}
      displayFields={[{ path: "name", label: "Marca" }]}
      dropdownRender={dropdownRender}
      placeholder="Buscar marca..."
      title="Datos de la Marca"
      changeButtonText="Cambiar marca"
      disabled={disabled}
    />
  );
}

export function MaintenanceCategoryEntitySearch({
  entity,
  onEntityChange,
  disabled = false,
}: EntitySearchWrapperProps<Category>) {
  const dropdownRender = (category: Category) => category.name;

  return (
    <EntitySearch<Category>
      entity={entity}
      onEntityChange={onEntityChange}
      searchFunction={searchCategories}
      displayFields={[{ path: "name", label: "Nombre" }]}
      dropdownRender={dropdownRender}
      placeholder="Buscar categoría..."
      title="Datos de la Categoría"
      changeButtonText="Cambiar categoría"
      disabled={disabled}
    />
  );
}

export function MaintenanceEntitySearch({
  entity,
  onEntityChange,
  disabled = false,
}: EntitySearchWrapperProps<Maintenance>) {
  const dropdownRender = (maintenance: Maintenance) => maintenance.name;

  return (
    <EntitySearch<Maintenance>
      entity={entity}
      onEntityChange={onEntityChange}
      searchFunction={searchMaintenances}
      displayFields={[
        { path: "name", label: "Nombre" },
        { path: "category.name", label: "Categoría" },
      ]}
      dropdownRender={dropdownRender}
      placeholder="Buscar mantenimiento..."
      title="Datos del Mantenimiento"
      changeButtonText="Cambiar mantenimiento"
      disabled={disabled}
    />
  );
}

export function AssignmentEntitySearch({
  entity,
  onEntityChange,
  disabled = false,
}: EntitySearchWrapperProps<Assignment>) {
  const dropdownRender = (assignment: Assignment) => {
    const userName = assignment.user
      ? `${assignment.user.firstName} ${assignment.user.lastName}`
      : "";
    const vehiclePlate = assignment.vehicle?.licensePlate || "";
    return `${userName} - ${vehiclePlate}`;
  };

  return (
    <EntitySearch<Assignment>
      entity={entity}
      onEntityChange={onEntityChange}
      searchFunction={searchAssignments}
      displayFields={[
        { path: "user.firstName", label: "Usuario" },
        { path: "vehicle.licensePlate", label: "Vehículo" },
        { path: "startDate", label: "Fecha Inicio" },
        { path: "endDate", label: "Fecha Fin" },
      ]}
      dropdownRender={dropdownRender}
      placeholder="Buscar asignación..."
      title="Datos de la Asignación"
      changeButtonText="Cambiar asignación"
      disabled={disabled}
    />
  );
}

export function MaintenanceChecklistEntitySearch({
  entity,
  onEntityChange,
  disabled = false,
}: EntitySearchWrapperProps<MaintenanceChecklist>) {
  const dropdownRender = (checklist: MaintenanceChecklist) => {
    const vehicle = checklist.vehicle;
    const vehicleInfo = vehicle
      ? `${vehicle.model?.brand?.name || ""} ${vehicle.model?.name || ""} - ${
          vehicle.licensePlate
        }`.trim()
      : "";
    const period = `${checklist.year} ${
      QUARTER_LABELS[checklist.quarter] || checklist.quarter
    }`;
    return `${vehicleInfo} - ${period}`;
  };

  return (
    <EntitySearch<MaintenanceChecklist>
      entity={entity}
      onEntityChange={onEntityChange}
      searchFunction={searchMaintenanceChecklists}
      displayFields={[
        { path: "vehicle.licensePlate", label: "Vehículo" },
        { path: "year", label: "Año" },
        { path: "quarter", label: "Trimestre" },
        { path: "intendedDeliveryDate", label: "Fecha Entrega" },
      ]}
      dropdownRender={dropdownRender}
      placeholder="Buscar checklist..."
      title="Datos del Checklist"
      changeButtonText="Cambiar checklist"
      disabled={disabled}
    />
  );
}
