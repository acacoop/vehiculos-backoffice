import type { 
  Assignment, 
  AssignmentInput, 
  AssignmentFilterParams, 
  AssignmentApiResponse, 
  AssignmentListApiResponse 
} from '../types/assignment';
import { httpService, transformParamsToKebabCase, type PaginationParams, type ApiResponse } from '../common';

export async function getAssignments(
  params?: AssignmentFilterParams, 
  pagination?: PaginationParams
): Promise<AssignmentListApiResponse> {
  const queryParams = params ? transformParamsToKebabCase(params) : undefined;
  
  const response: ApiResponse<Assignment[]> = await httpService.get({
    uri: '/assignments',
    queryParams,
    pagination,
  });

  if (!response.success) {
    throw new Error(response.error?.detail || 'Error al obtener asignaciones');
  }

  // Retornamos los datos en el formato esperado por AssignmentListApiResponse
  return {
    status: 'success',
    message: 'Asignaciones obtenidas exitosamente',
    data: response.data,
  } as AssignmentListApiResponse;
}

export async function createAssignment(assignmentData: AssignmentInput): Promise<AssignmentApiResponse> {
  const response: ApiResponse<Assignment> = await httpService.post({
    uri: '/assignments',
    body: assignmentData,
  });

  if (!response.success) {
    throw new Error(response.error?.detail || 'Error al crear asignación');
  }

  return {
    status: 'success',
    message: 'Asignación creada exitosamente',
    data: response.data,
  } as AssignmentApiResponse;
}

export async function getAssignmentsByUser(
  userId: string, 
  pagination?: PaginationParams
): Promise<AssignmentListApiResponse> {
  return getAssignments({ userId }, pagination);
}

export async function getAssignmentsByVehicle(
  vehicleId: string, 
  pagination?: PaginationParams
): Promise<AssignmentListApiResponse> {
  return getAssignments({ vehicleId }, pagination);
}
