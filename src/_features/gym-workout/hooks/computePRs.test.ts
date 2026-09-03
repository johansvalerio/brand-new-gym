import { describe, expect, it } from "vitest";
import { computePRs } from "./computePRs";
import type { SetDraft } from "./useWorkoutSession";
import type { WorkoutWithSets } from "./useWorkoutHistory";

const name = (id: number) => `Ejercicio ${id}`;

function prevWorkout(exerciseId: number, weight: number, isWarmup = false): WorkoutWithSets {
  return {
    set_logs: [
      {
        exercise_id: exerciseId,
        weight,
        is_warmup: isWarmup,
        id: 1,
        reps: 5,
        set_number: 1,
        workout_log_id: 1,
        exercises: null,
      },
    ],
  } as WorkoutWithSets;
}

function draft(exerciseId: number, weight: number, isWarmup = false): SetDraft {
  return { exercise_id: exerciseId, set_number: 1, weight, reps: 5, is_warmup: isWarmup };
}

describe("computePRs", () => {
  it("ignora warmup y peso 0", () => {
    expect(computePRs([draft(1, 0), draft(1, 50, true)], [], name)).toEqual([]);
  });

  it("marca primera vez sin historial", () => {
    const prs = computePRs([draft(7, 60)], [], name);
    expect(prs).toHaveLength(1);
    expect(prs[0]).toMatchObject({ exerciseId: 7, newBest: 60, previousBest: 0, isFirstTime: true });
  });

  it("detecta récord solo con peso estrictamente mayor", () => {
    const prev = [prevWorkout(3, 100)];
    expect(computePRs([draft(3, 100)], prev, name)).toEqual([]);
    const prs = computePRs([draft(3, 102.5)], prev, name);
    expect(prs).toHaveLength(1);
    expect(prs[0]).toMatchObject({ exerciseId: 3, newBest: 102.5, previousBest: 100, isFirstTime: false });
  });

  it("toma el mejor peso de la sesión actual", () => {
    const prev = [prevWorkout(5, 80)];
    const prs = computePRs([draft(5, 70), draft(5, 90)], prev, name);
    expect(prs[0].newBest).toBe(90);
  });
});
