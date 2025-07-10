import { CircularProgress, Alert } from "@mui/material";
import "./Vehicles.css";
import Table from "../../components/Table/table";
import { getVehicles } from "../../services/vehicles";
import { useAsyncData } from "../../hooks";
import type { Vehicle, VehiclesApiResponse } from "../../types/vehicle";

const columns = [
  { field: "licensePlate", headerName: "Patente", width: 120 },
  { field: "brand", headerName: "Marca", width: 150 },
  { field: "model", headerName: "Modelo", width: 150 },
  { field: "year", headerName: "Año", width: 100 },
];

export default function Vehicles() {
  const fetchVehiclesData = async (): Promise<Vehicle[]> => {
    const response: VehiclesApiResponse = await getVehicles();
    return response.data;
  };

  const { data: vehicles, loading, error } = useAsyncData(fetchVehiclesData);

  if (loading) {
    return (
      <div className="vehicles-container">
        <h1 className="vehicles-title">Gestión de Vehículos</h1>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "2rem",
          }}
        >
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vehicles-container">
        <h1 className="vehicles-title">Gestión de Vehículos</h1>
        <Alert severity="error" style={{ margin: "2rem" }}>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="vehicles-container">
      <h1 className="vehicles-title">Gestión de Vehículos</h1>
      <Table rows={vehicles || []} columns={columns} title="" />
    </div>
  );
}
