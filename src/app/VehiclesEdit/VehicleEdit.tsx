import { type GridColDef } from "@mui/x-data-grid";
import VehicleInfo from "../../components/VehicleInfo/VehicleInfo";
import TechnicalSheet from "../../components/TechnicalSheet/TechnicalSheet";
import Table from "../../components/Table/table";
import { getMaintenances } from "../../services/maintenances";
import type { Maintenance } from "../../types/maintenance";
import Document from "../../components/Document/Document";
import "./VehicleEdit.css";

export default function VehicleEdit() {
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
      <VehicleInfo />
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
