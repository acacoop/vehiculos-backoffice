import { useState } from "react";
import { getAllUsers } from "../services/users";
import { getAllVehicles } from "../services/vehicles";
import type { User } from "../types/user";
import type { Vehicle } from "../types/vehicle";

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
              user.dni?.toString().includes(term)
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
        const response = await getAllVehicles();
        if (response.success) {
          const filtered = response.data.filter(
            (vehicle) =>
              `${vehicle.brand} ${vehicle.model}`
                .toLowerCase()
                .includes(term.toLowerCase()) ||
              vehicle.licensePlate.toLowerCase().includes(term.toLowerCase())
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
