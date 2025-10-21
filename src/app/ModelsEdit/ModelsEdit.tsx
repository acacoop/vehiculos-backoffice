import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  createVehicleBrand,
  updateVehicleBrand,
  getVehicleBrandById,
  deleteVehicleBrand,
} from "../../services/vehicleBrands";
import {
  createVehicleModel,
  updateVehicleModel,
  getVehicleModelById,
  deleteVehicleModel,
} from "../../services/vehicleModels";
import {
  useVehicleBrandSearch,
  useVehicleTypeSearch,
} from "../../hooks/useEntitySearch";
import {
  FormLayout,
  LoadingSpinner,
  ConfirmDialog,
  NotificationToast,
} from "../../components";
import {
  FieldType,
  EntityType,
  InputType,
} from "../../components/FormLayout/FormLayout";
import { useConfirmDialog, useNotification } from "../../hooks";
import type { VehicleBrand } from "../../types/vehicle";
import "./ModelsEdit.css";

export default function ModelsEdit() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determinar si es edición de marca o modelo según pathname
  const isBrandContext = location.pathname.includes("/vehicle-brand/");
  const isCreateMode = !id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<string>("");
  // const [brands, setBrands] = useState<VehicleBrand[]>([]); // no longer needed with search

  // Brand search hook (solo para modelos)
  const {
    searchTerm: brandSearchTerm,
    availableBrands,
    showDropdown: showBrandDropdown,
    searchBrands,
    selectBrand,
    setSelectedBrand,
    setSearchTerm: setBrandSearchTerm,
    setShowDropdown: setShowBrandDropdown,
  } = useVehicleBrandSearch();

  // Vehicle type search (string suggestions)
  const {
    searchTerm: vehicleTypeTerm,
    availableVehicleTypes,
    showDropdown: showVehicleTypeDropdown,
    searchVehicleTypes,
    selectVehicleType,
    setSearchTerm: setVehicleTypeTerm,
    setShowDropdown: setShowVehicleTypeDropdown,
    setSelectedVehicleType,
  } = useVehicleTypeSearch();

  const {
    isOpen: isConfirmOpen,
    message: confirmMessage,
    showConfirm,
    handleConfirm: confirmDialogConfirm,
    handleCancel: confirmDialogCancel,
  } = useConfirmDialog();
  const { notification, showSuccess, showError, closeNotification } =
    useNotification();

  // Cargar datos existentes
  useEffect(() => {
    const load = async () => {
      if (isBrandContext) {
        // Marca
        if (!isCreateMode && id) {
          setLoading(true);
          const res = await getVehicleBrandById(id);
          if (res.success) setName(res.data.name);
          setLoading(false);
        }
      } else {
        // Modelo
        setLoading(true);
        // Obtener marcas para select
        // Carga diferida via buscador de marcas; ya no pre-cargamos listado completo
        if (!isCreateMode && id) {
          const modelResp = await getVehicleModelById(id);
          if (modelResp.success) {
            setName(modelResp.data.name);
            setBrandId(modelResp.data.brand?.id || "");
            const vt = modelResp.data.vehicleType || "";
            setVehicleType(vt);
            if (vt) {
              setVehicleTypeTerm(vt);
              setSelectedVehicleType(vt);
            }
            if (modelResp.data.brand) {
              setSelectedBrand(modelResp.data.brand);
              setBrandSearchTerm(modelResp.data.brand.name);
            }
          }
        }
        setLoading(false);
      }
    };
    void load();
  }, [id, isCreateMode, isBrandContext]);

  const handleSave = () => {
    if (!name.trim()) {
      showError("El nombre es obligatorio");
      return;
    }
    if (!isBrandContext && !brandId) {
      showError("Debe seleccionar una marca");
      return;
    }
    if (!isBrandContext && !vehicleType.trim()) {
      showError("Debe especificar el tipo de vehículo");
      return;
    }
    const actionText = isCreateMode ? "crear" : "actualizar";
    showConfirm(
      `¿Está seguro que desea ${actionText} este ${
        isBrandContext ? "marca" : "modelo"
      }?`,
      async () => {
        setSaving(true);
        try {
          let resp;
          if (isBrandContext) {
            resp = isCreateMode
              ? await createVehicleBrand(name.trim())
              : id
              ? await updateVehicleBrand(id, name.trim())
              : null;
          } else {
            resp = isCreateMode
              ? await createVehicleModel(
                  name.trim(),
                  brandId,
                  vehicleType.trim()
                )
              : id
              ? await updateVehicleModel(
                  id,
                  name.trim(),
                  brandId,
                  vehicleType.trim()
                )
              : null;
          }
          if (resp?.success) {
            showSuccess(
              `${isBrandContext ? "Marca" : "Modelo"} ${
                isCreateMode ? "creado" : "actualizado"
              } exitosamente`
            );
            setTimeout(
              () => navigate(isBrandContext ? "/models" : "/models"),
              1200
            );
          } else {
            showError(resp?.message || "Error en la operación");
          }
        } catch (e) {
          showError("Error al guardar");
        } finally {
          setSaving(false);
        }
      }
    );
  };

  const handleDelete = () => {
    if (isCreateMode || !id) return;
    showConfirm(
      `¿Está seguro que desea eliminar este ${
        isBrandContext ? "marca" : "modelo"
      }? Esta acción no se puede deshacer.`,
      async () => {
        setSaving(true);
        try {
          let resp;
          resp = isBrandContext
            ? await deleteVehicleBrand(id)
            : await deleteVehicleModel(id);
          if (resp.success) {
            showSuccess(
              `${isBrandContext ? "Marca" : "Modelo"} eliminado exitosamente`
            );
            setTimeout(() => navigate("/models"), 1200);
          } else {
            showError(resp.message || "Error al eliminar");
          }
        } catch (e) {
          showError("Error al eliminar");
        } finally {
          setSaving(false);
        }
      }
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  // Form fields configuration
  const formFields: any[] = [
    {
      type: FieldType.INPUT,
      title: isBrandContext ? "Nombre de la Marca" : "Nombre del Modelo",
      key: "name",
      value: name,
      inputType: InputType.TEXT,
      required: true,
      placeholder: isBrandContext ? "Ej: Toyota" : "Ej: Corolla",
    },
    ...(isBrandContext
      ? []
      : [
          {
            type: FieldType.SEARCH,
            title: "Marca",
            key: "brandId",
            entityType: EntityType.BRAND,
            value: null, // This should be the selected brand object
            searchTerm: brandSearchTerm,
            onSearchChange: (term: string) => {
              setBrandSearchTerm(term);
              searchBrands(term);
            },
            availableEntities: availableBrands,
            showDropdown: showBrandDropdown,
            onSelect: (brand: VehicleBrand) => {
              selectBrand(brand);
              setBrandId(brand.id);
            },
            onDropdownToggle: (show: boolean) => setShowBrandDropdown(show),
            required: true,
            placeholder: "Buscar y seleccionar una marca...",
          },
        ]),
    ...(isBrandContext
      ? []
      : [
          {
            type: FieldType.SEARCH,
            title: "Tipo de Vehículo",
            key: "vehicleType",
            entityType: EntityType.VEHICLE_TYPE,
            value: vehicleType,
            searchTerm: vehicleTypeTerm,
            onSearchChange: (term: string) => {
              setVehicleTypeTerm(term);
              searchVehicleTypes(term);
            },
            availableEntities: availableVehicleTypes,
            showDropdown: showVehicleTypeDropdown,
            onSelect: (type: string) => {
              selectVehicleType(type);
              setVehicleType(type);
            },
            onDropdownToggle: (show: boolean) =>
              setShowVehicleTypeDropdown(show),
            required: true,
            placeholder: "Escriba el tipo de vehículo...",
          },
        ]),
  ];

  const handleFieldChange = (key: string, value: any) => {
    switch (key) {
      case "name":
        setName(value);
        break;
      case "brandId":
        // This will be handled by the onSelect callback
        break;
      case "vehicleType":
        // This will be handled by the onSelect callback
        break;
    }
  };

  const buttonConfig = {
    cancel: {
      text: "Cancelar",
      onClick: () => navigate("/models"),
      type: "button" as const,
    },
    ...(isCreateMode
      ? {}
      : {
          secondary: {
            text: "Eliminar",
            onClick: handleDelete,
            type: "button" as const,
          },
        }),
    primary: {
      text: saving
        ? "Guardando..."
        : isCreateMode
        ? isBrandContext
          ? "Crear Marca"
          : "Crear Modelo"
        : isBrandContext
        ? "Actualizar Marca"
        : "Actualizar Modelo",
      onClick: handleSave,
      type: "submit" as const,
    },
  };

  return (
    <>
      <div className="model-edit-container">
        <FormLayout
          title={
            isBrandContext
              ? isCreateMode
                ? "Nueva Marca"
                : "Editar Marca"
              : isCreateMode
              ? "Nuevo Modelo"
              : "Editar Modelo"
          }
          formFields={formFields}
          buttonConfig={buttonConfig}
          onFieldChange={handleFieldChange}
        />
        <ConfirmDialog
          open={isConfirmOpen}
          message={confirmMessage}
          onConfirm={confirmDialogConfirm}
          onCancel={confirmDialogCancel}
        />
        <NotificationToast
          message={notification.message}
          type={notification.type}
          isOpen={notification.isOpen}
          onClose={closeNotification}
        />
      </div>
    </>
  );
}
