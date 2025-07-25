import { useState } from "react";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./TechnicalSheet.css";

interface TechnicalData {
  nroChasis: string;
  nroMotor: string;
  tipo: string;
  transmicion?: string;
  combustible?: string;
}

interface TechnicalSheetProps {
  showActions?: boolean; // Prop para controlar si se muestran las acciones
}

export default function TechnicalSheet({
  showActions = true,
}: TechnicalSheetProps) {
  const hardcodedData = {
    nroChasis: "1HGCM82633A123456",
    nroMotor: "K20A123456",
    tipo: "Sedán",
    transmicion: "Automática",
    combustible: "Gasolina",
  };

  const [technicalData, setTechnicalData] = useState<TechnicalData>({
    nroChasis: hardcodedData.nroChasis,
    nroMotor: hardcodedData.nroMotor,
    tipo: hardcodedData.tipo,
  });

  const [, setOriginalData] = useState<TechnicalData>({
    nroChasis: hardcodedData.nroChasis,
    nroMotor: hardcodedData.nroMotor,
    tipo: hardcodedData.tipo,
  });

  const [showDialog, setShowDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleConfirmClick = () => {
    setShowDialog(true);
  };

  const handleConfirmSave = async () => {
    try {
      setUpdating(true);
      console.log("💾 Actualizando ficha técnica:", technicalData);

      // Simular llamada al servicio
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("✅ Ficha técnica actualizada exitosamente");
      setOriginalData(technicalData);
      setShowDialog(false);
    } catch (err) {
      console.error("❌ Error al actualizar ficha técnica:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <div className="technical-sheet">
      <div className="technical-sheet-header">
        <div className="technical-info">
          <h2 style={{ color: "#282d86", fontSize: 20 }}>Ficha Técnica</h2>
          <div className="technical-field">
            <p className="technical-label">Nro de Chasis</p>
            <input
              type="text"
              value={technicalData.nroChasis}
              onChange={(e) =>
                setTechnicalData({
                  ...technicalData,
                  nroChasis: e.target.value,
                })
              }
            />
          </div>
          <div className="technical-field">
            <p className="technical-label">Nro de Motor</p>
            <input
              type="text"
              value={technicalData.nroMotor}
              onChange={(e) =>
                setTechnicalData({ ...technicalData, nroMotor: e.target.value })
              }
            />
          </div>
          <div className="technical-field">
            <p className="technical-label">Tipo</p>
            <input
              type="text"
              value={technicalData.tipo}
              onChange={(e) =>
                setTechnicalData({ ...technicalData, tipo: e.target.value })
              }
            />
          </div>
          <div className="technical-field">
            <p className="technical-label">Transmisión</p>
            <input
              type="text"
              value={technicalData.transmicion || ""}
              onChange={(e) =>
                setTechnicalData({
                  ...technicalData,
                  transmicion: e.target.value,
                })
              }
            />
          </div>
          <div className="technical-field">
            <p className="technical-label">Combustible</p>
            <input
              type="text"
              value={technicalData.combustible || ""}
              onChange={(e) =>
                setTechnicalData({
                  ...technicalData,
                  combustible: e.target.value,
                })
              }
            />
          </div>
        </div>
        {showActions && (
          <div className="technical-actions">
            <button
              className="confirm-button"
              onClick={handleConfirmClick}
              disabled={updating}
              style={{
                opacity: updating ? 0.5 : 1,
                cursor: updating ? "not-allowed" : "pointer",
              }}
            >
              {updating ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        )}

        {showDialog && (
          <ConfirmDialog
            open={showDialog}
            title="Confirmar cambios"
            message="¿Estás seguro de que quieres guardar los cambios en la ficha técnica?"
            onConfirm={handleConfirmSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
