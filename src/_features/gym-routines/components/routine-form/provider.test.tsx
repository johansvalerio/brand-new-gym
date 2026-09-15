// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  RoutineFormProvider,
  useWizardDispatch,
  useWizardState,
} from "./context"

function Probe() {
  const s = useWizardState()
  const d = useWizardDispatch()
  return (
    <p>
      {s.step}|{s.metadata.name}|{typeof d}
    </p>
  )
}

describe("RoutineFormProvider", () => {
  it("inyecta estado inicial y dispatch, muere al desmontar (scope local)", () => {
    const { unmount } = render(
      <RoutineFormProvider
        initialMetadata={() => ({
          name: "Rutina test",
          goal: "fuerza",
          days_per_week: 3,
          notes: null,
          is_active: true,
        })}
        initialDays={() => []}
      >
        <Probe />
      </RoutineFormProvider>,
    )
    expect(screen.getByText("datos|Rutina test|function")).toBeTruthy()
    unmount()
  })

  it("useWizardState fuera del provider tira error claro", () => {
    const spy = console.error
    console.error = () => {}
    expect(() => render(<Probe />)).toThrow("RoutineFormProvider")
    console.error = spy
  })
})
