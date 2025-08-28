import Table from "../../components/Table/table";
import { useNavigate } from "react-router-dom";
import { getVehicleResponsibles } from "../../services/vehicleResponsibles";
import "./VehicleResponsibles.css";

// columns are defined inside the component so we can use navigate in renderCell

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
  const navigate = useNavigate();
  const columns = [
    { field: "userFullName", headerName: "Responsable", minWidth: 180 },
    { field: "userDni", headerName: "DNI", minWidth: 120 },

    { field: "vehicleFullName", headerName: "Vehículo", minWidth: 120 },
    { field: "vehicleLicensePlate", headerName: "Patente", minWidth: 120 },
    { field: "startDateFormatted", headerName: "Inicio", minWidth: 120 },
    {
      field: "endDateFormatted",
      headerName: "Fin",
      minWidth: 120,
      renderCell: (params: any) => {
        const val = params?.row?.endDateFormatted ?? params?.value;
        return <span>{val ? val : "Indefinida"}</span>;
      },
    },
  ];
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
        onAddButtonClick={() => navigate("/edit-vehicle-responsibles")}
        showEditColumn={true}
        editRoute="/edit-vehicle-responsibles"
        editColumnWidth={100}
        maxWidth="1200px"
      />
    </div>
  );
}
