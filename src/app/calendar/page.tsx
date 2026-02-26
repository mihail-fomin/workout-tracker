import { prisma } from "@/lib/prisma";
import { WorkoutCalendar } from "@/components/calendar/WorkoutCalendar";
import { CalendarEvent, WORKOUT_TYPE_LABELS } from "@/types";

async function getWorkouts() {
  return prisma.workout.findMany({
    orderBy: { date: "desc" },
    include: {
      sets: {
        include: {
          exercise: true,
        },
      },
    },
  });
}

export default async function CalendarPage() {
  const workouts = await getWorkouts();

  const events: CalendarEvent[] = workouts.map((workout) => ({
    id: workout.id,
    title: WORKOUT_TYPE_LABELS[workout.type],
    start: new Date(workout.startTime),
    end: workout.endTime
      ? new Date(workout.endTime)
      : new Date(new Date(workout.startTime).getTime() + 60 * 60 * 1000),
    type: workout.type,
    resource: workout,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Календарь тренировок</h1>
        <p className="text-muted-foreground">
          Визуализация ваших тренировок по датам
        </p>
      </div>

      <WorkoutCalendar events={events} />
    </div>
  );
}
