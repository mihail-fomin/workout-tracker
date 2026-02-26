-- CreateEnum
CREATE TYPE "PrimaryMuscleGroup" AS ENUM ('CHEST', 'LEGS', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'ABS_HYPEREXTENSION', 'CARDIO', 'FLEXIBILITY');

-- AlterTable: Add primaryMuscleGroup column (nullable for migration)
ALTER TABLE "Exercise" ADD COLUMN "primaryMuscleGroup" "PrimaryMuscleGroup";

-- Migrate existing data: STRENGTH -> map from muscleGroups, CARDIO -> CARDIO, FLEXIBILITY -> FLEXIBILITY
UPDATE "Exercise"
SET "primaryMuscleGroup" = CASE
  WHEN "type" = 'CARDIO' THEN 'CARDIO'::"PrimaryMuscleGroup"
  WHEN "type" = 'FLEXIBILITY' THEN 'FLEXIBILITY'::"PrimaryMuscleGroup"
  WHEN "type" = 'STRENGTH' THEN (
    CASE
      -- LEGS: check бицепс бедра first (before бицепс)
      WHEN EXISTS (
        SELECT 1 FROM unnest("muscleGroups") AS mg
        WHERE lower(mg) LIKE '%бицепс бедра%' OR lower(mg) = 'ноги' OR lower(mg) LIKE '%квадрицепс%'
          OR lower(mg) LIKE '%ягодицы%' OR lower(mg) LIKE '%икры%'
      ) THEN 'LEGS'::"PrimaryMuscleGroup"
      -- BACK
      WHEN EXISTS (
        SELECT 1 FROM unnest("muscleGroups") AS mg
        WHERE lower(mg) LIKE '%спина%' OR lower(mg) LIKE '%широчайшие%' OR lower(mg) LIKE '%ромбовидные%'
      ) THEN 'BACK'::"PrimaryMuscleGroup"
      -- CHEST
      WHEN EXISTS (
        SELECT 1 FROM unnest("muscleGroups") AS mg
        WHERE lower(mg) LIKE '%грудь%'
      ) THEN 'CHEST'::"PrimaryMuscleGroup"
      -- SHOULDERS
      WHEN EXISTS (
        SELECT 1 FROM unnest("muscleGroups") AS mg
        WHERE lower(mg) LIKE '%плечи%' OR lower(mg) LIKE '%дельты%' OR lower(mg) LIKE '%трапеции%'
      ) THEN 'SHOULDERS'::"PrimaryMuscleGroup"
      -- BICEPS (arm, not leg)
      WHEN EXISTS (
        SELECT 1 FROM unnest("muscleGroups") AS mg
        WHERE lower(mg) LIKE '%бицепс%'
      ) THEN 'BICEPS'::"PrimaryMuscleGroup"
      -- TRICEPS
      WHEN EXISTS (
        SELECT 1 FROM unnest("muscleGroups") AS mg
        WHERE lower(mg) LIKE '%трицепс%'
      ) THEN 'TRICEPS'::"PrimaryMuscleGroup"
      -- ABS_HYPEREXTENSION
      WHEN EXISTS (
        SELECT 1 FROM unnest("muscleGroups") AS mg
        WHERE lower(mg) LIKE '%пресс%' OR lower(mg) LIKE '%кор%'
      ) THEN 'ABS_HYPEREXTENSION'::"PrimaryMuscleGroup"
      ELSE 'CHEST'::"PrimaryMuscleGroup"
    END
  )
  ELSE 'CHEST'::"PrimaryMuscleGroup"
END;

-- Set default for any remaining NULLs
UPDATE "Exercise" SET "primaryMuscleGroup" = 'CHEST'::"PrimaryMuscleGroup" WHERE "primaryMuscleGroup" IS NULL;

-- Make column NOT NULL
ALTER TABLE "Exercise" ALTER COLUMN "primaryMuscleGroup" SET NOT NULL;
ALTER TABLE "Exercise" ALTER COLUMN "primaryMuscleGroup" SET DEFAULT 'CHEST';

-- Drop type column
ALTER TABLE "Exercise" DROP COLUMN "type";

-- DropEnum
DROP TYPE "ExerciseType";

-- CreateIndex
CREATE INDEX "Exercise_primaryMuscleGroup_idx" ON "Exercise"("primaryMuscleGroup");
