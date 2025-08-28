import Table from "../../components/Table/table";
import { getVehicleResponsibles } from "../../services/vehicleResponsibles";
import "./VehicleResponsibles.css";

const columns = [
  { field: "userFullName", headerName: "Responsable", minWidth: 180 },
  { field: "userDni", headerName: "DNI", minWidth: 120 },
  { field: "userEmail", headerName: "Email", minWidth: 220 },
  { field: "vehicleFullName", headerName: "Vehículo", minWidth: 180 },
  { field: "vehicleLicensePlate", headerName: "Patente", minWidth: 120 },
  { field: "vehicleBrand", headerName: "Marca", minWidth: 120 },
  { field: "vehicleModel", headerName: "Modelo", minWidth: 120 },
  { field: "vehicleYear", headerName: "Año", minWidth: 100 },
  { field: "startDateFormatted", headerName: "Inicio", minWidth: 120 },
  { field: "endDateFormatted", headerName: "Fin", minWidth: 120 },
];

const getRows = async (pagination: any) => {
  const response = await getVehicleResponsibles(pagination);

  // Ensure each item has an `id` and return as-is (service provides normalized fields)
  const data = (response.data || []).map((item: any) => ({
    id: item.id,
    ...item,
  }));

  return {
    ...response,
    data,
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
