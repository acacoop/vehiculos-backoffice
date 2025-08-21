import { getAllUsers } from "./users";
import { getAllReservations } from "./reservations";
import { getAllVehicles } from "./vehicles";
import { getAllAssignments } from "./assignments";
import type { ServiceResponse } from "../common";

// Tipos para las métricas
export interface UserMetrics {
  total: number;
  active: number;
  inactive: number;
  activePercentage: number;
}

export interface ReservationMetrics {
  total: number;
  byMonth: Array<{ month: string; count: number }>;
  byUser: Array<{ userName: string; count: number }>;
  byVehicle: Array<{ vehicleInfo: string; count: number }>;
}

export interface VehicleMetrics {
  total: number;
  byBrand: Array<{ brand: string; count: number }>;
  mostReserved: Array<{ vehicleInfo: string; reservations: number }>;
}

export interface DashboardMetrics {
  users: UserMetrics;
  reservations: ReservationMetrics;
  vehicles: VehicleMetrics;
  assignments: {
    total: number;
  };
}

export async function getUserMetrics(): Promise<ServiceResponse<UserMetrics>> {
  try {
    const usersResponse = await getAllUsers();

    if (!usersResponse.success) {
      return {
        success: false,
        data: { total: 0, active: 0, inactive: 0, activePercentage: 0 },
        message: "Error al obtener datos de usuarios",
      };
    }

    const users = usersResponse.data;
    const total = users.length;
    const active = users.filter((u) => u.active !== false).length; // Asume activo por defecto
    const inactive = total - active;
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;

    return {
      success: true,
      data: {
        total,
        active,
        inactive,
        activePercentage,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: { total: 0, active: 0, inactive: 0, activePercentage: 0 },
      message: "Error al calcular métricas de usuarios",
      error: error as any,
    };
  }
}

/**
 * Obtiene métricas de reservas
 */
export async function getReservationMetrics(): Promise<
  ServiceResponse<ReservationMetrics>
> {
  try {
    const [reservationsResponse, usersResponse, vehiclesResponse] =
      await Promise.all([
        getAllReservations(),
        getAllUsers(),
        getAllVehicles(),
      ]);

    if (!reservationsResponse.success) {
      return {
        success: false,
        data: { total: 0, byMonth: [], byUser: [], byVehicle: [] },
        message: "Error al obtener datos de reservas",
      };
    }

    const reservations = reservationsResponse.data;
    const users = usersResponse.success ? usersResponse.data : [];
    const vehicles = vehiclesResponse.success ? vehiclesResponse.data : [];
    const total = reservations.length;

    // Crear mapas para búsqueda rápida
    const userMap = new Map(users.map((u) => [u.id, u]));
    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

    // Agrupar por mes
    const monthMap: Record<string, number> = {};
    reservations.forEach((r) => {
      if (r.startDate) {
        const date = new Date(r.startDate);
        const monthKey = date.toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        });
        monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
      }
    });

    const byMonth = Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
      );

    // Agrupar por usuario
    const userCountMap: Record<string, number> = {};
    reservations.forEach((r: any) => {
      // El backend está devolviendo objetos user y vehicle incluidos
      if (r.user) {
        const userName = `${r.user.firstName} ${r.user.lastName}`;
        userCountMap[userName] = (userCountMap[userName] || 0) + 1;
      } else if (r.userId) {
        // Fallback a la estructura original con solo IDs
        const user = userMap.get(r.userId);
        if (user) {
          const userName = `${user.firstName} ${user.lastName}`;
          userCountMap[userName] = (userCountMap[userName] || 0) + 1;
        }
      }
    });

    const byUser = Object.entries(userCountMap)
      .map(([userName, count]) => ({ userName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    // Agrupar por vehículo
    const vehicleCountMap: Record<string, number> = {};
    reservations.forEach((r: any) => {
      // El backend está devolviendo objetos vehicle incluidos
      if (r.vehicle) {
        const vehicleInfo = `${r.vehicle.brand} ${r.vehicle.model} (${r.vehicle.licensePlate})`;
        vehicleCountMap[vehicleInfo] = (vehicleCountMap[vehicleInfo] || 0) + 1;
      } else if (r.vehicleId) {
        // Fallback a la estructura original con solo IDs
        const vehicle = vehicleMap.get(r.vehicleId);
        if (vehicle) {
          const vehicleInfo = `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`;
          vehicleCountMap[vehicleInfo] =
            (vehicleCountMap[vehicleInfo] || 0) + 1;
        }
      }
    });

    const byVehicle = Object.entries(vehicleCountMap)
      .map(([vehicleInfo, count]) => ({ vehicleInfo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    return {
      success: true,
      data: {
        total,
        byMonth,
        byUser,
        byVehicle,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: { total: 0, byMonth: [], byUser: [], byVehicle: [] },
      message: "Error al calcular métricas de reservas",
      error: error as any,
    };
  }
}

/**
 * Obtiene métricas de vehículos
 */
export async function getVehicleMetrics(): Promise<
  ServiceResponse<VehicleMetrics>
> {
  try {
    const [vehiclesResponse, reservationsResponse] = await Promise.all([
      getAllVehicles(),
      getAllReservations(),
    ]);

    if (!vehiclesResponse.success) {
      return {
        success: false,
        data: { total: 0, byBrand: [], mostReserved: [] },
        message: "Error al obtener datos de vehículos",
      };
    }

    const vehicles = vehiclesResponse.data;
    const total = vehicles.length;

    // Crear mapa de vehículos para búsqueda rápida
    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

    // Agrupar por marca
    const brandMap: Record<string, number> = {};
    vehicles.forEach((v) => {
      const brand = v.brand || "Sin marca";
      brandMap[brand] = (brandMap[brand] || 0) + 1;
    });

    const byBrand = Object.entries(brandMap)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);

    // Vehículos más reservados
    const mostReserved: Array<{ vehicleInfo: string; reservations: number }> =
      [];

    if (reservationsResponse.success) {
      const vehicleReservationMap: Record<string, number> = {};

      reservationsResponse.data.forEach((r) => {
        const vehicle = vehicleMap.get(r.vehicleId);
        if (vehicle) {
          const vehicleInfo = `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`;
          vehicleReservationMap[vehicleInfo] =
            (vehicleReservationMap[vehicleInfo] || 0) + 1;
        }
      });

      mostReserved.push(
        ...Object.entries(vehicleReservationMap)
          .map(([vehicleInfo, reservations]) => ({ vehicleInfo, reservations }))
          .sort((a, b) => b.reservations - a.reservations)
          .slice(0, 10)
      );
    }

    return {
      success: true,
      data: {
        total,
        byBrand,
        mostReserved,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: { total: 0, byBrand: [], mostReserved: [] },
      message: "Error al calcular métricas de vehículos",
      error: error as any,
    };
  }
}

/**
 * Obtiene todas las métricas del dashboard
 */
export async function getDashboardMetrics(): Promise<
  ServiceResponse<DashboardMetrics>
> {
  try {
    const [
      userMetrics,
      reservationMetrics,
      vehicleMetrics,
      assignmentsResponse,
    ] = await Promise.all([
      getUserMetrics(),
      getReservationMetrics(),
      getVehicleMetrics(),
      getAllAssignments(),
    ]);

    if (
      !userMetrics.success ||
      !reservationMetrics.success ||
      !vehicleMetrics.success
    ) {
      return {
        success: false,
        data: {
          users: { total: 0, active: 0, inactive: 0, activePercentage: 0 },
          reservations: { total: 0, byMonth: [], byUser: [], byVehicle: [] },
          vehicles: { total: 0, byBrand: [], mostReserved: [] },
          assignments: { total: 0 },
        },
        message: "Error al obtener algunas métricas",
      };
    }

    return {
      success: true,
      data: {
        users: userMetrics.data,
        reservations: reservationMetrics.data,
        vehicles: vehicleMetrics.data,
        assignments: {
          total: assignmentsResponse.success
            ? assignmentsResponse.data.length
            : 0,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {
        users: { total: 0, active: 0, inactive: 0, activePercentage: 0 },
        reservations: { total: 0, byMonth: [], byUser: [], byVehicle: [] },
        vehicles: { total: 0, byBrand: [], mostReserved: [] },
        assignments: { total: 0 },
      },
      message: "Error al calcular métricas del dashboard",
      error: error as any,
    };
  }
}
