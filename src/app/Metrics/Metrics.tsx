import { useState, useEffect } from "react";
import UnifiedMetrics from "../../components/UnifiedMetrics/UnifiedMetrics";
import { LoadingSpinner } from "../../components";
import "./Metrics.css";

const METRICS_COUNT = 7; // number of UnifiedMetrics instances on this page

export default function Metrics() {
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const handleMetricLoad = () => {
    setLoadedCount((c) => c + 1);
  };

  // hide spinner when all metrics loaded
  useEffect(() => {
    if (loadedCount >= METRICS_COUNT) setLoading(false);
  }, [loadedCount]);

  return (
    <div className="metrics-container">
      <h1 className="title">Métricas</h1>
      {/* Keep spinner mounted to allow CSS fade-out when `loading` becomes false */}
      <LoadingSpinner message="Cargando métricas..." visible={loading} />
      <div className="metrics-charts">
        <UnifiedMetrics
          type="usuariosPie"
          width="auto"
          height="auto"
          onLoad={handleMetricLoad}
        />
        <UnifiedMetrics
          type="usuariosBar"
          width="auto"
          height="auto"
          onLoad={handleMetricLoad}
        />
        <UnifiedMetrics
          type="vehiclesRadar"
          width="auto"
          height="auto"
          onLoad={handleMetricLoad}
        />
        <UnifiedMetrics
          type="custom"
          width="auto"
          height="auto"
          onLoad={handleMetricLoad}
        />
      </div>
      <UnifiedMetrics
        type="reservasLine"
        width="920px"
        height="auto"
        onLoad={handleMetricLoad}
      />
      <UnifiedMetrics
        type="reservasArea"
        width="920px"
        height="auto"
        onLoad={handleMetricLoad}
      />
      <UnifiedMetrics
        type="topUsuariosBar"
        width="920px"
        height="auto"
        onLoad={handleMetricLoad}
      />
    </div>
  );
}
