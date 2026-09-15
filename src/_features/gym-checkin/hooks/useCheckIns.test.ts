import { describe, expect, it } from "vitest"
import { buildWeek, computeBestStreak, computeStreak } from "./useCheckIns"

const row = (date: string) => ({ check_in_date: date })
// 4 sep 2026 = viernes. Se usa fecha local fija para no depender del día real.
const TODAY = new Date(2026, 8, 4, 12, 0, 0)

describe("computeStreak", () => {
  it("cuenta días consecutivos incluyendo hoy", () => {
    const rows = [row("2026-09-04T10:00"), row("2026-09-03T10:00"), row("2026-09-02T10:00")]
    expect(computeStreak(rows, TODAY).count).toBe(3)
  })

  it("si hoy falta, mide desde ayer sin romperse", () => {
    const rows = [row("2026-09-03T10:00"), row("2026-09-02T10:00")]
    expect(computeStreak(rows, TODAY).count).toBe(2)
  })

  it("un hueco corta la racha", () => {
    const rows = [row("2026-09-04T10:00"), row("2026-09-02T10:00")]
    expect(computeStreak(rows, TODAY).count).toBe(1)
  })

  it("sin registros devuelve 0 y lastDate null", () => {
    expect(computeStreak([], TODAY)).toEqual({ count: 0, lastDate: null })
  })

  it("duplicados del mismo día cuentan una vez", () => {
    const rows = [row("2026-09-04T08:00"), row("2026-09-04T18:00"), row("2026-09-03T10:00")]
    expect(computeStreak(rows, TODAY).count).toBe(2)
  })
})

describe("computeBestStreak", () => {
  it("encuentra la mejor racha histórica", () => {
    const rows = [
      row("2026-08-01"),
      row("2026-08-02"),
      row("2026-08-03"),
      row("2026-08-10"),
      row("2026-08-11"),
    ]
    expect(computeBestStreak(rows)).toBe(3)
  })

  it("sin registros es 0", () => {
    expect(computeBestStreak([])).toBe(0)
  })
})

describe("buildWeek", () => {
  it("devuelve 7 días terminando hoy, hoy marcado", () => {
    const week = buildWeek([row("2026-09-04T10:00")], TODAY)
    expect(week).toHaveLength(7)
    expect(week[6].isToday).toBe(true)
    expect(week[6].trained).toBe(true)
    expect(week.filter((d) => d.isToday)).toHaveLength(1)
  })
})
