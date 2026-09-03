import { describe, expect, it } from "vitest";
import { canCreateRoutineFor, canEditRoutine, dayLabel, goalLabel } from "./routine-helpers";

describe("routine-helpers", () => {
  it("dayLabel usa nombre completo", () => {
    expect(dayLabel(1)).toBe("Lunes");
    expect(dayLabel(7)).toBe("Domingo");
    expect(dayLabel(9)).toBe("Día 9");
  });

  it("goalLabel traduce perdida_de_grasa", () => {
    expect(goalLabel("perdida_de_grasa")).toBe("Pérdida de grasa");
    expect(goalLabel("otro")).toBe("otro");
  });

  it("canEditRoutine: admin y coach siempre, usuario solo la suya", () => {
    const mine = { created_by: "u1", user_id: "u1" };
    expect(canEditRoutine(mine, { id: "a", role: "admin", assignedCoachId: null })).toBe(true);
    expect(canEditRoutine(mine, { id: "c", role: "coach", assignedCoachId: null })).toBe(true);
    expect(canEditRoutine(mine, { id: "u1", role: "user", assignedCoachId: null })).toBe(true);
    expect(canEditRoutine(mine, { id: "u2", role: "user", assignedCoachId: null })).toBe(false);
    expect(canEditRoutine(null, { id: "u1", role: "user", assignedCoachId: null })).toBe(false);
  });

  it("canCreateRoutineFor respeta asignación de coach", () => {
    expect(canCreateRoutineFor("u9", { id: "a", role: "admin", assignedCoachId: null }, null)).toBe(true);
    expect(canCreateRoutineFor("u1", { id: "u1", role: "user", assignedCoachId: null }, null)).toBe(true);
    expect(canCreateRoutineFor("u1", { id: "c1", role: "coach", assignedCoachId: null }, "c1")).toBe(true);
    expect(canCreateRoutineFor("u1", { id: "c2", role: "coach", assignedCoachId: null }, "c1")).toBe(false);
  });
});
