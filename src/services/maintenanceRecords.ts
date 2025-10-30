import type {
  MaintenanceRecord,
  MaintenanceRecordCreateDto,
  MaintenanceRecordsListResponse,
  MaintenanceRecordFilterParams,
} from "../types/maintenanceRecord";
import { getAccessToken } from "../common/auth";
import { API_CONFIG, type ServiceResponse } from "../common";

async function buildAuthHeaders(includeJson = false) {
  const headers: Record<string, string> = {};
  if (includeJson) headers["Content-Type"] = "application/json";
  try {
    const token = await getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch (err) {
    // ignore token errors
  }
  return headers;
}

export const getMaintenanceRecordsByVehicle = async (
  vehicleId: string
): Promise<ServiceResponse<MaintenanceRecord[]>> => {
  try {
    const params = new URLSearchParams();
    params.append("vehicleId", vehicleId);

    const resp = await fetch(
      `${API_CONFIG.BASE_URL}/maintenance/records?${params.toString()}`,
      {
        headers: await buildAuthHeaders(false),
      }
    );

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const raw = await resp.json().catch(() => ({}));

    if (raw.status === "success") return { success: true, data: raw.data };
    if (Array.isArray(raw)) return { success: true, data: raw };
    return { success: true, data: raw.data || [] };
  } catch (error) {
    return { success: false, data: [], message: "Error al obtener registros" };
  }
};

export const getMaintenanceRecordById = async (
  id: string
): Promise<ServiceResponse<MaintenanceRecord | null>> => {
  try {
    const resp = await fetch(
      `${API_CONFIG.BASE_URL}/maintenance/records/${id}`,
      {
        headers: await buildAuthHeaders(false),
      }
    );

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const raw = await resp.json().catch(() => ({}));

    if (raw.status === "success") return { success: true, data: raw.data };
    return { success: true, data: raw.data || raw };
  } catch (error) {
    return { success: false, data: null, message: "Error al obtener registro" };
  }
};

export const getAllMaintenanceRecords = async (
  filters?: MaintenanceRecordFilterParams,
  options?: {
    page?: number;
    limit?: number;
  }
): Promise<ServiceResponse<MaintenanceRecordsListResponse>> => {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));
    if (filters?.vehicleId) params.append("vehicleId", filters.vehicleId);
    if (filters?.maintenanceId)
      params.append("maintenanceId", filters.maintenanceId);
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.assignedMaintenanceId)
      params.append("assignedMaintenanceId", filters.assignedMaintenanceId);
    if (filters?.search) params.append("search", filters.search);

    const resp = await fetch(
      `${API_CONFIG.BASE_URL}/maintenance/records?${params.toString()}`,
      {
        headers: await buildAuthHeaders(false),
      }
    );

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const raw = await resp.json();

    if (raw.status === "success") {
      return {
        success: true,
        data: { items: raw.data || [], total: raw.pagination?.total || 0 },
      };
    }

    return {
      success: true,
      data: { items: raw.data || [], total: raw.total || 0 },
    };
  } catch (error) {
    return {
      success: false,
      data: { items: [], total: 0 },
      message: "Error al obtener registros",
    };
  }
};

export const addMaintenanceRecord = async (
  payload: MaintenanceRecordCreateDto
): Promise<ServiceResponse<MaintenanceRecord | null>> => {
  try {
    const resp = await fetch(`${API_CONFIG.BASE_URL}/maintenance/records`, {
      method: "POST",
      headers: await buildAuthHeaders(true),
      body: JSON.stringify(payload),
    });

    const raw = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return {
        success: false,
        data: null,
        message: raw.message || `Error ${resp.status}`,
      };
    }

    return { success: true, data: raw.data || raw };
  } catch (error) {
    return { success: false, data: null, message: "Error al crear registro" };
  }
};

export const getMaintenanceRecordsByAssignedMaintenanceId = async (
  assignedMaintenanceId: string
): Promise<ServiceResponse<MaintenanceRecord[]>> => {
  try {
    const params = new URLSearchParams();
    params.append("assignedMaintenanceId", assignedMaintenanceId);

    const resp = await fetch(
      `${API_CONFIG.BASE_URL}/maintenance/records?${params.toString()}`,
      {
        headers: await buildAuthHeaders(false),
      }
    );

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const raw = await resp.json();
    if (raw.status === "success") return { success: true, data: raw.data };
    if (Array.isArray(raw)) return { success: true, data: raw };
    return { success: true, data: raw.data || [] };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Error al obtener registros por asignacion",
    };
  }
};

export const getMaintenanceRecordsByVehicleAndMaintenance = async (
  vehicleId: string,
  assignedMaintenanceId: string
): Promise<ServiceResponse<MaintenanceRecord[]>> => {
  try {
    const params = new URLSearchParams();
    params.append("vehicleId", vehicleId);
    params.append("assignedMaintenanceId", assignedMaintenanceId);

    const resp = await fetch(
      `${API_CONFIG.BASE_URL}/maintenance/records?${params.toString()}`,
      {
        headers: await buildAuthHeaders(false),
      }
    );

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const raw = await resp.json().catch(() => ({}));

    if (raw.status === "success") return { success: true, data: raw.data };
    if (Array.isArray(raw)) return { success: true, data: raw };
    return { success: true, data: raw.data || [] };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: "Error al obtener registros por vehículo y mantenimiento",
    };
  }
};

export default {};
