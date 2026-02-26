"use client";

import Link from "next/link";
import { Exercise, PRIMARY_MUSCLE_GROUP_LABELS } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
  usageCount?: number;
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

export function ExerciseCard({ exercise, usageCount }: ExerciseCardProps) {
  return (
    <Link href={`/exercises/${exercise.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start gap-2">
            <CardTitle className="text-base line-clamp-2 min-w-0 flex-1">
              {exercise.name}
            </CardTitle>
            <Badge
              variant="secondary"
              className={cn("text-white shrink-0", MUSCLE_GROUP_COLORS[exercise.primaryMuscleGroup] || "bg-gray-500")}
            >
              {PRIMARY_MUSCLE_GROUP_LABELS[exercise.primaryMuscleGroup]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {exercise.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {exercise.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1">
            {exercise.muscleGroups.slice(0, 3).map((group) => (
              <Badge key={group} variant="outline" className="text-xs">
                {group}
              </Badge>
            ))}
            {exercise.muscleGroups.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{exercise.muscleGroups.length - 3}
              </Badge>
            )}
          </div>

          {usageCount !== undefined && (
            <p className="text-xs text-muted-foreground mt-3">
              Выполнено: {usageCount} раз
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
