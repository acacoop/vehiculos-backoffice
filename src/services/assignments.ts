import type {
  Assignment,
  AssignmentInput,
  AssignmentFilterParams,
} from "../types/assignment";
import {
  httpService,
  buildQueryParams,
  type PaginationParams,
  type ServiceResponse,
  type BackendResponse,
} from "../common";
import { ResponseStatus } from "../types/common";

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
        message: response.message || "Error al obtener asignaciones",
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
      error: error as any,
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
        message: response.message || "Error al obtener asignaciones",
      };
    }

    return {
      success: true,
      data: response.data,
      pagination: response.pagination
        ? {
            page: response.pagination.page,
            pageSize: response.pagination.limit,
            total: response.pagination.total,
            pages: response.pagination.pages,
          }
        : undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Error al obtener asignaciones",
      error: error as any,
    };
  }
}

export async function createAssignment(
  assignmentData: AssignmentInput
): Promise<ServiceResponse<Assignment>> {
  try {
    const response: BackendResponse<Assignment> = await httpService.post({
      uri: "/assignments",
      body: assignmentData,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Assignment,
        message: response.message || "Error al crear asignación",
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
      error: error as any,
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

/**
 * Obtiene una asignación específica por usuario y vehículo
 */
export async function getAssignmentByUserAndVehicle(
  userId: string,
  vehicleId: string
): Promise<ServiceResponse<Assignment | null>> {
  try {
    const response = await getAssignments({ userId, vehicleId });

    if (!response.success) {
      return {
        success: false,
        data: null,
        message: response.message || "Error al obtener la asignación",
      };
    }

    // Retornar la primera asignación encontrada o null si no hay ninguna
    const assignment =
      response.data && response.data.length > 0 ? response.data[0] : null;

    return {
      success: true,
      data: assignment,
      message: assignment
        ? "Asignación encontrada"
        : "No se encontró la asignación",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: "Error al obtener la asignación",
      error: error as any,
    };
  }
}

/**
 * Obtiene una asignación específica por ID con datos completos
 */
export async function getAssignmentById(
  assignmentId: string
): Promise<ServiceResponse<Assignment>> {
  try {
    // Usar getAllAssignments sin paginación para obtener datos completos
    const response = await getAssignments({}, { page: 1, limit: 1000 });

    if (!response.success) {
      return {
        success: false,
        data: {} as Assignment,
        message: response.message || "Error al obtener asignaciones",
      };
    }

    // Buscar la asignación específica en los resultados
    const assignment = response.data.find((a) => a.id === assignmentId);

    if (!assignment) {
      return {
        success: false,
        data: {} as Assignment,
        message: "Asignación no encontrada",
      };
    }

    return {
      success: true,
      data: assignment,
      message: "Asignación encontrada exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Assignment,
      message: "Error al obtener la asignación",
      error: error as any,
    };
  }
}
