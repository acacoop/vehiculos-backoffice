import type { ServiceResponse, PaginationParams } from "../common";
import { API_CONFIG } from "../common/constants";
import { getAccessToken } from "../common/auth";
import type { VehicleResponsible } from "../types/vehicleResponsible";

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
    // Try to parse JSON, but guard so a non-json (HTML) response won't crash the app.
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

    // Helper: normalize each item to include convenient flat fields for the UI
    const normalize = (item: any) => {
      const rawUser = item.user ?? {};
      const rawVehicle = item.vehicle ?? {};

      const firstName =
        rawUser.firstName ?? rawUser.first_name ?? rawUser.name ?? "";
      const lastName = rawUser.lastName ?? rawUser.last_name ?? "";
      const dni = rawUser.dni ?? rawUser.document ?? null;
      const email = rawUser.email ?? rawUser.mail ?? "";

      const licensePlate =
        rawVehicle.licensePlate ??
        rawVehicle.license_plate ??
        rawVehicle.plate ??
        "";
      const brand = rawVehicle.brand ?? rawVehicle.make ?? "";
      const model = rawVehicle.model ?? rawVehicle.modelo ?? "";
      const year = rawVehicle.year ?? rawVehicle.anio ?? null;

      return {
        ...item,
        user: {
          id: rawUser.id ?? rawUser.userId ?? null,
          firstName,
          lastName,
          dni,
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
        userDni: dni,
        userEmail: email,
        vehicleFullName: `${brand} ${model}`.trim(),
        vehicleLicensePlate: licensePlate,
        vehicleBrand: brand,
        vehicleModel: model,
        vehicleYear: year,
        startDateFormatted: item.startDate
          ? String(item.startDate).split("T")[0]
          : null,
        endDateFormatted: item.endDate
          ? String(item.endDate).split("T")[0]
          : null,
      };
    };

    const items = itemsRaw.map(normalize);

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
