import type { ServiceResponse } from "../common";
import type {
  VehicleResponsible,
  VehicleResponsibleFilterParams,
} from "../types/vehicleResponsible";
import {
  addApiFindOptions,
  apiCreateItem,
  apiDeleteItem,
  apiFindAllItems,
  apiFindItemById,
  apiUpdateItem,
  type ApiFindOptions,
} from "./common";

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
  findOptions?: ApiFindOptions<VehicleResponsibleFilterParams>
): Promise<ServiceResponse<VehicleResponsible[] | null>> {
  const params = new URLSearchParams();

  if (findOptions) {
    addApiFindOptions(params, findOptions, [
      { field: "userId" },
      { field: "vehicleId" },
      { field: "active", transform: (value) => String(value) },
      { field: "date" },
      { field: "search" },
    ]);
  }

  return await apiFindAllItems<VehicleResponsible>(
    "vehicle-responsibles",
    params,
    normalizeVehicleResponsible,
    "Error al obtener responsables de vehículos"
  );
}

export async function getVehicleResponsibleById(
  id: string
): Promise<ServiceResponse<VehicleResponsible | null>> {
  return await apiFindItemById<VehicleResponsible>(
    "vehicle-responsibles",
    id,
    normalizeVehicleResponsible,
    "Error al obtener responsable de vehículo"
  );
}

export async function createVehicleResponsible(payload: {
  vehicleId: string;
  userId: string;
  startDate: string; // ISO
  endDate?: string | null; // ISO or null
}): Promise<ServiceResponse<VehicleResponsible | null>> {
  return await apiCreateItem<VehicleResponsible>(
    "vehicle-responsibles",
    payload,
    normalizeVehicleResponsible,
    "Error al crear responsable de vehículo"
  );
}

export async function updateVehicleResponsible(
  id: string,
  payload: Partial<{
    vehicleId: string;
    userId: string;
    startDate: string;
    endDate: string | null;
  }>
): Promise<ServiceResponse<VehicleResponsible | null>> {
  return await apiUpdateItem<VehicleResponsible>(
    "vehicle-responsibles",
    id,
    payload,
    normalizeVehicleResponsible,
    "Error al actualizar responsable de vehículo"
  );
}

export async function deleteVehicleResponsible(
  id: string
): Promise<ServiceResponse<null>> {
  return await apiDeleteItem<null>(
    "vehicle-responsibles",
    id,
    normalizeVehicleResponsible,
    "Error al eliminar responsable de vehículo"
  );
}
