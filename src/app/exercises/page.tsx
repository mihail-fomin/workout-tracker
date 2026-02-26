"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExerciseCard } from "@/components/exercise/ExerciseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, BookOpen, Loader2 } from "lucide-react";
import { Exercise, PRIMARY_MUSCLE_GROUP_LABELS, MUSCLE_GROUPS } from "@/types";

type ExerciseWithCount = Exercise & { _count: { workoutCount: number } };

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [primaryMuscleGroupFilter, setPrimaryMuscleGroupFilter] = useState<string>("all");
  const [muscleFilter, setMuscleFilter] = useState<string>("all");

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (primaryMuscleGroupFilter !== "all") params.set("primaryMuscleGroup", primaryMuscleGroupFilter);
      if (muscleFilter !== "all") params.set("muscleGroup", muscleFilter);

      const response = await fetch(`/api/exercises?${params}`);
      const data = await response.json();
      setExercises(response.ok && Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  }, [primaryMuscleGroupFilter, muscleFilter]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const filteredExercises = Array.isArray(exercises)
    ? exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(search.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(search.toLowerCase()) ||
        exercise.muscleGroups.some((g) =>
          g.toLowerCase().includes(search.toLowerCase())
        )
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Библиотека упражнений</h1>
          <p className="text-muted-foreground">
            {exercises.length} упражнений в базе
          </p>
        </div>
        <Link href="/exercises/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Добавить упражнение
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или мышечной группе..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={primaryMuscleGroupFilter} onValueChange={setPrimaryMuscleGroupFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Группа мышц" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все группы</SelectItem>
                {Object.entries(PRIMARY_MUSCLE_GROUP_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={muscleFilter} onValueChange={setMuscleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Мышечная группа" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все мышцы</SelectItem>
                {MUSCLE_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setPrimaryMuscleGroupFilter("all");
                setMuscleFilter("all");
              }}
            >
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredExercises.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Упражнения не найдены
            </p>
            <Link href="/exercises/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить упражнение
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              usageCount={exercise._count.workoutCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
