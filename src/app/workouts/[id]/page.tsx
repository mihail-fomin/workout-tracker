import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime, formatDuration } from "@/lib/utils";
import { WORKOUT_TYPE_LABELS, WORKOUT_TYPE_COLORS } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, ArrowLeft, Clock, Flame, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteWorkoutButton } from "./DeleteWorkoutButton";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getWorkout(id: string) {
  return prisma.workout.findUnique({
    where: { id },
    include: {
      sets: {
        include: {
          exercise: true,
        },
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
      },
    },
  });
}

export default async function WorkoutPage({ params }: PageProps) {
  const { id } = await params;
  const workout = await getWorkout(id);

  if (!workout) {
    notFound();
  }

  const duration = workout.endTime
    ? Math.floor(
        (new Date(workout.endTime).getTime() -
          new Date(workout.startTime).getTime()) /
          1000
      )
    : 0;

  const calories = workout.calories ?? 0;

  const groupedSets = workout.sets.reduce(
    (acc, set) => {
      if (!acc[set.exerciseId]) {
        acc[set.exerciseId] = {
          exercise: set.exercise,
          sets: [],
        };
      }
      acc[set.exerciseId].sets.push(set);
      return acc;
    },
    {} as Record<string, { exercise: typeof workout.sets[0]["exercise"]; sets: typeof workout.sets }>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/workouts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {WORKOUT_TYPE_LABELS[workout.type]}
          </h1>
          <p className="text-muted-foreground">
            {formatDate(workout.date)} в {formatTime(workout.startTime)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/workouts/${workout.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          </Link>
          <DeleteWorkoutButton workoutId={workout.id} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Badge
                className={cn("text-white", WORKOUT_TYPE_COLORS[workout.type])}
              >
                {WORKOUT_TYPE_LABELS[workout.type]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Тип тренировки</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{workout.sets.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Всего подходов</p>
          </CardContent>
        </Card>

        {duration > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {formatDuration(duration)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Длительность</p>
            </CardContent>
          </Card>
        )}

        {(calories > 0 || workout.calories != null) && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  {(workout.calories ?? 0).toLocaleString()} ккал
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Сожжено калорий</p>
            </CardContent>
          </Card>
        )}
      </div>

      {workout.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Заметки</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{workout.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Упражнения</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedSets).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Нет записанных упражнений
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSets).map(([, { exercise, sets }]) => (
                <div key={exercise.id}>
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      href={`/exercises/${exercise.id}`}
                      className="font-medium hover:underline"
                    >
                      {exercise.name}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {sets.length} подходов
                    </span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Повторения</TableHead>
                        <TableHead>Вес</TableHead>
                        <TableHead>Время</TableHead>
                        <TableHead>Дистанция</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sets.map((set) => (
                        <TableRow key={set.id}>
                          <TableCell className="font-medium">
                            {set.setNumber}
                          </TableCell>
                          <TableCell>
                            {set.reps ? `${set.reps} раз` : "—"}
                          </TableCell>
                          <TableCell>
                            {set.weight ? `${set.weight} кг` : "—"}
                          </TableCell>
                          <TableCell>
                            {set.duration ? formatDuration(set.duration) : "—"}
                          </TableCell>
                          <TableCell>
                            {set.distance ? `${set.distance} м` : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
