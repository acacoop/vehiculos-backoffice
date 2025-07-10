import { useEffect, useState } from "react";
import { Table } from "../Table/table";
import { getAssignmentsByUser } from "../../services/assignments";
import { getVehicleById } from "../../services/vehicles";
import usersData from "../../data/user.json";
import "./UserCarPanel.css";

const ACTIVE_USER_ID = 1; // Simulación, reemplazar por el id real del usuario logueado

type CarType = {
  name: string;
  patente: string;
};

type UserType = {
  id: number;
  name: string;
  email: string;
  active: boolean;
  car: string;
  patente?: string;
  role: string;
  cars?: CarType[];
};

export default function UserCarPanel() {
  // Buscar usuario activo (simulación)
  const user: UserType | undefined = (usersData as UserType[]).find(
    (u) => u.id === ACTIVE_USER_ID
  );

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAssignmentsAndVehicles() {
      if (!user) return;
      setLoading(true);
      try {
        // Traer asignaciones del usuario
        const assignmentsRes = await getAssignmentsByUser(String(user.id));
        const assignments = assignmentsRes.data;
        // Traer datos de cada vehículo asignado
        const vehicles = await Promise.all(
          assignments.map(async (a: any) => {
            try {
              const v = await getVehicleById(a.vehicleId);
              return {
                id: a.id,
                licensePlate: v.licensePlate,
                brand: v.brand,
                model: v.model || "",
                year: v.year || "",
                startDate: a.startDate,
                endDate: a.endDate,
                active: a.active,
              };
            } catch {
              return null;
            }
          })
        );
        setRows(vehicles.filter(Boolean));
      } finally {
        setLoading(false);
      }
    }
    fetchAssignmentsAndVehicles();
  }, [user?.id]);

  const columns = [
    { field: "licensePlate", headerName: "Patente", flex: 1 },
    { field: "brand", headerName: "Marca", flex: 1 },
    { field: "model", headerName: "Modelo", flex: 1 },
    { field: "year", headerName: "Año", flex: 1 },
    {
      field: "startDate",
      headerName: "Asignado desde",
      flex: 1,
    },
    { field: "endDate", headerName: "Hasta", flex: 1 },
    {
      field: "active",
      headerName: "Activo",
      flex: 1,
      renderCell: (params: any) => (params.value ? "Sí" : "No"),
    },
  ];

  return (
    <div
      className="user-car-panel-container"
      style={{ width: 860, margin: "0 auto" }}
    >
      <label className="user-car-panel-title">Vehículos asignados</label>
      <div style={{ width: "100%" }}>
        <Table rows={rows} columns={columns} title="" />
      </div>
      {loading && <div style={{ marginTop: 16 }}>Cargando...</div>}
    </div>
  );
}
