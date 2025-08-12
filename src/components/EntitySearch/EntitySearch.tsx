import type { User } from "../../types/user";
import type { Vehicle } from "../../types/vehicle";
import type { Maintenance } from "../../types/maintenance";

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
  placeholder = "Buscar por nombre o DNI...",
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
              {user.firstName} {user.lastName} - DNI: {user.dni}
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
          {availableVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="vehicle-dropdown-item"
              onClick={() => onVehicleSelect(vehicle)}
            >
              {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
            </div>
          ))}
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
