import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WorkoutType, WorkoutSource } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") as WorkoutType | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = searchParams.get("limit");

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (from || to) {
      where.date = {};
      if (from) {
        (where.date as Record<string, Date>).gte = new Date(from);
      }
      if (to) {
        (where.date as Record<string, Date>).lte = new Date(to);
      }
    }

    const workouts = await prisma.workout.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit ? parseInt(limit) : undefined,
      include: {
        sets: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, type, notes, sets, source, externalId, calories, avgHeartRate } = body;

    const workout = await prisma.workout.create({
      data: {
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        type: type as WorkoutType,
        notes,
        source: source || WorkoutSource.MANUAL,
        externalId,
        calories,
        avgHeartRate,
        sets: {
          create: sets?.map((set: {
            exerciseId: string;
            setNumber: number;
            reps?: number;
            calories?: number;
            duration?: number;
            distance?: number;
            notes?: string;
          }) => ({
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            reps: set.reps,
            calories: set.calories,
            duration: set.duration,
            distance: set.distance,
            notes: set.notes,
          })) || [],
        },
      },
      include: {
        sets: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(workout, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    return NextResponse.json(
      { error: "Failed to create workout" },
      { status: 500 }
    );
  }
}
