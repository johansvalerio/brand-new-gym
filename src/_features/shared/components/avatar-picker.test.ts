import { describe, expect, it } from "vitest"
import { validateImageFile } from "./avatar-picker"

const img = (type: string, size: number) =>
  new File([new Uint8Array(size)], "foto.jpg", { type })

describe("validateImageFile", () => {
  it("acepta imagen liviana", () => {
    expect(validateImageFile(img("image/jpeg", 1024))).toBeNull()
  })

  it("rechaza archivo no-imagen", () => {
    expect(validateImageFile(img("application/pdf", 1024))).toContain("imagen")
  })

  it("rechaza imagen mayor a 5MB", () => {
    expect(validateImageFile(img("image/png", 6 * 1024 * 1024))).toContain("5MB")
  })
})
