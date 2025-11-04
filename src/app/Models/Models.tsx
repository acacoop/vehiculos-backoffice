import { useNavigate } from "react-router-dom";
import { Table } from "../../components";
import "./Models.css";
import type { ServiceResponse, PaginationParams } from "../../common";
import { getVehicleBrands } from "../../services/vehicleBrands";
import { getVehicleModels } from "../../services/vehicleModels";

interface BrandRow {
  id: string;
  name: string;
}

interface ModelRow {
  id: string;
  brand: string;
  model: string;
  brandId: string;
}

const brandColumns = [{ field: "name", headerName: "Marca", flex: 1 }];

const modelColumns = [
  { field: "brand", headerName: "Marca", flex: 1 },
  { field: "model", headerName: "Modelo", flex: 1 },
];

async function fetchBrands(
  pagination: PaginationParams
): Promise<ServiceResponse<BrandRow[]>> {
  try {
    const resp = await getVehicleBrands({
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
      },
    });
    if (!resp.success) {
      return { success: false, data: [], message: resp.message };
    }
    const rows: BrandRow[] = resp.data.items.map((b) => ({
      id: b.id,
      name: b.name,
    }));
    const limit = pagination.limit || 20;
    return {
      success: true,
      data: rows,
      pagination: {
        page: pagination.page || 1,
        pageSize: limit,
        total: resp.data.total,
        pages: Math.ceil(resp.data.total / limit),
      },
    };
  } catch (e: any) {
    return { success: false, data: [], message: "Error cargando marcas" };
  }
}

async function fetchModels(
  pagination: PaginationParams
): Promise<ServiceResponse<ModelRow[]>> {
  try {
    const resp = await getVehicleModels({
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
      },
    });
    if (!resp.success) {
      return { success: false, data: [], message: resp.message };
    }
    const rows: ModelRow[] = resp.data.items.map((m) => ({
      id: m.id,
      model: m.name,
      brand: m.brand?.name || "",
      brandId: m.brand?.id || "",
    }));
    const limit = pagination.limit || 20;
    return {
      success: true,
      data: rows,
      pagination: {
        page: pagination.page || 1,
        pageSize: limit,
        total: resp.data.total,
        pages: Math.ceil(resp.data.total / limit),
      },
    };
  } catch (e: any) {
    return { success: false, data: [], message: "Error cargando modelos" };
  }
}

export default function Models() {
  const navigate = useNavigate();

  return (
    <div className="models-container">
      <Table<BrandRow>
        getRows={fetchBrands}
        columns={brandColumns as any}
        title=""
        showTableHeader={true}
        headerTitle="Gestión de Marcas"
        showAddButton={true}
        addButtonText="+ Agregar Marca"
        onAddButtonClick={() => navigate("/vehicle-brand/create")}
        showEditColumn={true}
        editRoute="/vehicle-brand/edit"
      />

      <Table<ModelRow>
        getRows={fetchModels}
        columns={modelColumns as any}
        title=""
        showTableHeader={true}
        headerTitle="Gestión de Modelos"
        showAddButton={true}
        addButtonText="+ Agregar Modelo"
        onAddButtonClick={() => navigate("/vehicle-model/create")}
        showEditColumn={true}
        editRoute="/vehicle-model/edit"
      />
    </div>
  );
}
