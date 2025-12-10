import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import type { ChartClickEvent } from "../../components/Charts";
import type {
  BucketChartData,
  DistributionChartData,
  TimelineChartData,
} from "./types";

/**
 * Hook que proporciona handlers de navegación para los gráficos de métricas
 */
export function useMetricsNavigation() {
  const navigate = useNavigate();

  const handleKilometersClick = useCallback(
    (event: ChartClickEvent<BucketChartData>) => {
      const { min, max } = event.data;
      const params = new URLSearchParams();
      params.set("minKilometers", min.toString());
      if (max !== null) {
        params.set("maxKilometers", max.toString());
      }
      navigate(`/vehicles?${params.toString()}`);
    },
    [navigate]
  );

  const handleAgeClick = useCallback(
    (event: ChartClickEvent<BucketChartData>) => {
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
    (event: ChartClickEvent<DistributionChartData>) => {
      const { id } = event.data;
      if (id) {
        navigate(`/vehicles?brandId=${id}`);
      }
    },
    [navigate]
  );

  const handleFuelTypeClick = useCallback(
    (event: ChartClickEvent<DistributionChartData>) => {
      const { name } = event.data;
      navigate(`/vehicles?fuelType=${encodeURIComponent(name)}`);
    },
    [navigate]
  );

  const handleReservationsClick = useCallback(
    (event: ChartClickEvent<TimelineChartData>) => {
      const { month } = event.data;
      const [year, monthNum] = month.split("-");
      navigate(`/reservations?year=${year}&month=${monthNum}`);
    },
    [navigate]
  );

  return {
    handleKilometersClick,
    handleAgeClick,
    handleBrandClick,
    handleFuelTypeClick,
    handleReservationsClick,
  };
}
