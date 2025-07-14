import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Table } from "../Table/table";
import { getAssignmentsByUser } from "../../services/assignments";
import { getUserById } from "../../services/users"; // Agregar esto
import "./UserCarPanel.css";

export default function UserCarPanel() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null); // Estado para el usuario

  useEffect(() => {
    async function fetchUserAndAssignments() {
      if (!userId) return;

      setLoading(true);
      try {
        console.log("Buscando usuario y asignaciones para ID:", userId);

        //  Traer usuario desde API
        const userData = await getUserById(userId);
        setUser(userData);

        // Traer asignaciones del usuario específico
        const assignmentsRes = await getAssignmentsByUser(userId);
        const assignments = assignmentsRes.data;

        console.log("Usuario encontrado:", userData);
        console.log("Asignaciones recibidas:", assignments);

        // Mapear los datos
        const vehicles = assignments.map((assignment: any) => {
          const vehicle = assignment.vehicle;

          return {
            id: assignment.id,
            licensePlate: vehicle?.licensePlate || "N/A",
            brand: vehicle?.brand || "N/A",
            model: vehicle?.model || "N/A",
            year: vehicle?.year || "N/A",
            startDate: assignment.startDate || "N/A",
            endDate: assignment.endDate || "Sin fecha",
            active: assignment.active,
            imageUrl: vehicle?.imageUrl || "",
          };
        });

        setRows(vehicles);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setRows([]);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndAssignments();
  }, [userId]);

  const columns = [
    { field: "licensePlate", headerName: "Patente", flex: 1 },
    { field: "brand", headerName: "Marca", flex: 1 },
    { field: "model", headerName: "Modelo", flex: 1 },
    { field: "year", headerName: "Año", flex: 1 },
    {
      field: "startDate",
      headerName: "Asignado desde",
      flex: 1,
      renderCell: (params: any) => {
        if (params.value && params.value !== "N/A") {
          const date = new Date(params.value);
          return date.toLocaleDateString("es-AR");
        }
        return params.value;
      },
    },
    {
      field: "endDate",
      headerName: "Hasta",
      flex: 1,
      renderCell: (params: any) => {
        if (params.value && params.value !== "Sin fecha") {
          const date = new Date(params.value);
          return date.toLocaleDateString("es-AR");
        }
        return params.value;
      },
    },
    {
      field: "active",
      headerName: "Activo",
      flex: 1,
      renderCell: (params: any) => (
        <span
          style={{
            color: params.value ? "#4caf50" : "#f44336",
            fontWeight: "bold",
          }}
        >
          {params.value ? "Sí" : "No"}
        </span>
      ),
    },
  ];

  if (!userId) {
    return (
      <div
        className="user-car-panel-container"
        style={{ width: 860, margin: "0 auto" }}
      >
        <label className="user-car-panel-title">Vehículos asignados</label>
        <div style={{ textAlign: "center", color: "#666", marginTop: 16 }}>
          No se ha seleccionado ningún usuario
        </div>
      </div>
    );
  }

  return (
    <div
      className="user-car-panel-container"
      style={{ width: 860, margin: "0 auto" }}
    >
      <label className="user-car-panel-title">
        Vehículos asignados {user ? `a ${user.firstName} ${user.lastName}` : ""}
      </label>
      <div style={{ width: "100%" }}>
        <Table rows={rows} columns={columns} title="" />
      </div>
      {loading && <div style={{ marginTop: 16 }}>Cargando...</div>}
      {!loading && rows.length === 0 && (
        <div style={{ marginTop: 16, textAlign: "center", color: "#666" }}>
          No hay vehículos asignados a este usuario
        </div>
      )}
    </div>
  );
}
