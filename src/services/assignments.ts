import type { 
  Assignment, 
  AssignmentInput, 
  AssignmentFilterParams 
} from '../types/assignment';
import { 
  httpService, 
  buildQueryParams, 
  type PaginationParams, 
  type ServiceResponse, 
  type BackendResponse 
} from '../common';
import { ResponseStatus } from '../types/common';

/**
 * Obtiene todas las asignaciones (sin paginación)
 */
export async function getAllAssignments(
  params?: AssignmentFilterParams
): Promise<ServiceResponse<Assignment[]>> {
  try {
    const queryParams = buildQueryParams(params);
    const response: BackendResponse<Assignment[]> = await httpService.get({
      uri: `/assignments?${queryParams.toString()}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: [],
        message: response.message || "Error al obtener asignaciones"
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Error al obtener asignaciones",
      error: error as any
    };
  }
}

/**
 * Obtiene asignaciones con paginación
 */
export async function getAssignments(
  params?: AssignmentFilterParams, 
  pagination?: PaginationParams
): Promise<ServiceResponse<Assignment[]>> {
  try {
    const queryParams = buildQueryParams(params, pagination);
    const response: BackendResponse<Assignment[]> = await httpService.get({
      uri: `/assignments?${queryParams.toString()}`,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: [],
        message: response.message || "Error al obtener asignaciones"
      };
    }

    return {
      success: true,
      data: response.data,
      pagination: response.pagination ? {
        page: response.pagination.page,
        pageSize: response.pagination.limit,
        total: response.pagination.total,
        pages: response.pagination.pages
      } : undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Error al obtener asignaciones",
      error: error as any
    };
  }
}

export async function createAssignment(assignmentData: AssignmentInput): Promise<ServiceResponse<Assignment>> {
  try {
    const response: BackendResponse<Assignment> = await httpService.post({
      uri: '/assignments',
      body: assignmentData,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Assignment,
        message: response.message || "Error al crear asignación"
      };
    }

    return {
      success: true,
      data: response.data,
      message: "Asignación creada exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Assignment,
      message: "Error al crear asignación",
      error: error as any
    };
  }
}

/**
 * Obtiene asignaciones de un usuario específico (sin paginación)
 */
export async function getAllAssignmentsByUser(
  userId: string
): Promise<ServiceResponse<Assignment[]>> {
  return getAllAssignments({ userId });
}

/**
 * Obtiene asignaciones de un usuario específico (con paginación)
 */
export async function getAssignmentsByUser(
  userId: string, 
  pagination?: PaginationParams
): Promise<ServiceResponse<Assignment[]>> {
  return getAssignments({ userId }, pagination);
}

/**
 * Obtiene asignaciones de un vehículo específico (sin paginación)
 */
export async function getAllAssignmentsByVehicle(
  vehicleId: string
): Promise<ServiceResponse<Assignment[]>> {
  return getAllAssignments({ vehicleId });
}

/**
 * Obtiene asignaciones de un vehículo específico (con paginación)
 */
export async function getAssignmentsByVehicle(
  vehicleId: string, 
  pagination?: PaginationParams
): Promise<ServiceResponse<Assignment[]>> {
  return getAssignments({ vehicleId }, pagination);
}
