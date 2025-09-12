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
          const filtered = response.data.filter(
            (vehicle: Vehicle) =>
              `${vehicle.brand} ${vehicle.model}`
                .toLowerCase()
                .includes(term.toLowerCase()) ||
              vehicle.licensePlate.toLowerCase().includes(term.toLowerCase()) ||
              vehicle.year?.toString().includes(term)
          );
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
    setSearchTerm(
      `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`
    );
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
