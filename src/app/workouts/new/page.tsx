"use client";

import { useState, useEffect } from "react";
import { WorkoutForm } from "@/components/workout/WorkoutForm";
import { Exercise } from "@/types";
import { Loader2 } from "lucide-react";

export default function NewWorkoutPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exercises")
      .then((r) => r.json())
      .then((data) => setExercises(Array.isArray(data) ? data : []))
      .catch(() => setExercises([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Новая тренировка</h1>
        <p className="text-muted-foreground">
          Создайте запись о вашей тренировке
        </p>
      </div>

      <WorkoutForm exercises={exercises} />
    </div>
  );
}
