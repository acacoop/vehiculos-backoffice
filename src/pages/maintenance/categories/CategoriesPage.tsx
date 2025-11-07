import { useNavigate } from "react-router-dom";
import { Table, type TableColumn } from "../../../components/Table/table";
import { getMaintenanceCategories } from "../../../services/categories";
import type { Category } from "../../../types/category";

const columns: TableColumn<Category>[] = [
  {
    field: "name",
    headerName: "Nombre",
    minWidth: 250,
  },
];

export default function CategoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <Table
        getRows={getMaintenanceCategories}
        columns={columns}
        header={{
          title: "Categorías de Mantenimiento",
          addButton: {
            text: "+ Nueva Categoría",
            onClick: () => navigate("/maintenance/categories/new"),
          },
        }}
        actionColumn={{
          route: "/maintenance/categories",
        }}
        search={{
          enabled: true,
          placeholder: "Buscar categorías...",
        }}
        width={1200}
      />
    </div>
  );
}
