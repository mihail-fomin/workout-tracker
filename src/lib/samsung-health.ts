import { WorkoutType } from "@prisma/client";

const SAMSUNG_HEALTH_AUTH_URL = "https://account.samsung.com/accounts/v1/DCXGW/signInGate";
const SAMSUNG_HEALTH_TOKEN_URL = "https://account.samsung.com/accounts/v1/DCXGW/token";
const SAMSUNG_HEALTH_API_URL = "https://api.shealth.samsung.com/v1";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SamsungWorkout {
  id: string;
  type: string;
  startTime: string;
  endTime: string;
  duration: number;
  calories?: number;
  distance?: number;
  heartRate?: {
    average?: number;
    max?: number;
    min?: number;
  };
}

export function initiateOAuth(): string {
  const clientId = process.env.SAMSUNG_HEALTH_CLIENT_ID;
  const redirectUri = process.env.SAMSUNG_HEALTH_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Samsung Health credentials not configured");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "shealth.exercise.read shealth.activity.read",
    state: generateState(),
  });

  return `${SAMSUNG_HEALTH_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenPair> {
  const clientId = process.env.SAMSUNG_HEALTH_CLIENT_ID;
  const clientSecret = process.env.SAMSUNG_HEALTH_CLIENT_SECRET;
  const redirectUri = process.env.SAMSUNG_HEALTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Samsung Health credentials not configured");
  }

  const response = await fetch(SAMSUNG_HEALTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  const clientId = process.env.SAMSUNG_HEALTH_CLIENT_ID;
  const clientSecret = process.env.SAMSUNG_HEALTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Samsung Health credentials not configured");
  }

  const response = await fetch(SAMSUNG_HEALTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
  };
}

export async function fetchWorkouts(
  accessToken: string,
  fromDate: Date,
  toDate: Date = new Date()
): Promise<SamsungWorkout[]> {
  const params = new URLSearchParams({
    start_time: fromDate.toISOString(),
    end_time: toDate.toISOString(),
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const response = await fetch(
    `${SAMSUNG_HEALTH_API_URL}/exercise?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Token expired");
    }
    const error = await response.text();
    throw new Error(`Failed to fetch workouts: ${error}`);
  }

  const data = await response.json();

  return (data.exercises || []).map((exercise: Record<string, unknown>) => ({
    id: exercise.id as string,
    type: exercise.exercise_type as string,
    startTime: exercise.start_time as string,
    endTime: exercise.end_time as string,
    duration: exercise.duration as number,
    calories: exercise.calorie as number | undefined,
    distance: exercise.distance as number | undefined,
    heartRate: exercise.heart_rate
      ? {
          average: (exercise.heart_rate as Record<string, number>).average,
          max: (exercise.heart_rate as Record<string, number>).max,
          min: (exercise.heart_rate as Record<string, number>).min,
        }
      : undefined,
  }));
}

export function mapSamsungWorkoutType(samsungType: string): WorkoutType {
  const typeMapping: Record<string, WorkoutType> = {
    RUNNING: WorkoutType.CARDIO,
    WALKING: WorkoutType.CARDIO,
    CYCLING: WorkoutType.CARDIO,
    SWIMMING: WorkoutType.CARDIO,
    HIKING: WorkoutType.CARDIO,
    ELLIPTICAL: WorkoutType.CARDIO,
    ROWING: WorkoutType.CARDIO,
    STAIR_CLIMBING: WorkoutType.CARDIO,
    JUMP_ROPE: WorkoutType.CARDIO,
    AEROBICS: WorkoutType.CARDIO,
    DANCING: WorkoutType.CARDIO,
    WEIGHT_TRAINING: WorkoutType.STRENGTH,
    STRENGTH_TRAINING: WorkoutType.STRENGTH,
    CIRCUIT_TRAINING: WorkoutType.STRENGTH,
    CALISTHENICS: WorkoutType.STRENGTH,
    YOGA: WorkoutType.STRETCHING,
    PILATES: WorkoutType.STRETCHING,
    STRETCHING: WorkoutType.STRETCHING,
    FLEXIBILITY: WorkoutType.STRETCHING,
  };

  const normalizedType = samsungType.toUpperCase().replace(/\s+/g, "_");
  return typeMapping[normalizedType] || WorkoutType.MIXED;
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function isTokenExpired(expiresAt: Date): boolean {
  const buffer = 5 * 60 * 1000;
  return new Date().getTime() > expiresAt.getTime() - buffer;
}
