import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PieChartProps, ChartClickEvent } from "../core/types";
import { getChartColor, DEFAULT_CHART_HEIGHT } from "../core/constants";

interface PieEntry {
  name: string;
  percent: number;
  [key: string]: unknown;
}

export default function PieChartComponent<T extends Record<string, unknown>>({
  data,
  nameKey,
  dataKey,
  height = DEFAULT_CHART_HEIGHT,
  colors,
  showTooltip = true,
  showLegend = true,
  onElementClick,
  innerRadius = 0,
  outerRadius = 80,
  showLabels = true,
  labelFormatter,
  style,
}: PieChartProps<T>) {
  // Build color map: assign colors based on value ranking (highest value = first color)
  const colorRankMap = new Map<number, number>();
  const indexedValues = data.map((item, index) => ({
    index,
    value: Number(item[dataKey] ?? 0),
  }));
  indexedValues.sort((a, b) => b.value - a.value);
  indexedValues.forEach((item, rank) => {
    colorRankMap.set(item.index, rank);
  });

  const getColorByRank = (index: number) => {
    const rank = colorRankMap.get(index) ?? index;
    return getChartColor(rank, colors);
  };

  const handlePieClick = (pieData: T, index: number) => {
    if (onElementClick) {
      onElementClick({
        data: pieData,
        index,
        dataKey,
      } as ChartClickEvent<T>);
    }
  };

  const defaultLabelFormatter = (entry: PieEntry) => {
    const name = entry.name;
    const percent = entry.percent;
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  const renderLabel = showLabels
    ? (entry: PieEntry) => {
        if (labelFormatter) {
          return labelFormatter(entry as unknown as T, entry.percent);
        }
        return defaultLabelFormatter(entry);
      }
    : false;

  return (
    <div style={{ width: "100%", height, ...style }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            label={renderLabel}
            cursor={onElementClick ? "pointer" : undefined}
            onClick={(pieData: T, index: number) =>
              handlePieClick(pieData, index)
            }
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColorByRank(index)}
                cursor={onElementClick ? "pointer" : undefined}
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
