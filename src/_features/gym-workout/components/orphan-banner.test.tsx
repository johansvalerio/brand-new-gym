// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const abortMutate = vi.fn().mockResolvedValue({ id: 9 })

vi.mock("@/_features/auth/hooks/useAuthSession", () => ({
  useAuthSession: () => ({ profile: { id: "u1" }, loading: false }),
}))
vi.mock("@/_features/gym-routines/hooks/useUserRoutines", () => ({
  useUserRoutines: () => ({ data: [] }),
}))
vi.mock("@/_features/gym-routines/hooks/useExercises", () => ({
  useExerciseCatalog: () => ({ data: [] }),
}))
vi.mock("@/_features/shared/hooks/usePageTransition", () => ({
  usePageTransition: () => ({ navigate: vi.fn() }),
}))
vi.mock("@/_features/gym-routines/components/exercise-chooser", () => ({
  ExerciseChooser: () => null,
}))
vi.mock("../hooks/useWorkoutSession", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../hooks/useWorkoutSession")>()
  return {
    ...mod,
    useStartWorkout: () => ({ mutateAsync: vi.fn() }),
    useSaveSet: () => ({ mutateAsync: vi.fn() }),
    useFinishWorkout: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useAbortWorkout: () => ({ mutateAsync: abortMutate, isPending: false }),
    useActiveWorkout: () => ({
      data: { id: 9, started_at: new Date("2026-09-04T10:00:00").toISOString() },
      isLoading: false,
    }),
  }
})

import { WorkoutSession } from "./WorkoutSession"

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const ui = render(
    <QueryClientProvider client={client}>
      <WorkoutSession />
    </QueryClientProvider>,
  )
  return { client, ...ui }
}

const banner = () => screen.queryByText("Sesión sin terminar")

describe("WorkoutSession cartel huérfana", () => {
  it("Continuar cierra el cartel al instante", () => {
    setup()
    expect(banner()).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: /continuar/i }))
    expect(banner()).toBeNull()
  })

  it("Empezar nueva cancela en el servidor y cierra el cartel", async () => {
    abortMutate.mockClear()
    setup()
    expect(banner()).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: /empezar nueva/i }))
    expect(abortMutate).toHaveBeenCalledWith({ userId: "u1", workoutLogId: 9 })
    expect(banner()).toBeNull()
  })
})
