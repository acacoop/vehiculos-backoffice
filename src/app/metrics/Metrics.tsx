import MetricsPanel from "../../components/MetricsPanel/MetricsPanel";

export default function Metrics() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Metrics</h1>
      <MetricsPanel type="usuariosPie" />
      <MetricsPanel type="usuariosBar" />
      <MetricsPanel type="autosRadar" />
      <MetricsPanel type="reservasLine" />
      <MetricsPanel type="reservasArea" />
      <MetricsPanel type="topUsuariosBar" />
    </div>
  );
}
