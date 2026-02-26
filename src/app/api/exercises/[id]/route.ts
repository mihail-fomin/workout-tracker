import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrimaryMuscleGroup } from "@prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        sets: {
          include: {
            workout: true,
          },
          orderBy: {
            workout: { date: "desc" },
          },
          take: 50,
        },
        _count: {
          select: { sets: true },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercise" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, description, muscleGroups, primaryMuscleGroup } = body;

    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        name,
        description,
        muscleGroups,
        primaryMuscleGroup: (primaryMuscleGroup as PrimaryMuscleGroup) || "CHEST",
      },
    });

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json(
      { error: "Failed to update exercise" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params;
    const id = decodeURIComponent(rawId);

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    await prisma.exercise.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json(
      { error: "Failed to delete exercise" },
      { status: 500 }
    );
  }
}
