import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrimaryMuscleGroup } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const primaryMuscleGroup = searchParams.get("primaryMuscleGroup") as PrimaryMuscleGroup | null;
    const search = searchParams.get("search");
    const muscleGroup = searchParams.get("muscleGroup");
    const isCustom = searchParams.get("isCustom");

    const where: Record<string, unknown> = {};

    if (primaryMuscleGroup) {
      where.primaryMuscleGroup = primaryMuscleGroup;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (muscleGroup) {
      where.muscleGroups = { has: muscleGroup };
    }

    if (isCustom !== null) {
      where.isCustom = isCustom === "true";
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { sets: true } },
      },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, muscleGroups, primaryMuscleGroup, isCustom } = body;

    const exercise = await prisma.exercise.create({
      data: {
        name,
        description,
        muscleGroups,
        primaryMuscleGroup: (primaryMuscleGroup as PrimaryMuscleGroup) || "CHEST",
        isCustom: isCustom ?? true,
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error("Error creating exercise:", error);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
