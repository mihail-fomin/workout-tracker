import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchWorkouts,
  mapSamsungWorkoutType,
  refreshAccessToken,
  isTokenExpired,
} from "@/lib/samsung-health";
import { WorkoutSource } from "@prisma/client";
import { subDays } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const days = body.days || 7;

    const tokenRecord = await prisma.samsungHealthToken.findFirst();

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Samsung Health not connected" },
        { status: 401 }
      );
    }

    let accessToken = tokenRecord.accessToken;

    if (isTokenExpired(tokenRecord.expiresAt)) {
      try {
        const newTokens = await refreshAccessToken(tokenRecord.refreshToken);
        accessToken = newTokens.accessToken;

        await prisma.samsungHealthToken.update({
          where: { id: tokenRecord.id },
          data: {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            expiresAt: new Date(Date.now() + newTokens.expiresIn * 1000),
          },
        });
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        return NextResponse.json(
          { error: "Token expired, please reconnect" },
          { status: 401 }
        );
      }
    }

    const fromDate = subDays(new Date(), days);
    const samsungWorkouts = await fetchWorkouts(accessToken, fromDate);

    let imported = 0;
    let skipped = 0;
    let updated = 0;

    for (const sWorkout of samsungWorkouts) {
      const existingWorkout = await prisma.workout.findUnique({
        where: { externalId: sWorkout.id },
      });

      const workoutData = {
        date: new Date(sWorkout.startTime),
        startTime: new Date(sWorkout.startTime),
        endTime: new Date(sWorkout.endTime),
        type: mapSamsungWorkoutType(sWorkout.type),
        source: WorkoutSource.SAMSUNG_HEALTH,
        externalId: sWorkout.id,
        calories: sWorkout.calories,
        avgHeartRate: sWorkout.heartRate?.average,
      };

      if (existingWorkout) {
        await prisma.workout.update({
          where: { id: existingWorkout.id },
          data: workoutData,
        });
        updated++;
      } else {
        await prisma.workout.create({
          data: workoutData,
        });
        imported++;
      }
    }

    await prisma.samsungHealthToken.update({
      where: { id: tokenRecord.id },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      imported,
      updated,
      skipped,
      total: samsungWorkouts.length,
    });
  } catch (error) {
    console.error("Error syncing Samsung Health:", error);
    return NextResponse.json(
      { error: "Failed to sync workouts" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tokenRecord = await prisma.samsungHealthToken.findFirst();

    if (!tokenRecord) {
      return NextResponse.json({
        connected: false,
        lastSyncAt: null,
      });
    }

    return NextResponse.json({
      connected: true,
      lastSyncAt: tokenRecord.lastSyncAt,
      expiresAt: tokenRecord.expiresAt,
      isExpired: isTokenExpired(tokenRecord.expiresAt),
    });
  } catch (error) {
    console.error("Error getting sync status:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.samsungHealthToken.deleteMany();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting Samsung Health:", error);
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 }
    );
  }
}
