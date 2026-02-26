"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressChartProps {
  data: { date: string; maxWeight?: number; maxReps?: number; volume?: number }[];
  title?: string;
  exerciseName?: string;
}

export function ProgressChart({
  data,
  title = "Прогресс",
  exerciseName,
}: ProgressChartProps) {
  const hasWeight = data.some((d) => d.maxWeight !== undefined && (d.maxWeight ?? 0) > 0);
  const hasReps = data.some((d) => d.maxReps !== undefined);
  const hasVolume = data.some((d) => d.volume !== undefined && (d.volume ?? 0) > 0);

  const leftAxisUnit = hasVolume ? "ккал" : "кг";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {title}
          {exerciseName && (
            <span className="font-normal text-muted-foreground ml-2">
              — {exerciseName}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Нет данных для отображения
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} ${leftAxisUnit}`}
                />
                {hasReps && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} раз`}
                  />
                )}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                {hasWeight && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="maxWeight"
                    name="Макс. вес"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2 }}
                  />
                )}
                {hasReps && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="maxReps"
                    name="Макс. повторения"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
                  />
                )}
                {hasVolume && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="volume"
                    name="Калории"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2 }}
                  />
                )}
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
