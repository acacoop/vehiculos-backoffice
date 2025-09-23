import type { ServiceResponse, PaginationParams } from "../common";
import { API_CONFIG } from "../common/constants";
import { getAccessToken } from "../common/auth";
import type { VehicleResponsible } from "../types/vehicleResponsible";

// Normalize a single vehicle responsible item to a canonical shape used by the UI
const normalizeVehicleResponsible = (item: any) => {
  const rawUser = item.user ?? {};
  const rawVehicle = item.vehicle ?? {};

  const firstName =
    rawUser.firstName ?? rawUser.first_name ?? rawUser.name ?? "";
  const lastName = rawUser.lastName ?? rawUser.last_name ?? "";
  const cuit = rawUser.cuit ?? rawUser.document ?? null;
  const email = rawUser.email ?? rawUser.mail ?? "";

  const licensePlate =
    rawVehicle.licensePlate ??
    rawVehicle.license_plate ??
    rawVehicle.plate ??
    "";
  const modelObj = rawVehicle.model || rawVehicle.modelObj || null;
  const brand =
    (modelObj && (modelObj.brand?.name || modelObj.brand?.BrandName)) ||
    rawVehicle.brand ||
    rawVehicle.make ||
    "";
  const model =
    (modelObj && (modelObj.name || modelObj.modelName)) ||
    rawVehicle.model ||
    rawVehicle.modelo ||
    "";
  const year = rawVehicle.year ?? rawVehicle.anio ?? null;

  return {
    ...item,
    user: {
      id: rawUser.id ?? rawUser.userId ?? null,
      firstName,
      lastName,
      cuit,
      email,
      active: rawUser.active ?? true,
    },
    vehicle: {
      id: rawVehicle.id ?? rawVehicle.vehicleId ?? null,
      licensePlate,
      brand,
      model,
      year,
      imgUrl: rawVehicle.imgUrl ?? rawVehicle.img_url,
      currentResponsible:
        rawVehicle.currentResponsible ?? rawVehicle.current_responsible,
    },
    userFullName: `${firstName} ${lastName}`.trim(),
    userDni: cuit,
    userEmail: email,
    vehicleFullName: `${brand} ${model}`.trim(),
    modelObj: modelObj
      ? {
          id: modelObj.id,
          name: modelObj.name || modelObj.modelName,
          brand: modelObj.brand
            ? { id: modelObj.brand.id, name: modelObj.brand.name }
            : undefined,
        }
      : undefined,
    vehicleLicensePlate: licensePlate,
    vehicleBrand: brand,
    vehicleModel: model,
    vehicleYear: year,
    startDateFormatted: item.startDate
      ? String(item.startDate).split("T")[0]
      : null,
    endDateFormatted: item.endDate ? String(item.endDate).split("T")[0] : null,
  };
};

export async function getVehicleResponsibles(
  pagination?: PaginationParams
): Promise<ServiceResponse<VehicleResponsible[]>> {
  try {
    // Build query params for backend: backend expects limit & offset
    const params = new URLSearchParams();
    const page = pagination?.page ?? API_CONFIG.DEFAULT_PAGE;
    const limit = pagination?.limit ?? API_CONFIG.DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    params.append("limit", String(limit));
    params.append("offset", String(offset));

    const token = await getAccessToken().catch(() => undefined);

    const url = `${
      API_CONFIG.BASE_URL
    }/vehicle-responsibles?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const parsed = await res.json().catch(() => ({}));

    // Normalize response shapes (support array, { data }, or { items })
    let itemsRaw: any[] = [];
    let total = 0;
    let pages = 0;

    if (Array.isArray(parsed)) {
      itemsRaw = parsed;
      total = parsed.length;
      pages = Math.ceil(total / limit);
    } else if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.data)) {
        itemsRaw = parsed.data;
        if (parsed.pagination) {
          total = parsed.pagination.total ?? 0;
          pages = parsed.pagination.pages ?? Math.ceil(total / limit);
        } else if (typeof parsed.total === "number") {
          total = parsed.total;
          pages = Math.ceil(total / limit);
        }
      } else if (Array.isArray(parsed.items)) {
        itemsRaw = parsed.items;
        total = parsed.total ?? itemsRaw.length;
        pages = Math.ceil(total / limit);
      }
    }

    const items = itemsRaw.map(normalizeVehicleResponsible);

    const paginationData = {
      page,
      pageSize: limit,
      total,
      pages,
    };

    return {
      success: true,
      data: items,
      pagination: paginationData,
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      message: "Error al obtener responsables de vehículos",
      error: error as any,
    };
  }
}

export async function getVehicleResponsibleById(
  id: string
): Promise<ServiceResponse<VehicleResponsible | null>> {
  try {
    const token = await getAccessToken().catch(() => undefined);
    const url = `${API_CONFIG.BASE_URL}/vehicle-responsibles/${id}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const parsed = await res.json().catch(() => null);
    if (!parsed) {
      return { success: false, data: null, message: "Respuesta vacía" };
    }

    // Support various response shapes: { data: {...} }, { item: {...} }, { result: {...} }, or direct object
    const payload =
      (parsed &&
        typeof parsed === "object" &&
        (parsed.data ?? parsed.item ?? parsed.result)) ||
      parsed;

    if (!payload || typeof payload !== "object") {
      return { success: false, data: null, message: "Respuesta inválida" };
    }

    return { success: true, data: normalizeVehicleResponsible(payload) as any };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      message: "Error al obtener responsable de vehículo",
      error: error as any,
    };
  }
}

export async function createVehicleResponsible(payload: {
  vehicleId: string;
  userId: string;
  startDate: string; // ISO
  endDate?: string | null; // ISO or null
}): Promise<ServiceResponse<any>> {
  try {
    const token = await getAccessToken().catch(() => undefined);
    const url = `${API_CONFIG.BASE_URL}/vehicle-responsibles`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const parsed = await res.json().catch(() => null);
    if (!parsed)
      return { success: false, data: null, message: "Respuesta inválida" };
    return { success: true, data: normalizeVehicleResponsible(parsed) as any };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      message: "Error al crear responsable de vehículo",
      error: error as any,
    };
  }
}

export async function updateVehicleResponsible(
  id: string,
  payload: Partial<{
    vehicleId: string;
    userId: string;
    startDate: string;
    endDate: string | null;
  }>
): Promise<ServiceResponse<any>> {
  try {
    const token = await getAccessToken().catch(() => undefined);
    const url = `${API_CONFIG.BASE_URL}/vehicle-responsibles/${id}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const parsed = await res.json().catch(() => null);
    if (!parsed)
      return { success: false, data: null, message: "Respuesta inválida" };
    return { success: true, data: normalizeVehicleResponsible(parsed) as any };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      message: "Error al actualizar responsable de vehículo",
      error: error as any,
    };
  }
}

export async function deleteVehicleResponsible(
  id: string
): Promise<ServiceResponse<null>> {
  try {
    const token = await getAccessToken().catch(() => undefined);
    const url = `${API_CONFIG.BASE_URL}/vehicle-responsibles/${id}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    // Some APIs return empty body on delete
    if (res.status === 204) {
      return { success: true, data: null };
    }
    const parsed = await res.json().catch(() => null);
    return { success: true, data: null, message: parsed?.message };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      message: "Error al eliminar responsable de vehículo",
      error: error as any,
    };
  }
}
