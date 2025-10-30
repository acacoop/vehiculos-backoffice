import type { User } from "../../types/user";
import type { Vehicle } from "../../types/vehicle";
import type { Maintenance } from "../../types/maintenance";
import type { MaintenancePossibleNormalized } from "../../services/maintenances";
import type { VehicleBrand, VehicleModelType } from "../../types/vehicle";

interface UserSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  availableUsers: User[];
  showDropdown: boolean;
  onUserSelect: (user: User) => void;
  onDropdownToggle: (show: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function UserSearch({
  searchTerm,
  onSearchChange,
  availableUsers,
  showDropdown,
  onUserSelect,
  onDropdownToggle,
  placeholder = "Buscar por nombre o CUIT...",
  className = "reservation-form-input",
}: UserSearchProps) {
  return (
    <div className="user-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => searchTerm.length > 2 && onDropdownToggle(true)}
        onBlur={() => setTimeout(() => onDropdownToggle(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {showDropdown && availableUsers.length > 0 && (
        <div className="user-dropdown">
          {availableUsers.map((user) => (
            <div
              key={user.id}
              className="user-dropdown-item"
              onClick={() => onUserSelect(user)}
            >
              {user.firstName} {user.lastName} - CUIT: {user.cuit}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface VehicleSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  availableVehicles: Vehicle[];
  showDropdown: boolean;
  onVehicleSelect: (vehicle: Vehicle) => void;
  onDropdownToggle: (show: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function VehicleSearch({
  searchTerm,
  onSearchChange,
  availableVehicles,
  showDropdown,
  onVehicleSelect,
  onDropdownToggle,
  placeholder = "Buscar por marca, modelo o patente...",
  className = "reservation-form-input",
}: VehicleSearchProps) {
  return (
    <div className="vehicle-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => searchTerm.length > 2 && onDropdownToggle(true)}
        onBlur={() => setTimeout(() => onDropdownToggle(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {showDropdown && availableVehicles.length > 0 && (
        <div className="vehicle-dropdown">
          {availableVehicles.map((vehicle) => {
            const brand =
              (vehicle as any).brandName ||
              vehicle.brand ||
              vehicle.modelObj?.brand?.name ||
              "";
            const model =
              (vehicle as any).modelName ||
              vehicle.model ||
              vehicle.modelObj?.name ||
              "";
            return (
              <div
                key={vehicle.id}
                className="vehicle-dropdown-item"
                onClick={() => onVehicleSelect(vehicle)}
              >
                {brand} {model} - {vehicle.licensePlate}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CategorySearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  availableCategories: Maintenance[];
  showDropdown: boolean;
  onCategorySelect: (category: Maintenance) => void;
  onDropdownToggle: (show: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function CategorySearch({
  searchTerm,
  onSearchChange,
  availableCategories,
  showDropdown,
  onCategorySelect,
  onDropdownToggle,
  placeholder = "Buscar categoría...",
  className = "reservation-form-input",
}: CategorySearchProps) {
  return (
    <div className="category-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => searchTerm.length >= 1 && onDropdownToggle(true)}
        onBlur={() => setTimeout(() => onDropdownToggle(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {showDropdown && availableCategories.length > 0 && (
        <div className="category-dropdown">
          {availableCategories.map((category) => (
            <div
              key={category.id}
              className="category-dropdown-item"
              onClick={() => onCategorySelect(category)}
            >
              {category.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface MaintenanceSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  availableMaintenances: MaintenancePossibleNormalized[];
  showDropdown: boolean;
  onMaintenanceSelect: (maintenance: MaintenancePossibleNormalized) => void;
  onDropdownToggle: (show: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function MaintenanceSearch({
  searchTerm,
  onSearchChange,
  availableMaintenances,
  showDropdown,
  onMaintenanceSelect,
  onDropdownToggle,
  placeholder = "Buscar mantenimiento...",
  className = "reservation-form-input",
}: MaintenanceSearchProps) {
  return (
    <div className="maintenance-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => searchTerm.length >= 1 && onDropdownToggle(true)}
        onBlur={() => setTimeout(() => onDropdownToggle(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {showDropdown && availableMaintenances.length > 0 && (
        <div className="maintenance-dropdown">
          {availableMaintenances.map((maintenance) => (
            <div
              key={maintenance.id}
              className="maintenance-dropdown-item"
              onClick={() => onMaintenanceSelect(maintenance)}
            >
              {maintenance.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface BrandSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  availableBrands: VehicleBrand[];
  showDropdown: boolean;
  onBrandSelect: (brand: VehicleBrand) => void;
  onDropdownToggle: (show: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function BrandSearch({
  searchTerm,
  onSearchChange,
  availableBrands,
  showDropdown,
  onBrandSelect,
  onDropdownToggle,
  placeholder = "Buscar marca...",
  className = "reservation-form-input",
}: BrandSearchProps) {
  return (
    <div className="brand-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => searchTerm.length >= 1 && onDropdownToggle(true)}
        onBlur={() => setTimeout(() => onDropdownToggle(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {showDropdown && availableBrands.length > 0 && (
        <div className="brand-dropdown">
          {availableBrands.map((brand) => (
            <div
              key={brand.id}
              className="brand-dropdown-item"
              onClick={() => onBrandSelect(brand)}
            >
              {brand.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface VehicleTypeSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  availableVehicleTypes: string[];
  showDropdown: boolean;
  onVehicleTypeSelect: (vehicleType: string) => void;
  onDropdownToggle: (show: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function VehicleTypeSearch({
  searchTerm,
  onSearchChange,
  availableVehicleTypes,
  showDropdown,
  onVehicleTypeSelect,
  onDropdownToggle,
  placeholder = "Buscar tipo de vehículo...",
  className = "reservation-form-input",
}: VehicleTypeSearchProps) {
  return (
    <div className="brand-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => searchTerm.length >= 1 && onDropdownToggle(true)}
        onBlur={() => setTimeout(() => onDropdownToggle(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {showDropdown && availableVehicleTypes.length > 0 && (
        <div className="brand-dropdown">
          {availableVehicleTypes.map((type) => (
            <div
              key={type}
              className="brand-dropdown-item"
              onClick={() => onVehicleTypeSelect(type)}
            >
              {type}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface VehicleModelSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  availableModels: VehicleModelType[];
  showDropdown: boolean;
  onModelSelect: (model: VehicleModelType) => void;
  onDropdownToggle: (show: boolean) => void;
  placeholder?: string;
  className?: string;
}

export function VehicleModelSearch({
  searchTerm,
  onSearchChange,
  availableModels,
  showDropdown,
  onModelSelect,
  onDropdownToggle,
  placeholder = "Buscar modelo...",
  className = "reservation-form-input",
}: VehicleModelSearchProps) {
  return (
    <div className="model-search">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => searchTerm.length >= 1 && onDropdownToggle(true)}
        onBlur={() => setTimeout(() => onDropdownToggle(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {showDropdown && availableModels.length > 0 && (
        <div className="model-dropdown">
          {availableModels.map((model) => (
            <div
              key={model.id}
              className="model-dropdown-item"
              onClick={() => onModelSelect(model)}
            >
              {model.brand?.name} - {model.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
