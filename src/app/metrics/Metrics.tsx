import UnifiedMetrics from "../../components/UnifiedMetrics/UnifiedMetrics";
import "./Metrics.css";

export default function Metrics() {
  return (
    <div className="metrics-container">
      <h1 className="title">Métricas</h1>
      <div className="metrics-charts">
        <UnifiedMetrics type="usuariosPie" width="auto" height="auto" />
        <UnifiedMetrics type="usuariosBar" width="auto" height="auto" />
        <UnifiedMetrics type="vehiclesRadar" width="auto" height="auto" />
        <UnifiedMetrics type="custom" width="auto" height="auto" />
      </div>
      <UnifiedMetrics type="reservasLine" width="920px" height="auto" />
      <UnifiedMetrics type="reservasArea" width="920px" height="auto" />
      <UnifiedMetrics type="topUsuariosBar" width="920px" height="auto" />
    </div>
  );
}
