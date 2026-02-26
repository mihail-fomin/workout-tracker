"use client";

import { useState } from "react";
import { Exercise, PRIMARY_MUSCLE_GROUP_LABELS } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseSelectorProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

const MUSCLE_GROUP_COLORS: Record<string, string> = {
  CHEST: "bg-pink-500",
  LEGS: "bg-amber-500",
  BACK: "bg-blue-500",
  SHOULDERS: "bg-indigo-500",
  BICEPS: "bg-green-500",
  TRICEPS: "bg-teal-500",
  ABS_HYPEREXTENSION: "bg-orange-500",
  CARDIO: "bg-red-500",
  FLEXIBILITY: "bg-purple-500",
};

export function ExerciseSelector({
  exercises,
  onSelect,
  onClose,
}: ExerciseSelectorProps) {
  const [search, setSearch] = useState("");
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>("all");

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(search.toLowerCase()) ||
      exercise.muscleGroups.some((g) =>
        g.toLowerCase().includes(search.toLowerCase())
      );
    const matchesMuscleGroup =
      muscleGroupFilter === "all" || exercise.primaryMuscleGroup === muscleGroupFilter;
    return matchesSearch && matchesMuscleGroup;
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Выберите упражнение</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или мышечной группе..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
            <SelectTrigger className="w-40">
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
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {filteredExercises.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Упражнения не найдены
            </p>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium">{exercise.name}</p>
                      {exercise.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {exercise.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exercise.muscleGroups.slice(0, 4).map((group) => (
                          <Badge
                            key={group}
                            variant="outline"
                            className="text-xs"
                          >
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-white shrink-0",
                        MUSCLE_GROUP_COLORS[exercise.primaryMuscleGroup] || "bg-gray-500"
                      )}
                    >
                      {PRIMARY_MUSCLE_GROUP_LABELS[exercise.primaryMuscleGroup]}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
