"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WORKOUT_TYPE_LABELS, WorkoutType } from "@/types";

interface TypeDistributionProps {
  data: { type: WorkoutType; count: number }[];
  title?: string;
}

const COLORS = {
  STRENGTH: "#3b82f6",
  CARDIO: "#ef4444",
  STRETCHING: "#22c55e",
  MIXED: "#a855f7",
};

export function TypeDistribution({
  data,
  title = "Распределение по типам",
}: TypeDistributionProps) {
  const chartData = data.map((item) => ({
    name: WORKOUT_TYPE_LABELS[item.type],
    value: item.count,
    color: COLORS[item.type],
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {total === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Нет данных для отображения
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [value, "Тренировок"]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
