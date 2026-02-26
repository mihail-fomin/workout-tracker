import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PRIMARY_MUSCLE_GROUP_LABELS } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, Activity, TrendingUp } from "lucide-react";
import { DeleteExerciseButton } from "./DeleteExerciseButton";
import { ProgressChart } from "@/components/charts/ProgressChart";
import { format } from "date-fns";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getExercise(id: string) {
  return prisma.exercise.findUnique({
    where: { id },
    include: {
      sets: {
        include: {
          workout: true,
        },
        orderBy: {
          workout: { date: "desc" },
        },
        take: 100,
      },
      _count: {
        select: { sets: true },
      },
    },
  });
}

export default async function ExercisePage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const exercise = await getExercise(id);

  if (!exercise) {
    notFound();
  }

  const progressByDate: Record<
    string,
    { maxWeight: number; maxReps: number; volume: number }
  > = {};

  exercise.sets.forEach((set) => {
    const dateKey = format(new Date(set.workout.date), "dd.MM");
    if (!progressByDate[dateKey]) {
      progressByDate[dateKey] = { maxWeight: 0, maxReps: 0, volume: 0 };
    }

    const weight = set.weight ?? 0;
    const reps = set.reps ?? 0;
    const calories = set.calories ?? 0;

    if (weight > progressByDate[dateKey].maxWeight) {
      progressByDate[dateKey].maxWeight = weight;
    }
    if (reps > progressByDate[dateKey].maxReps) {
      progressByDate[dateKey].maxReps = reps;
    }
    progressByDate[dateKey].volume += calories;
  });

  const progressData = Object.entries(progressByDate)
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .reverse();

  const recentWorkouts = exercise.sets.reduce(
    (acc, set) => {
      if (!acc.find((w) => w.id === set.workout.id)) {
        acc.push(set.workout);
      }
      return acc;
    },
    [] as typeof exercise.sets[0]["workout"][]
  ).slice(0, 10);

  const maxWeight = Math.max(
    ...exercise.sets.map((s) => s.weight ?? 0),
    0
  );
  const maxReps = Math.max(...exercise.sets.map((s) => s.reps ?? 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/exercises">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{exercise.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">
              {PRIMARY_MUSCLE_GROUP_LABELS[exercise.primaryMuscleGroup]}
            </Badge>
            {exercise.isCustom && (
              <Badge variant="outline">Пользовательское</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {exercise.isCustom && (
            <Link href={`/exercises/${encodeURIComponent(exercise.id)}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
            </Link>
          )}
          <DeleteExerciseButton
            exerciseId={exercise.id}
            exerciseName={exercise.name}
          />
        </div>
      </div>

      {exercise.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Описание</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{exercise.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{exercise._count.sets}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Всего подходов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{maxWeight} кг</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Максимальный вес
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{maxReps}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Макс. повторений
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
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
            <p className="text-xs text-muted-foreground mt-2">
              Мышечные группы
            </p>
          </CardContent>
        </Card>
      </div>

      {progressData.length > 0 && (
        <ProgressChart
          data={progressData}
          title="Прогресс"
          exerciseName={exercise.name}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>История использования</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWorkouts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Упражнение ещё не использовалось
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Тип тренировки</TableHead>
                  <TableHead className="text-right">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentWorkouts.map((workout) => (
                  <TableRow key={workout.id}>
                    <TableCell>{formatDate(workout.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{workout.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/workouts/${workout.id}`}>
                        <Button variant="ghost" size="sm">
                          Открыть
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
