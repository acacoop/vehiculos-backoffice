import { useState, useEffect, useRef } from "react";
import type { User } from "../../types/user";
import type { Vehicle } from "../../types/vehicle";
import type { Maintenance } from "../../types/maintenance";
import type { VehicleBrand } from "../../types/vehicleBrand";
import type { VehicleModel } from "../../types/vehicleModel";
import type { Category } from "../../types/category";
import type { Assignment } from "../../types/assignment";
import { getVehicles } from "../../services/vehicles";
import { getUsers } from "../../services/users";
import { getVehicleModels } from "../../services/vehicleModels";
import { getVehicleBrands } from "../../services/vehicleBrands";
import { getMaintenanceCategories } from "../../services/categories";
import { getMaintenances } from "../../services/maintenances";
import { getAssignments } from "../../services/assignments";
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
  title: string; // Ahora es obligatorio
  changeButtonText?: string;

  minChars?: number;
  debounceMs?: number;
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
}: EntitySearchProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSelect = (item: T) => {
    onEntityChange(item);
    setSearchTerm("");
    setShowDropdown(false);
    setResults([]);
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
        {entity && (
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
            placeholder={placeholder}
            className="entity-search-input"
          />
          {isLoading && (
            <div className="entity-search-loading">Buscando...</div>
          )}
          {showDropdown && results.length > 0 && (
            <div className="entity-search-dropdown">
              {results.map((item, index) => (
                <div
                  key={index}
                  className="entity-search-dropdown-item"
                  onClick={() => handleSelect(item)}
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
    pagination: { offset: 0, limit: 10 },
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

// =============================================================================
// Wrapper Components
// =============================================================================

interface VehicleEntitySearchProps {
  vehicle: Vehicle | null;
  onVehicleChange: (vehicle: Vehicle | null) => void;
}

export function VehicleEntitySearch({
  vehicle,
  onVehicleChange,
}: VehicleEntitySearchProps) {
  const dropdownRender = (vehicle: Vehicle) => {
    const brand = vehicle.model?.brand?.name || "";
    const model = vehicle.model?.name || "";
    return `${brand} ${model} - ${vehicle.licensePlate}`;
  };

  return (
    <EntitySearch<Vehicle>
      entity={vehicle}
      onEntityChange={onVehicleChange}
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
    />
  );
}

interface UserEntitySearchProps {
  user: User | null;
  onUserChange: (user: User | null) => void;
}

export function UserEntitySearch({
  user,
  onUserChange,
}: UserEntitySearchProps) {
  const dropdownRender = (user: User) => {
    return `${user.firstName} ${user.lastName} - ${user.email}`;
  };

  return (
    <EntitySearch<User>
      entity={user}
      onEntityChange={onUserChange}
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
    />
  );
}

interface VehicleModelEntitySearchProps {
  model: VehicleModel | null;
  onModelChange: (model: VehicleModel | null) => void;
}

export function VehicleModelEntitySearch({
  model,
  onModelChange,
}: VehicleModelEntitySearchProps) {
  const searchFunction = (term: string) => searchVehicleModels(term);

  const dropdownRender = (model: VehicleModel) => {
    const brand = model.brand?.name || "";
    return `${brand} - ${model.name}`;
  };

  return (
    <EntitySearch<VehicleModel>
      entity={model}
      onEntityChange={onModelChange}
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
    />
  );
}

interface VehicleBrandEntitySearchProps {
  brand: VehicleBrand | null;
  onBrandChange: (brand: VehicleBrand | null) => void;
}

export function VehicleBrandEntitySearch({
  brand,
  onBrandChange,
}: VehicleBrandEntitySearchProps) {
  const dropdownRender = (brand: VehicleBrand) => brand.name;

  return (
    <EntitySearch<VehicleBrand>
      entity={brand}
      onEntityChange={onBrandChange}
      searchFunction={searchVehicleBrands}
      displayFields={[{ path: "name", label: "Marca" }]}
      dropdownRender={dropdownRender}
      placeholder="Buscar marca..."
      title="Datos de la Marca"
      changeButtonText="Cambiar marca"
    />
  );
}

interface CategoryEntitySearchProps {
  category: Category | null;
  onCategoryChange: (category: Category | null) => void;
}

export function MaintenanceCategoryEntitySearch({
  category,
  onCategoryChange,
}: CategoryEntitySearchProps) {
  const dropdownRender = (category: Category) => category.name;

  return (
    <EntitySearch<Category>
      entity={category}
      onEntityChange={onCategoryChange}
      searchFunction={searchCategories}
      displayFields={[{ path: "name", label: "Nombre" }]}
      dropdownRender={dropdownRender}
      placeholder="Buscar categoría..."
      title="Datos de la Categoría"
      changeButtonText="Cambiar categoría"
    />
  );
}

interface MaintenanceEntitySearchProps {
  maintenance: Maintenance | null;
  onMaintenanceChange: (maintenance: Maintenance | null) => void;
}

export function MaintenanceEntitySearch({
  maintenance,
  onMaintenanceChange,
}: MaintenanceEntitySearchProps) {
  const dropdownRender = (maintenance: Maintenance) => maintenance.name;

  return (
    <EntitySearch<Maintenance>
      entity={maintenance}
      onEntityChange={onMaintenanceChange}
      searchFunction={searchMaintenances}
      displayFields={[
        { path: "name", label: "Nombre" },
        { path: "description", label: "Descripción" },
      ]}
      dropdownRender={dropdownRender}
      placeholder="Buscar mantenimiento..."
      title="Datos del Mantenimiento"
      changeButtonText="Cambiar mantenimiento"
    />
  );
}

interface AssignmentEntitySearchProps {
  assignment: Assignment | null;
  onAssignmentChange: (assignment: Assignment | null) => void;
}

export function AssignmentEntitySearch({
  assignment,
  onAssignmentChange,
}: AssignmentEntitySearchProps) {
  const dropdownRender = (assignment: Assignment) => {
    const userName = assignment.user
      ? `${assignment.user.firstName} ${assignment.user.lastName}`
      : "";
    const vehiclePlate = assignment.vehicle?.licensePlate || "";
    return `${userName} - ${vehiclePlate}`;
  };

  return (
    <EntitySearch<Assignment>
      entity={assignment}
      onEntityChange={onAssignmentChange}
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
    />
  );
}
