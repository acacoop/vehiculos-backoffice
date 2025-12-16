import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AreaChartProps, ChartClickEvent } from "../core/types";
import {
  getChartColor,
  AXIS_CONFIG,
  GRID_CONFIG,
  DEFAULT_CHART_HEIGHT,
} from "../core/constants";
import { getTickFormatter, calculateTickInterval } from "../core/formatters";

/**
 * Componente de gráfico de área genérico.
 * Soporta múltiples series, diferentes tipos de curva y click handlers.
 */
export default function AreaChartComponent<T extends Record<string, unknown>>({
  data,
  xAxisKey,
  series,
  height = DEFAULT_CHART_HEIGHT,
  colors,
  showTooltip = true,
  showLegend = false,
  showGrid = true,
  onElementClick,
  curveType = "monotone",
  fillOpacity = 0.3,
  maxXAxisLabels = 6,
  xAxisFormat = "auto",
  style,
}: AreaChartProps<T>) {
  const handleAreaClick = (
    areaData: T,
    index: number,
    seriesDataKey: string,
  ) => {
    if (onElementClick) {
      onElementClick({
        data: areaData,
        index,
        dataKey: seriesDataKey,
      } as ChartClickEvent<T>);
    }
  };

  const tickFormatter = getTickFormatter(xAxisFormat, data, xAxisKey);
  const tickInterval = calculateTickInterval(data.length, maxXAxisLabels);

  return (
    <div style={{ width: "100%", height, ...style }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          onClick={(e) => {
            if (e && e.activePayload && e.activePayload[0] && onElementClick) {
              const payload = e.activePayload[0];
              handleAreaClick(
                payload.payload as T,
                e.activeTooltipIndex ?? 0,
                payload.dataKey as string,
              );
            }
          }}
        >
          {showGrid && <CartesianGrid {...GRID_CONFIG} />}
          <XAxis
            dataKey={xAxisKey}
            {...AXIS_CONFIG}
            tickMargin={8}
            interval={tickInterval}
            tickFormatter={tickFormatter}
          />
          <YAxis allowDecimals={false} {...AXIS_CONFIG} />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}

          {series.map((s, seriesIndex) => {
            const color = s.color || getChartColor(seriesIndex, colors);
            return (
              <Area
                key={s.dataKey}
                type={curveType}
                dataKey={s.dataKey}
                name={s.name || s.dataKey}
                stroke={color}
                fill={color}
                fillOpacity={fillOpacity}
                stackId={s.stackId}
                activeDot={
                  onElementClick ? { r: 6, cursor: "pointer" } : { r: 6 }
                }
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
