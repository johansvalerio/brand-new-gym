import { describe, expect, it } from "vitest";
import { canCreateNutritionFor, canEditNutrition, dayLabel, nutritionGoalLabel } from "./nutrition-helpers";

describe("nutrition-helpers", () => {
  it("dayLabel y goal usan español completo", () => {
    expect(dayLabel(1)).toBe("Lunes");
    expect(nutritionGoalLabel("definicion")).toBe("Definición");
    expect(nutritionGoalLabel("volumen")).toBe("Volumen");
  });

  it("canEditNutrition: admin/coach sí, usuario solo la suya", () => {
    const plan = { created_by: "u1", user_id: "u1" };
    expect(canEditNutrition(plan, { id: "a", role: "admin", assignedCoachId: null })).toBe(true);
    expect(canEditNutrition(plan, { id: "c", role: "coach", assignedCoachId: null })).toBe(true);
    expect(canEditNutrition(plan, { id: "u1", role: "user", assignedCoachId: null })).toBe(true);
    expect(canEditNutrition(plan, { id: "u2", role: "user", assignedCoachId: null })).toBe(false);
  });

  it("canCreateNutritionFor respeta asignación", () => {
    expect(canCreateNutritionFor("u1", { id: "u1", role: "user", assignedCoachId: null }, null)).toBe(true);
    expect(canCreateNutritionFor("u1", { id: "c1", role: "coach", assignedCoachId: null }, "c1")).toBe(true);
    expect(canCreateNutritionFor("u1", { id: "c2", role: "coach", assignedCoachId: null }, "c1")).toBe(false);
  });
});
