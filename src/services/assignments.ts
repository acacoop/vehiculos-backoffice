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
import type { Vehicle } from "../types/vehicle";

// Normaliza un vehículo embebido en una asignación (similar a mapVehicleResponse en vehicles.ts)
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

export async function getAllAssignments(
  params?: AssignmentFilterParams
): Promise<ServiceResponse<Assignment[]>> {
  try {
    const allParams = {
      ...params,
      limit: 10000,
    };
    const queryParams = buildQueryParams(allParams);
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

    const mapped = (response.data || []).map((a: any) => ({
      ...a,
      vehicle: normalizeEmbeddedVehicle(a.vehicle) || a.vehicle,
    }));

    return {
      success: true,
      data: mapped,
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

    const mapped = (response.data || []).map((a: any) => ({
      ...a,
      vehicle: normalizeEmbeddedVehicle(a.vehicle) || a.vehicle,
    }));

    return {
      success: true,
      data: mapped,
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

export async function updateAssignment(
  assignmentId: string,
  assignmentData: Partial<AssignmentInput>
): Promise<ServiceResponse<Assignment>> {
  try {
    const response: BackendResponse<Assignment> = await httpService.patch({
      uri: `/assignments/${assignmentId}`,
      body: assignmentData,
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Assignment,
        message: response.message || "Error al actualizar asignación",
      };
    }

    return {
      success: true,
      data: response.data,
      message: "Asignación actualizada exitosamente",
    };
  } catch (error: any) {
    return {
      success: false,
      data: {} as Assignment,
      message:
        error.response?.data?.message ||
        error.message ||
        "Error al actualizar asignación",
      error: error as any,
    };
  }
}

export async function finishAssignment(
  assignmentId: string,
  endDate?: string
): Promise<ServiceResponse<Assignment>> {
  const finalEndDate = endDate || new Date().toISOString();

  try {
    const response: BackendResponse<Assignment> = await httpService.patch({
      uri: `/assignments/${assignmentId}/finish`,
      body: { endDate: finalEndDate },
    });

    if (response.status === ResponseStatus.ERROR) {
      return {
        success: false,
        data: {} as Assignment,
        message: response.message || "Error al finalizar asignación",
      };
    }

    return {
      success: true,
      data: response.data,
      message: "Asignación finalizada exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      data: {} as Assignment,
      message: "Error al finalizar asignación",
      error: error as any,
    };
  }
}

export async function getAllAssignmentsByUser(
  userId: string
): Promise<ServiceResponse<Assignment[]>> {
  return getAllAssignments({ userId });
}

export async function getAssignmentsByUser(
  userId: string,
  pagination?: PaginationParams
): Promise<ServiceResponse<Assignment[]>> {
  return getAssignments({ userId }, pagination);
}

export async function getAllAssignmentsByVehicle(
  vehicleId: string
): Promise<ServiceResponse<Assignment[]>> {
  return getAllAssignments({ vehicleId });
}

export async function getAssignmentsByVehicle(
  vehicleId: string,
  pagination?: PaginationParams
): Promise<ServiceResponse<Assignment[]>> {
  return getAssignments({ vehicleId }, pagination);
}

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

export async function getAssignmentById(
  assignmentId: string
): Promise<ServiceResponse<Assignment>> {
  try {
    const response = await getAssignments({}, { page: 1, limit: 1000 });

    if (!response.success) {
      return {
        success: false,
        data: {} as Assignment,
        message: response.message || "Error al obtener asignaciones",
      };
    }

    const assignmentRaw = response.data.find((a) => a.id === assignmentId);
    const assignment = assignmentRaw
      ? ({
          ...assignmentRaw,
          vehicle:
            normalizeEmbeddedVehicle((assignmentRaw as any).vehicle) ||
            (assignmentRaw as any).vehicle,
        } as Assignment)
      : undefined;

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
