import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { WorkoutType } from "@prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const workout = await prisma.workout.findUnique({
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

    if (!workout) {
      return NextResponse.json(
        { error: "Workout not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error fetching workout:", error);
    return NextResponse.json(
      { error: "Failed to fetch workout" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { date, startTime, endTime, type, notes, calories, sets } = body;

    await prisma.workoutSet.deleteMany({
      where: { workoutId: id },
    });

    const workout = await prisma.workout.update({
      where: { id },
      data: {
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        type: type as WorkoutType,
        notes,
        calories: calories ?? undefined,
        sets: {
          create: sets?.map((set: {
            exerciseId: string;
            setNumber: number;
            reps?: number;
            weight?: number;
            duration?: number;
            distance?: number;
            notes?: string;
          }) => ({
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            reps: set.reps,
            weight: set.weight,
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

    return NextResponse.json(workout);
  } catch (error) {
    console.error("Error updating workout:", error);
    return NextResponse.json(
      { error: "Failed to update workout" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.workout.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return NextResponse.json(
      { error: "Failed to delete workout" },
      { status: 500 }
    );
  }
}
