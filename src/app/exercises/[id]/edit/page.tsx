import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ExerciseForm } from "@/components/exercise/ExerciseForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getExercise(id: string) {
  return prisma.exercise.findUnique({
    where: { id },
  });
}

export default async function EditExercisePage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const exercise = await getExercise(id);

  if (!exercise || !exercise.isCustom) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/exercises/${encodeURIComponent(exercise.id)}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Редактирование упражнения</h1>
        </div>
      </div>

      <ExerciseForm
        initialData={{
          id: exercise.id,
          name: exercise.name,
          description: exercise.description ?? undefined,
          muscleGroups: exercise.muscleGroups,
          primaryMuscleGroup: exercise.primaryMuscleGroup,
        }}
      />
    </div>
  );
}
