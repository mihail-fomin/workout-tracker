"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkoutType, Exercise, WORKOUT_TYPE_LABELS } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SetInput } from "./SetInput";
import { ExerciseSelector } from "@/components/exercise/ExerciseSelector";
import { Plus, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SetData {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
}

interface WorkoutFormProps {
  exercises: Exercise[];
  initialData?: {
    id?: string;
    date: string;
    startTime: string;
    endTime?: string;
    type: WorkoutType;
    notes?: string;
    calories?: number;
    sets: SetData[];
  };
}

export function WorkoutForm({ exercises, initialData }: WorkoutFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split("T")[0],
    startTime:
      initialData?.startTime ||
      new Date().toTimeString().slice(0, 5),
    endTime: initialData?.endTime || "",
    type: initialData?.type || WorkoutType.STRENGTH,
    notes: initialData?.notes || "",
    calories: initialData?.calories ?? undefined,
  });

  const [sets, setSets] = useState<SetData[]>(initialData?.sets || []);

  const handleAddExercise = (exercise: Exercise) => {
    const existingSets = sets.filter((s) => s.exerciseId === exercise.id);
    const newSetNumber = existingSets.length + 1;

    setSets([
      ...sets,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        setNumber: newSetNumber,
        reps: undefined,
        weight: undefined,
      },
    ]);
    setShowExerciseSelector(false);
  };

  const handleAddSet = (exerciseId: string, exerciseName: string) => {
    const existingSets = sets.filter((s) => s.exerciseId === exerciseId);
    const newSetNumber = existingSets.length + 1;

    setSets([
      ...sets,
      {
        exerciseId,
        exerciseName,
        setNumber: newSetNumber,
        reps: undefined,
        weight: undefined,
      },
    ]);
  };

  const handleUpdateSet = (index: number, data: Partial<SetData>) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], ...data };
    setSets(newSets);
  };

  const handleRemoveSet = (index: number) => {
    const removedSet = sets[index];
    const newSets = sets.filter((_, i) => i !== index);
    
    const updatedSets = newSets.map((set) => {
      if (set.exerciseId === removedSet.exerciseId && set.setNumber > removedSet.setNumber) {
        return { ...set, setNumber: set.setNumber - 1 };
      }
      return set;
    });
    
    setSets(updatedSets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        date: new Date(formData.date).toISOString(),
        startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
        endTime: formData.endTime
          ? new Date(`${formData.date}T${formData.endTime}`).toISOString()
          : null,
        type: formData.type,
        notes: formData.notes || null,
        calories: formData.calories ?? null,
        sets: sets.map((set) => ({
          exerciseId: set.exerciseId,
          setNumber: set.setNumber,
          reps: set.reps || null,
          weight: set.weight || null,
          duration: set.duration || null,
          distance: set.distance || null,
          notes: set.notes || null,
        })),
      };

      const url = initialData?.id
        ? `/api/workouts/${initialData.id}`
        : "/api/workouts";
      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Ошибка сохранения");
      }

      toast.success(
        initialData?.id ? "Тренировка обновлена" : "Тренировка создана"
      );
      router.push("/workouts");
      router.refresh();
    } catch {
      toast.error("Не удалось сохранить тренировку");
    } finally {
      setIsLoading(false);
    }
  };

  const groupedSets = sets.reduce((acc, set, index) => {
    if (!acc[set.exerciseId]) {
      acc[set.exerciseId] = {
        exerciseName: set.exerciseName,
        sets: [],
      };
    }
    acc[set.exerciseId].sets.push({ ...set, originalIndex: index });
    return acc;
  }, {} as Record<string, { exerciseName: string; sets: (SetData & { originalIndex: number })[] }>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Тип тренировки</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as WorkoutType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WORKOUT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Время начала</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Время окончания</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>
          </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Калории (сожжено за тренировку)</Label>
              <Input
                id="calories"
                type="number"
                placeholder="Введите количество ккал"
                value={formData.calories ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calories: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Как прошла тренировка..."
                rows={3}
              />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Упражнения</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowExerciseSelector(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить упражнение
          </Button>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedSets).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Добавьте упражнения для тренировки
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSets).map(([exerciseId, { exerciseName, sets: exerciseSets }]) => (
                <div key={exerciseId} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{exerciseName}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddSet(exerciseId, exerciseName)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Подход
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {exerciseSets.map((set) => (
                      <SetInput
                        key={set.originalIndex}
                        setNumber={set.setNumber}
                        reps={set.reps}
                        weight={set.weight}
                        duration={set.duration}
                        distance={set.distance}
                        onChange={(data) => handleUpdateSet(set.originalIndex, data)}
                        onRemove={() => handleRemoveSet(set.originalIndex)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </>
          )}
        </Button>
      </div>

      {showExerciseSelector && (
        <ExerciseSelector
          exercises={exercises}
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}
    </form>
  );
}
