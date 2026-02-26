"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Dumbbell, Clock, Flame, TrendingUp, Loader2 } from "lucide-react";
import { WorkoutType, WorkoutWithSets } from "@/types";
import { formatDuration, calculateVolume } from "@/lib/utils";
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth } from "date-fns";
import { parseFetchResponse } from "@/lib/api-utils";

function computeStats(workouts: WorkoutWithSets[]) {
  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce((sum, w) => sum + calculateVolume(w.sets), 0);
  const totalDuration = workouts.reduce((sum, w) => {
    if (w.endTime) {
      return sum + Math.floor((new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / 1000);
    }
    return sum;
  }, 0);
  const workoutsByType = workouts.reduce(
    (acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    },
    {} as Record<WorkoutType, number>
  );
  return { totalWorkouts, totalVolume, totalDuration, workoutsByType };
}

export default function DashboardPage() {
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutWithSets[]>([]);
  const [weekStats, setWeekStats] = useState({ totalWorkouts: 0, totalVolume: 0, totalDuration: 0 });
  const [monthStats, setMonthStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    workoutsByType: { STRENGTH: 0, CARDIO: 0, STRETCHING: 0, MIXED: 0 } as Record<WorkoutType, number>,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    Promise.all([
      fetch(`/api/workouts?limit=5`),
      fetch(`/api/workouts?from=${weekStart.toISOString()}&to=${weekEnd.toISOString()}`),
      fetch(`/api/workouts?from=${monthStart.toISOString()}&to=${monthEnd.toISOString()}`),
    ])
      .then(async ([recentRes, weekRes, monthRes]) => {
        const [recentData, weekData, monthData] = await Promise.all([
          recentRes.json(),
          weekRes.json(),
          monthRes.json(),
        ]);

        const recent = parseFetchResponse<WorkoutWithSets>(recentRes, recentData);
        const week = parseFetchResponse<WorkoutWithSets>(weekRes, weekData);
        const month = parseFetchResponse<WorkoutWithSets>(monthRes, monthData);

        setRecentWorkouts(recent);
        const weekS = computeStats(week);
        setWeekStats({
          totalWorkouts: weekS.totalWorkouts,
          totalVolume: weekS.totalVolume,
          totalDuration: weekS.totalDuration,
        });
        const monthS = computeStats(month);
        const defaultByType: Record<WorkoutType, number> = { STRENGTH: 0, CARDIO: 0, STRETCHING: 0, MIXED: 0 };
        setMonthStats({
          totalWorkouts: monthS.totalWorkouts,
          totalVolume: monthS.totalVolume,
          workoutsByType: { ...defaultByType, ...monthS.workoutsByType },
        });
      })
      .catch(() => {
        setRecentWorkouts([]);
        setWeekStats({ totalWorkouts: 0, totalVolume: 0, totalDuration: 0 });
        setMonthStats({
          totalWorkouts: 0,
          totalVolume: 0,
          workoutsByType: { STRENGTH: 0, CARDIO: 0, STRETCHING: 0, MIXED: 0 },
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Дашборд</h1>
          <p className="text-muted-foreground">
            Обзор ваших тренировок и прогресса
          </p>
        </div>
        <Link href="/workouts/new">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Начать тренировку
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Тренировок за неделю
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekStats.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              {monthStats.totalWorkouts} за месяц
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Объём за неделю
            </CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weekStats.totalVolume.toLocaleString()} кг
            </div>
            <p className="text-xs text-muted-foreground">
              {monthStats.totalVolume.toLocaleString()} кг за месяц
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Время за неделю
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(weekStats.totalDuration)}
            </div>
            <p className="text-xs text-muted-foreground">
              общая длительность
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Прогресс
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/progress">
              <Button variant="outline" className="w-full">
                Смотреть графики
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Последние тренировки</h2>
          <Link href="/workouts">
            <Button variant="ghost">Все тренировки →</Button>
          </Link>
        </div>

        {recentWorkouts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                У вас пока нет тренировок.
                <br />
                Начните свою первую тренировку!
              </p>
              <Link href="/workouts/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать тренировку
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
