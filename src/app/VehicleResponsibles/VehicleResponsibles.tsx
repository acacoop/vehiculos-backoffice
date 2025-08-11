import { useEffect, useState } from "react";
import Table from "../../components/Table/table";
import { getVehicleResponsibles } from "../../services/vehicleResponsibles";
import "./VehicleResponsibles.css";

const columns = [
  {
    field: "userFullName",
    headerName: "Responsable",
    valueGetter: (params: any) =>
      `${params.row.user.firstName} ${params.row.user.lastName}`,
    minWidth: 180,
  },
  {
    field: "user.dni",
    headerName: "DNI",
    valueGetter: (params: any) => params.row.user.dni,
    minWidth: 120,
  },
  {
    field: "user.email",
    headerName: "Email",
    valueGetter: (params: any) => params.row.user.email,
    minWidth: 220,
  },
  {
    field: "vehicleFullName",
    headerName: "Vehículo",
    valueGetter: (params: any) =>
      `${params.row.vehicle.brand} ${params.row.vehicle.model}`,
    minWidth: 180,
  },
  {
    field: "vehicle.licensePlate",
    headerName: "Patente",
    valueGetter: (params: any) => params.row.vehicle.licensePlate,
    minWidth: 120,
  },
  {
    field: "vehicle.brand",
    headerName: "Marca",
    valueGetter: (params: any) => params.row.vehicle.brand,
    minWidth: 120,
  },
  {
    field: "vehicle.model",
    headerName: "Modelo",
    valueGetter: (params: any) => params.row.vehicle.model,
    minWidth: 120,
  },
  {
    field: "vehicle.year",
    headerName: "Año",
    valueGetter: (params: any) => params.row.vehicle.year,
    minWidth: 100,
  },
  {
    field: "startDate",
    headerName: "Inicio",
    valueGetter: (params: any) => params.row.startDate?.split("T")[0],
    minWidth: 120,
  },
  {
    field: "endDate",
    headerName: "Fin",
    valueGetter: (params: any) =>
      params.row.endDate ? params.row.endDate.split("T")[0] : "-",
    minWidth: 120,
  },
];

const getRows = async (pagination: any) => {
  const response = await getVehicleResponsibles(pagination);
  return {
    ...response,
    data: (response.data || []).map((item: any) => ({
      id: item.id,
      ...item,
    })),
    pagination: response.pagination,
  };
};

export default function VehicleResponsibles() {
  return (
    <div className="vehicle-responsibles-container">
      <Table
        getRows={getRows}
        columns={columns}
        title=""
        showTableHeader={true}
        headerTitle="Responsables de Vehículos"
        showAddButton={true}
        addButtonText="+ Agregar Responsable"
        maxWidth="1200px"
      />
    </div>
  );
}
