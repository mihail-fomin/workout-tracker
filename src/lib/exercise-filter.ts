export type ExerciseForFilter = {
  id: string;
  name: string;
  description?: string | null;
  muscleGroups: string[];
};

/**
 * Фильтрует упражнения по поисковому запросу.
 */
export function filterExercisesBySearch<T extends ExerciseForFilter>(
  exercises: T[],
  search: string
): T[] {
  if (!Array.isArray(exercises)) return [];
  const searchLower = search.toLowerCase().trim();
  if (!searchLower) return exercises;
  return exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(searchLower) ||
      e.description?.toLowerCase().includes(searchLower) ||
      e.muscleGroups.some((g) => g.toLowerCase().includes(searchLower))
  );
}
