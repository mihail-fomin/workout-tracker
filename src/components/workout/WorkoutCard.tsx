"use client";

import Link from "next/link";
import { formatDate, formatTime, formatDuration, calculateVolume } from "@/lib/utils";
import {
  WorkoutWithSets,
  WORKOUT_TYPE_LABELS,
  WORKOUT_TYPE_COLORS,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, Dumbbell, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutCardProps {
  workout: WorkoutWithSets;
  compact?: boolean;
}

export function WorkoutCard({ workout, compact = false }: WorkoutCardProps) {
  const duration = workout.endTime
    ? Math.floor(
        (new Date(workout.endTime).getTime() -
          new Date(workout.startTime).getTime()) /
          1000
      )
    : 0;

  const volume = calculateVolume(workout.sets);
  const exerciseCount = new Set(workout.sets.map((s) => s.exerciseId)).size;

  if (compact) {
    return (
      <Link href={`/workouts/${workout.id}`}>
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-2 h-10 rounded-full",
                    WORKOUT_TYPE_COLORS[workout.type]
                  )}
                />
                <div>
                  <p className="font-medium">
                    {WORKOUT_TYPE_LABELS[workout.type]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(workout.date)}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{exerciseCount} упр.</p>
                {duration > 0 && <p>{formatDuration(duration)}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/workouts/${workout.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {WORKOUT_TYPE_LABELS[workout.type]}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatDate(workout.date)} в {formatTime(workout.startTime)}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-white",
                WORKOUT_TYPE_COLORS[workout.type]
              )}
            >
              {WORKOUT_TYPE_LABELS[workout.type]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{exerciseCount}</p>
                <p className="text-xs text-muted-foreground">упражнений</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{workout.sets.length}</p>
                <p className="text-xs text-muted-foreground">подходов</p>
              </div>
            </div>

            {duration > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{formatDuration(duration)}</p>
                  <p className="text-xs text-muted-foreground">длительность</p>
                </div>
              </div>
            )}

            {volume > 0 && (
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{volume.toLocaleString()} кг</p>
                  <p className="text-xs text-muted-foreground">объём</p>
                </div>
              </div>
            )}
          </div>

          {workout.notes && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {workout.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
