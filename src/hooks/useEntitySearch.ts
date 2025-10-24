import { useState } from "react";
import { getAllUsers } from "../services/users";
import { getVehicles } from "../services/vehicles";
import {
  getMaintenanceCategories,
  getMaintenancePossibles,
} from "../services/maintenances";
import type { User } from "../types/user";
import type { Vehicle } from "../types/vehicle";
import type { Maintenance } from "../types/maintenance";
import type { MaintenancePossibleNormalized } from "../services/maintenances";
import { getVehicleBrands } from "../services/vehicleBrands";
import type { VehicleBrand } from "../types/vehicle";

export function useUserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const searchUsers = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      try {
        const response = await getAllUsers();
        if (response.success) {
          const filtered = response.data.filter(
            (user) =>
              `${user.firstName} ${user.lastName}`
                .toLowerCase()
                .includes(term.toLowerCase()) ||
              user.cuit?.toString().includes(term)
          );
          setAvailableUsers(filtered);
          setShowDropdown(true);
        }
      } catch (error) {
        setAvailableUsers([]);
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setSearchTerm(`${user.firstName} ${user.lastName}`);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedUser(null);
    setSearchTerm("");
  };

  return {
    searchTerm,
    availableUsers,
    showDropdown,
    selectedUser,
    searchUsers,
    selectUser,
    clearSelection,
    setShowDropdown,
  };
}

export function useVehicleSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const searchVehicles = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      try {
        const response = await getVehicles({}, { page: 1, limit: 100 });
        if (response.success) {
          const filtered = response.data.filter((vehicle: Vehicle) => {
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
            const composite = `${brand} ${model}`.toLowerCase();
            const termLower = term.toLowerCase();
            return (
              composite.includes(termLower) ||
              vehicle.licensePlate.toLowerCase().includes(termLower) ||
              (vehicle.year ? String(vehicle.year).includes(term) : false)
            );
          });
          setAvailableVehicles(filtered);
          setShowDropdown(true);
        }
      } catch (error) {
        setAvailableVehicles([]);
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const selectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
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
    setSearchTerm(`${brand} ${model} (${vehicle.licensePlate})`);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedVehicle(null);
    setSearchTerm("");
  };

  return {
    searchTerm,
    availableVehicles,
    showDropdown,
    selectedVehicle,
    searchVehicles,
    selectVehicle,
    clearSelection,
    setShowDropdown,
  };
}

export function useCategorySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableCategories, setAvailableCategories] = useState<Maintenance[]>(
    []
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Maintenance | null>(
    null
  );

  const searchCategories = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 1) {
      try {
        const response = await getMaintenanceCategories({
          page: 1,
          limit: 100,
        });
        if (response.success) {
          const filtered = response.data.filter((category: Maintenance) =>
            category.name.toLowerCase().includes(term.toLowerCase())
          );
          setAvailableCategories(filtered);
          setShowDropdown(true);
        }
      } catch (error) {
        setAvailableCategories([]);
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const selectCategory = (category: Maintenance) => {
    setSelectedCategory(category);
    setSearchTerm(category.name);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedCategory(null);
    setSearchTerm("");
  };

  return {
    searchTerm,
    availableCategories,
    showDropdown,
    selectedCategory,
    searchCategories,
    selectCategory,
    clearSelection,
    setShowDropdown,
  };
}

export function useMaintenanceSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  // Maintenance possibles come normalized from the service
  const [availableMaintenances, setAvailableMaintenances] = useState<
    MaintenancePossibleNormalized[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<Maintenance | null>(null);

  const searchMaintenances = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 1) {
      try {
        // Use getMaintenancePossibles instead of getMaintenanceCategories
        const response = await getMaintenancePossibles();
        if (response.success) {
          const filtered = response.data.filter(
            (maintenance: MaintenancePossibleNormalized) =>
              maintenance.name.toLowerCase().includes(term.toLowerCase())
          );
          setAvailableMaintenances(filtered);
          setShowDropdown(true);
        }
      } catch (error) {
        setAvailableMaintenances([]);
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const selectMaintenance = (maintenance: MaintenancePossibleNormalized) => {
    // Map normalized maintenance possible into the lightweight Maintenance shape
    const mapped: Maintenance = {
      id: maintenance.id,
      categoryId: "",
      name: maintenance.name,
    };

    setSelectedMaintenance(mapped);
    setSearchTerm(maintenance.name);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedMaintenance(null);
    setSearchTerm("");
  };

  return {
    searchTerm,
    availableMaintenances,
    showDropdown,
    selectedMaintenance,
    searchMaintenances,
    selectMaintenance,
    clearSelection,
    setShowDropdown,
  };
}

export function useVehicleBrandSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableBrands, setAvailableBrands] = useState<VehicleBrand[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrand | null>(null);

  const searchBrands = async (term: string) => {
    setSearchTerm(term);
    if (term.length >= 1) {
      try {
        // Limit alto para permitir filtrado local adicional si backend no filtra
        const response = await getVehicleBrands({
          page: 1,
          limit: 100,
          name: term,
        });
        if (response.success) {
          // Si backend ya filtra por name solo usamos items. Si no, filtramos localmente.
          const items = response.data.items || [];
          const termLower = term.toLowerCase();
          const filtered = items.filter((b) =>
            b.name.toLowerCase().includes(termLower)
          );
          setAvailableBrands(filtered);
          setShowDropdown(true);
        }
      } catch (error) {
        setAvailableBrands([]);
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const selectBrand = (brand: VehicleBrand) => {
    setSelectedBrand(brand);
    setSearchTerm(brand.name);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedBrand(null);
    setSearchTerm("");
  };

  return {
    searchTerm,
    availableBrands,
    showDropdown,
    selectedBrand,
    searchBrands,
    selectBrand,
    clearSelection,
    setShowDropdown,
    setSelectedBrand,
    setSearchTerm,
  };
}

// Simple vehicle type search (string list). Could be wired to a backend later.
export function useVehicleTypeSearch(initialList: string[] = []) {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableVehicleTypes, setAvailableVehicleTypes] =
    useState<string[]>(initialList);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(
    null
  );

  const searchVehicleTypes = async (term: string) => {
    setSearchTerm(term);
    const pool = initialList.length
      ? initialList
      : [
          "Camión",
          "Convertible",
          "Coupé",
          "Furgón",
          "Hatchback",
          "Pickup",
          "Sedan",
          "SUV",
          "Van",
          "Wagon",
        ];
    if (term.length >= 1) {
      const filtered = pool.filter((t) =>
        t.toLowerCase().includes(term.toLowerCase())
      );
      setAvailableVehicleTypes(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const selectVehicleType = (vehicleType: string) => {
    setSelectedVehicleType(vehicleType);
    setSearchTerm(vehicleType);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedVehicleType(null);
    setSearchTerm("");
  };

  return {
    searchTerm,
    availableVehicleTypes,
    showDropdown,
    selectedVehicleType,
    searchVehicleTypes,
    selectVehicleType,
    clearSelection,
    setShowDropdown,
    setSelectedVehicleType,
    setSearchTerm,
  };
}
