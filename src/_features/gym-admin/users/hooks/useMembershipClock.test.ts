import { describe, expect, it } from "vitest"
import { computeMembershipClock } from "./useMembershipClock"

const DAY = 86_400_000
const NOW = new Date("2026-09-04T12:00:00Z").getTime()
const iso = (ms: number) => new Date(ms).toISOString()

describe("computeMembershipClock", () => {
  it("sin fecha de fin → no-end", () => {
    expect(computeMembershipClock(null, null, NOW).state).toBe("no-end")
  })

  it("fin pasado → expired con etiqueta en días", () => {
    const c = computeMembershipClock(iso(NOW - 30 * DAY), iso(NOW - 2 * DAY), NOW)
    expect(c.state).toBe("expired")
    expect(c.expiredLabel).toBe("Vencida hace 2 días")
    expect(c.consumedPct).toBe(1)
  })

  it("vencida hoy → etiqueta 'Vencida hoy'", () => {
    const c = computeMembershipClock(iso(NOW - 30 * DAY), iso(NOW - 3_600_000), NOW)
    expect(c.state).toBe("expired")
    expect(c.expiredLabel).toBe("Vencida hoy")
  })

  it("≤7 días restantes → urgent", () => {
    const c = computeMembershipClock(iso(NOW - 25 * DAY), iso(NOW + 5 * DAY), NOW)
    expect(c.state).toBe("urgent")
    expect(c.days).toBe(5)
  })

  it(">7 días restantes → ok con etiqueta 'Nd Nh Nm'", () => {
    const c = computeMembershipClock(iso(NOW), iso(NOW + 20 * DAY + 3_600_000), NOW)
    expect(c.state).toBe("ok")
    expect(c.timeLabel).toMatch(/20d/)
  })

  it("now null (SSR, sin montar) → etiqueta '…'", () => {
    const c = computeMembershipClock(iso(NOW), iso(NOW + 20 * DAY), null)
    expect(c.timeLabel).toBe("…")
  })
})
