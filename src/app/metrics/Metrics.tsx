import UnifiedMetrics from "../../components/UnifiedMetrics/UnifiedMetrics";
import "./Metrics.css";

export default function Metrics() {
  return (
    <div className="metrics-container">
      <h1 className="title">Métricas</h1>
      <UnifiedMetrics type="usuariosPie" />
      <UnifiedMetrics type="usuariosBar" />
      <UnifiedMetrics type="vehiclesRadar" />
      <UnifiedMetrics type="reservasLine" />
      <UnifiedMetrics type="reservasArea" />
      <UnifiedMetrics type="topUsuariosBar" />
      <UnifiedMetrics type="custom" />
    </div>
  );
}
