import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subMonths, startOfWeek, format } from "date-fns";
import { WorkoutType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "3"; // months
    const exerciseId = searchParams.get("exerciseId");

    const months = parseInt(period);
    const startDate = subMonths(new Date(), months);

    const workouts = await prisma.workout.findMany({
      where: {
        date: { gte: startDate },
      },
      include: {
        sets: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const volumeByWeek: Record<string, number> = {};
    const frequencyByWeek: Record<string, number> = {};
    const typeDistribution: Record<WorkoutType, number> = {
      STRENGTH: 0,
      CARDIO: 0,
      STRETCHING: 0,
      MIXED: 0,
    };

    workouts.forEach((workout) => {
      const weekStart = startOfWeek(new Date(workout.date), { weekStartsOn: 1 });
      const weekKey = format(weekStart, "dd.MM");

      frequencyByWeek[weekKey] = (frequencyByWeek[weekKey] || 0) + 1;

      typeDistribution[workout.type]++;

      const volume = workout.sets.reduce((sum, set) => {
        const reps = set.reps ?? 0;
        const weight = set.weight ?? 0;
        return sum + reps * weight;
      }, 0);
      volumeByWeek[weekKey] = (volumeByWeek[weekKey] || 0) + volume;
    });

    const volumeData = Object.entries(volumeByWeek).map(([date, volume]) => ({
      date,
      volume,
    }));

    const frequencyData = Object.entries(frequencyByWeek).map(
      ([label, count]) => ({
        label,
        count,
      })
    );

    const typeData = Object.entries(typeDistribution)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        type: type as WorkoutType,
        count,
      }));

    let exerciseProgress: {
      date: string;
      maxWeight?: number;
      maxReps?: number;
      volume?: number;
    }[] = [];

    if (exerciseId) {
      const exerciseSets = await prisma.workoutSet.findMany({
        where: {
          exerciseId,
          workout: {
            date: { gte: startDate },
          },
        },
        include: {
          workout: true,
        },
        orderBy: {
          workout: { date: "asc" },
        },
      });

      const progressByDate: Record<
        string,
        { maxWeight: number; maxReps: number; volume: number }
      > = {};

      exerciseSets.forEach((set) => {
        const dateKey = format(new Date(set.workout.date), "dd.MM");
        if (!progressByDate[dateKey]) {
          progressByDate[dateKey] = { maxWeight: 0, maxReps: 0, volume: 0 };
        }

        const weight = set.weight ?? 0;
        const reps = set.reps ?? 0;

        if (weight > progressByDate[dateKey].maxWeight) {
          progressByDate[dateKey].maxWeight = weight;
        }
        if (reps > progressByDate[dateKey].maxReps) {
          progressByDate[dateKey].maxReps = reps;
        }
        progressByDate[dateKey].volume += weight * reps;
      });

      exerciseProgress = Object.entries(progressByDate).map(
        ([date, data]) => ({
          date,
          ...data,
        })
      );
    }

    return NextResponse.json({
      volumeData,
      frequencyData,
      typeData,
      exerciseProgress,
      totalWorkouts: workouts.length,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
