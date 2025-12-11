import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { RadarChartProps, ChartClickEvent } from "../core/types";
import { getChartColor, DEFAULT_CHART_HEIGHT } from "../core/constants";

export default function RadarChartComponent<T extends Record<string, unknown>>({
  data,
  angleKey,
  series,
  height = DEFAULT_CHART_HEIGHT,
  colors,
  showTooltip = true,
  showLegend = false,
  onElementClick,
  fillOpacity = 0.3,
  style,
}: RadarChartProps<T>) {
  const handleRadarClick = (
    radarData: T,
    index: number,
    seriesDataKey: string
  ) => {
    if (onElementClick) {
      onElementClick({
        data: radarData,
        index,
        dataKey: seriesDataKey,
      } as ChartClickEvent<T>);
    }
  };

  return (
    <div style={{ width: "100%", height, ...style }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart
          data={data}
          onClick={(e) => {
            if (e && e.activePayload && e.activePayload[0] && onElementClick) {
              const payload = e.activePayload[0];
              handleRadarClick(
                payload.payload as T,
                e.activeTooltipIndex ?? 0,
                payload.dataKey as string
              );
            }
          }}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey={angleKey} />
          <PolarRadiusAxis angle={90} domain={[0, "dataMax"]} />

          {series.map((s, seriesIndex) => {
            const color = s.color || getChartColor(seriesIndex, colors);
            return (
              <Radar
                key={s.dataKey}
                name={s.name || s.dataKey}
                dataKey={s.dataKey}
                stroke={color}
                fill={color}
                fillOpacity={fillOpacity}
              />
            );
          })}

          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
