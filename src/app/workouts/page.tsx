"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
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
import { Plus, Search, Dumbbell, Loader2 } from "lucide-react";
import { WorkoutWithSets, WORKOUT_TYPE_LABELS } from "@/types";
import { parseFetchResponse } from "@/lib/api-utils";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<WorkoutWithSets[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchWorkouts();
  }, [typeFilter, dateFrom, dateTo]);

  const fetchWorkouts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const response = await fetch(`/api/workouts?${params}`);
      const data = await response.json();
      setWorkouts(parseFetchResponse<WorkoutWithSets>(response, data));
    } catch (error) {
      console.error("Error fetching workouts:", error);
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Журнал тренировок</h1>
          <p className="text-muted-foreground">
            Все ваши тренировки в одном месте
          </p>
        </div>
        <Link href="/workouts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Новая тренировка
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Тип тренировки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {Object.entries(WORKOUT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 flex-1">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="От"
                className="flex-1"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="До"
                className="flex-1"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setTypeFilter("all");
                setDateFrom("");
                setDateTo("");
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
      ) : workouts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Тренировки не найдены
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
          {workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      )}
    </div>
  );
}
