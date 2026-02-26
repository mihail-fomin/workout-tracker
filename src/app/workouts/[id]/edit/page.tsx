"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { Exercise, WorkoutType } from "@/types";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function EditWorkoutPage() {
  const params = useParams();
  const id = params.id as string;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [initialData, setInitialData] = useState<{
    id: string;
    date: string;
    startTime: string;
    endTime?: string;
    type: WorkoutType;
    notes?: string;
    calories?: number;
    sets: { id?: string; exerciseId: string; exerciseName: string; setNumber: number; reps?: number; weight?: number; duration?: number; distance?: number; notes?: string }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/workouts/${id}`).then((r) => r.json()),
      fetch("/api/exercises").then((r) => r.json()),
    ])
      .then(([workoutData, exercisesData]) => {
        if (workoutData?.error || !workoutData?.id) {
          setNotFoundState(true);
          return;
        }
        setExercises(Array.isArray(exercisesData) ? exercisesData : []);
        setInitialData({
          id: workoutData.id,
          date: format(new Date(workoutData.date), "yyyy-MM-dd"),
          startTime: format(new Date(workoutData.startTime), "HH:mm"),
          endTime: workoutData.endTime ? format(new Date(workoutData.endTime), "HH:mm") : undefined,
          type: workoutData.type as WorkoutType,
          notes: workoutData.notes || undefined,
          calories: workoutData.calories ?? undefined,
          sets: (workoutData.sets || []).map((set: { id?: string; exerciseId: string; exercise: { name: string }; setNumber: number; reps?: number; weight?: number; duration?: number; distance?: number; notes?: string }) => ({
            id: set.id,
            exerciseId: set.exerciseId,
            exerciseName: set.exercise?.name || "",
            setNumber: set.setNumber,
            reps: set.reps || undefined,
            weight: set.weight || undefined,
            duration: set.duration || undefined,
            distance: set.distance || undefined,
            notes: set.notes || undefined,
          })),
        });
      })
      .catch(() => setNotFoundState(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (notFoundState) {
    notFound();
  }

  if (isLoading || !initialData) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Редактирование тренировки</h1>
        <p className="text-muted-foreground">
          Измените данные о тренировке
        </p>
      </div>

      <WorkoutForm exercises={exercises} initialData={initialData} />
    </div>
  );
}
