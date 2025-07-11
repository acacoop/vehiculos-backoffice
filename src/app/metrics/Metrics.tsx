import MetricsPanel from "../../components/MetricsPanel/MetricsPanel";
import "./Metrics.css";

export default function Metrics() {
  return (
    <div className="metrics-container">
      <h1 className="title">Métricas</h1>
      <MetricsPanel type="usuariosPie" />
      <MetricsPanel type="usuariosBar" />
      <MetricsPanel type="autosRadar" />
      <MetricsPanel type="reservasLine" />
      <MetricsPanel type="reservasArea" />
      <MetricsPanel type="topUsuariosBar" />
    </div>
  );
}
