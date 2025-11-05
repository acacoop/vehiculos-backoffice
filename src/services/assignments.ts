import type {
  Assignment,
  AssignmentInput,
  AssignmentFilterParams,
} from "../types/assignment";
import type { ServiceResponse } from "../types/common";
import {
  apiCreateItem,
  apiFindItems,
  apiFindItemById,
  apiUpdateItem,
  generalApiCall,
  type ApiFindOptions,
} from "./common";

export async function getAssignments(
  findOptions?: ApiFindOptions<AssignmentFilterParams>,
): Promise<ServiceResponse<Assignment[]>> {
  return await apiFindItems({
    uri: "assignments",
    findOptions,
    paramsConfig: [{ field: "active", transform: (value) => String(value) }],
    errorMessage: "Error al obtener asignaciones",
  });
}

export async function createAssignment(
  payload: AssignmentInput,
): Promise<ServiceResponse<Assignment>> {
  return await apiCreateItem({
    uri: "assignments",
    payload,
    errorMessage: "Error al crear asignación",
  });
}

export async function updateAssignment(
  assignmentId: string,
  payload: Partial<AssignmentInput>,
): Promise<ServiceResponse<Assignment>> {
  return await apiUpdateItem({
    uri: "assignments",
    itemId: assignmentId,
    payload,
    errorMessage: "Error al actualizar asignación",
  });
}

export async function finishAssignment(
  assignmentId: string,
  payload: { endDate?: string },
): Promise<ServiceResponse<Assignment>> {
  const finalEndDate = payload.endDate || new Date().toISOString();

  return await generalApiCall({
    uri: `assignments/${assignmentId}/finish`,
    method: "PATCH",
    errorMessage: "Error al finalizar asignación",
    body: { endDate: finalEndDate },
  });
}

export async function getAssignmentById(
  assignmentId: string,
): Promise<ServiceResponse<Assignment>> {
  return await apiFindItemById({
    uri: "assignments",
    itemId: assignmentId,
    errorMessage: "Error al obtener asignación",
  });
}
