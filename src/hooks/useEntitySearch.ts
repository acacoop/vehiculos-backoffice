import { useState, useEffect } from "react";
import { getUsers } from "../services/users";
import { getVehicles } from "../services/vehicles";
import { getMaintenanceCategories } from "../services/maintenances";
import type { User } from "../types/user";
import type { Vehicle } from "../types/vehicle";
import type { Maintenance } from "../types/maintenance";

export function useUserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const response = await getUsers({}, { page: 1, limit: 1000 });
        if (response.success) {
          setAllUsers(response.data);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    loadAllUsers();
  }, []);

  const searchUsers = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 2 && allUsers.length > 0) {
      const filtered = allUsers.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(term.toLowerCase()) || user.dni?.toString().includes(term)
      );
      setAvailableUsers(filtered);
      setShowDropdown(true);
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
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const loadAllVehicles = async () => {
      try {
        const response = await getVehicles({}, { page: 1, limit: 1000 });
        if (response.success) {
          setAllVehicles(response.data);
        }
      } catch (error) {
        console.error("Error loading vehicles:", error);
      }
    };
    loadAllVehicles();
  }, []);

  const searchVehicles = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 2 && allVehicles.length > 0) {
      const filtered = allVehicles.filter(
        (vehicle: Vehicle) =>
          `${vehicle.brand} ${vehicle.model}`
            .toLowerCase()
            .includes(term.toLowerCase()) ||
          vehicle.licensePlate.toLowerCase().includes(term.toLowerCase()) ||
          vehicle.year?.toString().includes(term)
      );
      setAvailableVehicles(filtered);
      setShowDropdown(true);
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
  const [allCategories, setAllCategories] = useState<Maintenance[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Maintenance | null>(
    null
  );

  useEffect(() => {
    const loadAllCategories = async () => {
      try {
        const response = await getMaintenanceCategories();
        if (response.success) {
          setAllCategories(response.data);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadAllCategories();
  }, []);

  const searchCategories = async (term: string) => {
    setSearchTerm(term);
    if (term.length > 0 && allCategories.length > 0) {
      const filtered = allCategories.filter((category) =>
        category.name.toLowerCase().includes(term.toLowerCase())
      );
      setAvailableCategories(filtered);
      setShowDropdown(true);
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
    allCategories,
    showDropdown,
    selectedCategory,
    searchCategories,
    selectCategory,
    clearSelection,
    setShowDropdown,
  };
}
