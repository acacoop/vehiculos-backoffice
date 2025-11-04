import type {
  Assignment,
  AssignmentInput,
  AssignmentFilterParams,
} from "../types/assignment";
import type { ServiceResponse } from "../common";
import type { Vehicle } from "../types/vehicle";
import {
  addApiFindOptions,
  apiCreateItem,
  apiFindAllItems,
  apiFindItemById,
  apiUpdateItem,
  generalApiCall,
  type ApiFindOptions,
} from "./common";

// Normaliza un vehículo embebido en una asignación
function normalizeEmbeddedVehicle(raw: any): Vehicle | undefined {
  if (!raw) return undefined;
  const modelObjCandidate =
    raw.model && raw.model.brand ? raw.model : raw.modelObj;
  const modelObj =
    modelObjCandidate && modelObjCandidate.brand
      ? modelObjCandidate
      : undefined;
  const brandName = modelObj?.brand?.name;
  const modelName = modelObj?.name;
  return {
    id: raw.id,
    licensePlate: raw.licensePlate,
    year: raw.year,
    chassisNumber: raw.chassisNumber ?? undefined,
    engineNumber: raw.engineNumber ?? undefined,
    vehicleType: raw.vehicleType ?? undefined,
    transmission: raw.transmission ?? undefined,
    fuelType: raw.fuelType ?? undefined,
    brand: typeof raw.brand === "string" ? raw.brand : brandName,
    model: typeof raw.model === "string" ? raw.model : modelName,
    modelObj: modelObj || null,
    brandName,
    modelName,
  } as Vehicle;
}

const normalizeAssignment = (item: any): Assignment => ({
  ...item,
  vehicle: normalizeEmbeddedVehicle(item.vehicle) || item.vehicle,
});

export async function getAssignments(
  findOptions?: ApiFindOptions<AssignmentFilterParams>
): Promise<ServiceResponse<Assignment[] | null>> {
  const params = new URLSearchParams();

  if (findOptions) {
    addApiFindOptions(params, findOptions, [
      { field: "userId" },
      { field: "vehicleId" },
      { field: "startDate" },
      { field: "endDate" },
      { field: "active", transform: (value) => String(value) },
    ]);
  }

  return await apiFindAllItems<Assignment>(
    "assignments",
    params,
    normalizeAssignment,
    "Error al obtener asignaciones"
  );
}

export async function createAssignment(
  payload: AssignmentInput
): Promise<ServiceResponse<Assignment | null>> {
  return await apiCreateItem<Assignment>(
    "assignments",
    payload,
    normalizeAssignment,
    "Error al crear asignación"
  );
}

export async function updateAssignment(
  assignmentId: string,
  payload: Partial<AssignmentInput>
): Promise<ServiceResponse<Assignment | null>> {
  return await apiUpdateItem<Assignment>(
    "assignments",
    assignmentId,
    payload,
    normalizeAssignment,
    "Error al actualizar asignación"
  );
}

export async function finishAssignment(
  assignmentId: string,
  payload: { endDate?: string }
): Promise<ServiceResponse<Assignment | null>> {
  const finalEndDate = payload.endDate || new Date().toISOString();

  return await generalApiCall<Assignment>(
    `assignments/${assignmentId}/finish`,
    "PATCH",
    "Error al finalizar asignación",
    normalizeAssignment,
    undefined,
    { endDate: finalEndDate }
  );
}

export async function getAssignmentById(
  assignmentId: string
): Promise<ServiceResponse<Assignment | null>> {
  return await apiFindItemById<Assignment>(
    "assignments",
    assignmentId,
    normalizeAssignment,
    "Error al obtener asignación"
  );
}
