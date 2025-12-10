import type { MetricsState } from "./types";
import type {
  BucketChartData,
  DistributionChartData,
  TimelineChartData,
  QuarterlyControlChartData,
} from "./types";

// ============================================
// Funciones de transformación de datos
// ============================================

/** Transforma buckets del API a datos para gráfico */
export function prepareBucketData(
  buckets: MetricsState["vehiclesByKilometers"]
): BucketChartData[] {
  return (
    buckets?.buckets.map((b) => ({
      label: b.label,
      min: b.min,
      max: b.max,
      count: b.count,
    })) ?? []
  );
}

/** Transforma distribución del API a datos para gráfico con top N + "Otros" */
export function prepareDistributionData(
  distribution: MetricsState["vehiclesByBrand"],
  topN: number = 4
): DistributionChartData[] {
  const allData: DistributionChartData[] =
    distribution?.distribution.map((d) => ({
      id: d.id,
      name: d.name,
      count: d.count,
    })) ?? [];

  if (allData.length <= topN) return allData;

  const sorted = [...allData].sort((a, b) => b.count - a.count);
  const topItems = sorted.slice(0, topN);
  const otherItems = sorted.slice(topN);

  return [
    ...topItems,
    {
      id: null,
      name: "Otros",
      count: otherItems.reduce((sum, item) => sum + item.count, 0),
    },
  ];
}

/** Transforma timeline del API a datos para gráfico */
export function prepareTimelineData(
  timeline:
    | MetricsState["reservationsTimeline"]
    | MetricsState["driversMetrics"]
): TimelineChartData[] {
  if (!timeline) return [];

  const items = "timeline" in timeline ? timeline.timeline : [];
  return items.map((t) => ({
    month: t.month,
    count: t.count,
  }));
}

/** Transforma controles trimestrales del API a datos para gráfico */
export function prepareQuarterlyControlsData(
  controls: MetricsState["quarterlyControls"]
): QuarterlyControlChartData[] {
  return (
    controls?.metrics.map((q) => ({
      label: q.label,
      year: q.year,
      quarter: q.quarter,
      aprobados: q.aprobados,
      pendientes: q.pendientes,
      rechazados: q.rechazados,
      vencidos: q.vencidos,
      total: q.total,
    })) ?? []
  );
}

/** Calcula el total de un array de timeline */
export function sumTimelineCount(data: TimelineChartData[]): number {
  return data.reduce((sum, item) => sum + item.count, 0);
}
