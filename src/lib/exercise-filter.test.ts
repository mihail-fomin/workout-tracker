import { describe, it, expect } from "vitest";
import { filterExercisesBySearch } from "./exercise-filter";

const mockExercises = [
  { id: "1", name: "Жим штанги", description: "Грудные", muscleGroups: ["грудь"] },
  { id: "2", name: "Приседания", description: "Ноги", muscleGroups: ["квадрицепс"] },
];

describe("filterExercisesBySearch", () => {
  it("возвращает все при пустом поиске", () => {
    expect(filterExercisesBySearch(mockExercises, "")).toEqual(mockExercises);
  });

  it("фильтрует по названию", () => {
    expect(filterExercisesBySearch(mockExercises, "жим")).toHaveLength(1);
  });

  it("фильтрует по мышечной группе", () => {
    expect(filterExercisesBySearch(mockExercises, "квадрицепс")).toHaveLength(1);
  });

  it("возвращает пустой массив при не массиве", () => {
    expect(filterExercisesBySearch(null as never, "x")).toEqual([]);
  });
});
