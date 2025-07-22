import { type GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import VehicleInfo from "../../components/VehicleInfo/VehicleInfo";
import TechnicalSheet from "../../components/TechnicalSheet/TechnicalSheet";
import Table from "../../components/Table/table";
import { getMaintenances } from "../../services/maintenances";
import type { Maintenance } from "../../types/maintenance";
import Document from "../../components/Document/Document";
import CarUnsubscribeButton from "../../components/CarUnsubscribeButton/CarUnsubscribeButton";
import "./VehicleEdit.css";

export default function VehicleEdit() {
  const [isVehicleActive, setIsVehicleActive] = useState(true);

  // Función para manejar el cambio de estado del vehículo
  const handleVehicleStatusChange = (isActive: boolean) => {
    setIsVehicleActive(isActive);
    console.log(`Vehículo ${isActive ? "reactivado" : "dado de baja"}`);
  };
  // Definir las columnas para la tabla de mantenimientos
  const maintenanceColumns: GridColDef<Maintenance>[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "name",
      headerName: "Nombre",
      flex: 1,
      minWidth: 200,
    },
  ];

  // Función wrapper para adaptar getMaintenances al formato esperado por Table
  const getMaintenancesForTable = async (pagination: any) => {
    return await getMaintenances(undefined, pagination);
  };

  return (
    <div className="vehicle-edit-container">
      <h2 className="title">Editar Vehículo</h2>
      <CarUnsubscribeButton
        active={isVehicleActive}
        onToggle={handleVehicleStatusChange}
      />
      <VehicleInfo isVehicleActive={isVehicleActive} />
      <TechnicalSheet />
      <h2 className="title">Mantenimientos</h2>
      <Table<Maintenance>
        getRows={getMaintenancesForTable}
        columns={maintenanceColumns}
        title=""
        showEditColumn={false}
      />
      <h2 className="title">Documentación</h2>
      <Document />
    </div>
  );
}
