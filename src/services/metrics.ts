import type { ServiceResponse } from "../types/common";

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

// Helper para generar datos random
const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const months = [
  "Enero 2024",
  "Febrero 2024",
  "Marzo 2024",
  "Abril 2024",
  "Mayo 2024",
  "Junio 2024",
  "Julio 2024",
  "Agosto 2024",
  "Septiembre 2024",
  "Octubre 2024",
  "Noviembre 2024",
];

const users = [
  "Juan Pérez",
  "María García",
  "Carlos López",
  "Ana Martínez",
  "Luis Rodríguez",
];

const vehicles = [
  "Toyota Corolla (ABC123)",
  "Honda Civic (XYZ789)",
  "Ford Focus (DEF456)",
  "Chevrolet Cruze (GHI012)",
  "Volkswagen Golf (JKL345)",
];

const brands = ["Toyota", "Honda", "Ford", "Chevrolet", "Volkswagen"];

/**
 * TODO: Implementar endpoint en backend: GET /api/metrics/users
 */
export async function getUserMetrics(): Promise<ServiceResponse<UserMetrics>> {
  // Simulación - Reemplazar con llamada real al backend
  const total = getRandomInt(50, 200);
  const active = getRandomInt(Math.floor(total * 0.7), total);
  const inactive = total - active;
  const activePercentage = Math.round((active / total) * 100);

  return {
    success: true,
    data: {
      total,
      active,
      inactive,
      activePercentage,
    },
  };
}

/**
 * TODO: Implementar endpoint en backend: GET /api/metrics/reservations
 */
export async function getReservationMetrics(): Promise<
  ServiceResponse<ReservationMetrics>
> {
  // Simulación - Reemplazar con llamada real al backend
  const byMonth = months.map((month) => ({
    month,
    count: getRandomInt(5, 30),
  }));

  const byUser = users
    .map((userName) => ({
      userName,
      count: getRandomInt(1, 15),
    }))
    .sort((a, b) => b.count - a.count);

  const byVehicle = vehicles
    .map((vehicleInfo) => ({
      vehicleInfo,
      count: getRandomInt(1, 20),
    }))
    .sort((a, b) => b.count - a.count);

  const total = byMonth.reduce((sum, m) => sum + m.count, 0);

  return {
    success: true,
    data: {
      total,
      byMonth,
      byUser,
      byVehicle,
    },
  };
}

/**
 * TODO: Implementar endpoint en backend: GET /api/metrics/vehicles
 */
export async function getVehicleMetrics(): Promise<
  ServiceResponse<VehicleMetrics>
> {
  // Simulación - Reemplazar con llamada real al backend
  const byBrand = brands
    .map((brand) => ({
      brand,
      count: getRandomInt(5, 30),
    }))
    .sort((a, b) => b.count - a.count);

  const mostReserved = vehicles
    .map((vehicleInfo) => ({
      vehicleInfo,
      reservations: getRandomInt(5, 50),
    }))
    .sort((a, b) => b.reservations - a.reservations)
    .slice(0, 5);

  const total = byBrand.reduce((sum, b) => sum + b.count, 0);

  return {
    success: true,
    data: {
      total,
      byBrand,
      mostReserved,
    },
  };
}

/**
 * TODO: Implementar endpoint en backend: GET /api/metrics/dashboard
 * Este endpoint debería devolver todas las métricas en una sola llamada
 */
export async function getDashboardMetrics(): Promise<
  ServiceResponse<DashboardMetrics>
> {
  try {
    const [userMetrics, reservationMetrics, vehicleMetrics] = await Promise.all(
      [getUserMetrics(), getReservationMetrics(), getVehicleMetrics()],
    );

    if (
      !userMetrics.success ||
      !reservationMetrics.success ||
      !vehicleMetrics.success
    ) {
      return {
        success: false,
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
          total: getRandomInt(20, 100),
        },
      },
    };
  } catch {
    return {
      success: false,
      message: "Error al calcular métricas del dashboard",
    };
  }
}
