import type {
  GenericChartProps,
  BarChartProps,
  LineChartProps,
  AreaChartProps,
  PieChartProps,
  RadarChartProps,
  ChartDataItem,
} from "../core/types";
import {
  BarChart as BarChartComponent,
  LineChart as LineChartComponent,
  AreaChart as AreaChartComponent,
  PieChart as PieChartComponent,
  RadarChart as RadarChartComponent,
} from "../components";

export default function GenericChart<T extends ChartDataItem = ChartDataItem>({
  type,
  data,
  config,
  onElementClick,
}: GenericChartProps<T>) {
  const baseProps = {
    data,
    onElementClick,
  };

  switch (type) {
    case "bar":
      return (
        <BarChartComponent<T>
          {...baseProps}
          {...(config as Omit<BarChartProps<T>, "data">)}
        />
      );

    case "horizontalBar":
      return (
        <BarChartComponent<T>
          {...baseProps}
          {...(config as Omit<BarChartProps<T>, "data">)}
          layout="vertical"
        />
      );

    case "line":
      return (
        <LineChartComponent<T>
          {...baseProps}
          {...(config as Omit<LineChartProps<T>, "data">)}
        />
      );

    case "area":
      return (
        <AreaChartComponent<T>
          {...baseProps}
          {...(config as Omit<AreaChartProps<T>, "data">)}
        />
      );

    case "pie":
      return (
        <PieChartComponent<T>
          {...baseProps}
          {...(config as Omit<PieChartProps<T>, "data">)}
        />
      );

    case "radar":
      return (
        <RadarChartComponent<T>
          {...baseProps}
          {...(config as Omit<RadarChartProps<T>, "data">)}
        />
      );

    default:
      return (
        <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
          Tipo de gráfico "{type}" no soportado
        </div>
      );
  }
}
