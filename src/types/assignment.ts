import type { User } from './user';
import type { Vehicle } from './vehicle';

export interface Assignment {
  id: string; // UUID format
  startDate: string; // ISO date format
  endDate: string | null; // ISO date format or null for indefinite
  user: User; // Usuario completo
  vehicle: Vehicle; // Vehículo completo
}

// Input para crear una nueva asignación
export interface AssignmentInput {
  userId: string; // UUID format
  vehicleId: string; // UUID format
  startDate?: string; // ISO date format (defaults to today if not provided)
  endDate?: string | null; // ISO date format or null for indefinite
  active?: boolean; // Whether the assignment is active (defaults to true)
}

// Parámetros para filtrar asignaciones
export interface AssignmentFilterParams {
  userId?: string; // UUID format
  vehicleId?: string; // UUID format
}

// Respuesta del backend según OpenAPI
export interface AssignmentApiResponse {
  status: 'success' | 'error';
  message: string;
  data: Assignment;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Respuesta específica para lista de asignaciones
export interface AssignmentListApiResponse {
  status: 'success' | 'error';
  message: string;
  data: Assignment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
