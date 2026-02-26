"use client";

import { useState, useEffect, useCallback } from "react";
import { VolumeChart } from "@/components/charts/VolumeChart";
import { FrequencyChart } from "@/components/charts/FrequencyChart";
import { TypeDistribution } from "@/components/charts/TypeDistribution";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, TrendingUp, Activity, Target } from "lucide-react";
import { Exercise, WorkoutType } from "@/types";

interface ProgressData {
  volumeData: { date: string; volume: number }[];
  frequencyData: { label: string; count: number }[];
  typeData: { type: WorkoutType; count: number }[];
  exerciseProgress: {
    date: string;
    maxWeight?: number;
    maxReps?: number;
    volume?: number;
  }[];
  totalWorkouts: number;
}

export default function ProgressPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("3");
  const [exerciseId, setExerciseId] = useState<string>("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  const fetchExercises = useCallback(async () => {
    try {
      const response = await fetch("/api/exercises");
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("period", period);
      if (exerciseId) params.set("exerciseId", exerciseId);

      const response = await fetch(`/api/progress?${params}`);
      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, [period, exerciseId]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const selectedExercise = exercises.find((e) => e.id === exerciseId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Прогресс</h1>
          <p className="text-muted-foreground">
            Анализ ваших тренировок и достижений
          </p>
        </div>

        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 месяц</SelectItem>
              <SelectItem value="3">3 месяца</SelectItem>
              <SelectItem value="6">6 месяцев</SelectItem>
              <SelectItem value="12">12 месяцев</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : progressData ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Всего тренировок
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {progressData.totalWorkouts}
                </div>
                <p className="text-xs text-muted-foreground">
                  за {period} мес.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Общий объём
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {progressData.volumeData
                    .reduce((sum, d) => sum + d.volume, 0)
                    .toLocaleString()}{" "}
                  ккал
                </div>
                <p className="text-xs text-muted-foreground">
                  сожжено калорий
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Среднее в неделю
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {progressData.frequencyData.length > 0
                    ? (
                        progressData.frequencyData.reduce(
                          (sum, d) => sum + d.count,
                          0
                        ) / progressData.frequencyData.length
                      ).toFixed(1)
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  тренировок в неделю
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <VolumeChart
              data={progressData.volumeData}
              title="Сожжённые калории по неделям"
            />
            <FrequencyChart
              data={progressData.frequencyData}
              title="Частота тренировок"
            />
          </div>

          <TypeDistribution
            data={progressData.typeData}
            title="Распределение по типам тренировок"
          />

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Прогресс по упражнению</CardTitle>
                <Select value={exerciseId} onValueChange={setExerciseId}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Выберите упражнение" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {exerciseId && progressData.exerciseProgress.length > 0 ? (
                <div className="h-[300px]">
                  <ProgressChart
                    data={progressData.exerciseProgress}
                    exerciseName={selectedExercise?.name}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  {exerciseId
                    ? "Нет данных для выбранного упражнения"
                    : "Выберите упражнение для просмотра прогресса"}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              Не удалось загрузить данные прогресса
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
