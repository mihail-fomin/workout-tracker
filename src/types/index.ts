import {
  Exercise,
  Workout,
  WorkoutSet,
  PrimaryMuscleGroup,
  WorkoutType,
  WorkoutSource,
} from "@prisma/client";

export type { Exercise, Workout, WorkoutSet };
export { PrimaryMuscleGroup, WorkoutType, WorkoutSource };

export type WorkoutWithSets = Workout & {
  sets: (WorkoutSet & {
    exercise: Exercise;
  })[];
};

export type ExerciseWithSets = Exercise & {
  sets: WorkoutSet[];
};

export type WorkoutFormData = {
  date: Date;
  startTime: Date;
  endTime?: Date;
  type: WorkoutType;
  notes?: string;
  sets: SetFormData[];
};

export type SetFormData = {
  exerciseId: string;
  setNumber: number;
  reps?: number;
  calories?: number;
  duration?: number;
  distance?: number;
  notes?: string;
};

export type ExerciseFormData = {
  name: string;
  description?: string;
  muscleGroups: string[];
  primaryMuscleGroup: PrimaryMuscleGroup;
};

export type WorkoutStats = {
  totalWorkouts: number;
  totalVolume: number;
  totalDuration: number;
  avgHeartRate?: number;
  workoutsByType: Record<WorkoutType, number>;
};

export type ProgressData = {
  date: string;
  value: number;
  label?: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: WorkoutType;
  resource?: Workout;
};

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  STRENGTH: "Силовая",
  CARDIO: "Кардио",
  STRETCHING: "Растяжка",
  MIXED: "Смешанная",
};

export const PRIMARY_MUSCLE_GROUP_LABELS: Record<PrimaryMuscleGroup, string> = {
  CHEST: "Грудные",
  LEGS: "Ноги",
  BACK: "Спина",
  SHOULDERS: "Плечи",
  BICEPS: "Бицепс",
  TRICEPS: "Трицепс",
  ABS_HYPEREXTENSION: "Пресс/гиперэкстензия",
  CARDIO: "Кардио",
  FLEXIBILITY: "Растяжка",
};

export const PRIMARY_MUSCLE_GROUPS = [
  "CHEST", "LEGS", "BACK", "SHOULDERS", "BICEPS",
  "TRICEPS", "ABS_HYPEREXTENSION", "CARDIO", "FLEXIBILITY",
] as const;

export type PrimaryMuscleGroupType = (typeof PRIMARY_MUSCLE_GROUPS)[number];

export const WORKOUT_TYPE_COLORS: Record<WorkoutType, string> = {
  STRENGTH: "bg-blue-500",
  CARDIO: "bg-red-500",
  STRETCHING: "bg-green-500",
  MIXED: "bg-purple-500",
};

export const MUSCLE_GROUPS = [
  "грудь",
  "спина",
  "широчайшие",
  "ромбовидные",
  "трапеции",
  "плечи",
  "передние дельты",
  "средние дельты",
  "задние дельты",
  "бицепс",
  "трицепс",
  "предплечья",
  "квадрицепс",
  "бицепс бедра",
  "ягодицы",
  "икры",
  "пресс",
  "кор",
  "ноги",
  "руки",
  "сердце",
  "всё тело",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
