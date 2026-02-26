import { ExerciseForm } from "@/components/exercise/ExerciseForm";

export default function NewExercisePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Новое упражнение</h1>
        <p className="text-muted-foreground">
          Добавьте своё упражнение в библиотеку
        </p>
      </div>

      <ExerciseForm />
    </div>
  );
}
