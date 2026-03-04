import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import type { ChartClickEvent } from "../../components/Charts";
import type {
  Bucket,
  DistributionItem,
  TimelineItem,
  QuarterlyControlMetric,
} from "../../services/metrics";

/**
 * Hook que proporciona handlers de navegación para los gráficos de métricas
 */
export function useMetricsNavigation() {
  const navigate = useNavigate();

  const handleKilometersClick = useCallback(
    (event: ChartClickEvent<Bucket>) => {
      const { min, max, label } = event.data;
      const params = new URLSearchParams();

      // Si es "Sin registro", no aplicar filtros de kilómetros
      if (label === "Sin registro") {
        params.set("hasNoKilometers", "true");
      } else {
        params.set("minKilometers", min.toString());
        if (max !== null) {
          params.set("maxKilometers", max.toString());
        }
      }
      navigate(`/vehicles?${params.toString()}`);
    },
    [navigate]
  );

  const handleAgeClick = useCallback(
    (event: ChartClickEvent<Bucket>) => {
      const { min, max } = event.data;
      const currentYear = new Date().getFullYear();
      const params = new URLSearchParams();
      if (max !== null) {
        params.set("minYear", (currentYear - max).toString());
      }
      params.set("maxYear", (currentYear - min).toString());
      navigate(`/vehicles?${params.toString()}`);
    },
    [navigate]
  );

  const handleBrandClick = useCallback(
    (event: ChartClickEvent<DistributionItem>) => {
      const { id } = event.data;
      if (id) {
        navigate(`/vehicles?brandId=${id}`);
      }
    },
    [navigate]
  );

  const handleFuelTypeClick = useCallback(
    (event: ChartClickEvent<DistributionItem>) => {
      const { name } = event.data;
      navigate(`/vehicles?fuelType=${encodeURIComponent(name)}`);
    },
    [navigate]
  );

  const handleReservationsClick = useCallback(
    (event: ChartClickEvent<TimelineItem>) => {
      const { month } = event.data;
      const [year, monthNum] = month.split("-");

      // Calcular startDate (primer día del mes) y endDate (último día del mes)
      const startDate = `${year}-${monthNum}-01`;
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
      const endDate = `${year}-${monthNum}-${lastDay
        .toString()
        .padStart(2, "0")}`;

      navigate(`/reservations?startDate=${startDate}&endDate=${endDate}`);
    },
    [navigate]
  );

  const handleQuarterlyControlsClick = useCallback(
    (event: ChartClickEvent<QuarterlyControlMetric>) => {
      const { year, quarter } = event.data;
      const params = new URLSearchParams();

      params.set("year", year.toString());
      params.set("quarter", quarter.toString());

      navigate(`/quarterly-controls?${params.toString()}`);
    },
    [navigate]
  );

  return {
    handleKilometersClick,
    handleAgeClick,
    handleBrandClick,
    handleFuelTypeClick,
    handleReservationsClick,
    handleQuarterlyControlsClick,
  };
}
