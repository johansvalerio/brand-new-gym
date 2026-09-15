import { expect, test } from "@playwright/test"

/**
 * Smoke E2E sin login: landings públicas, redirects del proxy y login.
 * No toca la DB ni necesita credenciales — valida aislamiento por gym
 * (ruta privada sin sesión siempre rebota a /auth/login de ESE gym).
 */

test("raíz redirige al gym insignia", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveURL(/\/gym-ulate\/?$/)
})

for (const [slug, nombre] of [
  ["gym-ulate", /gymulate/i],
  ["zona-fit", /zona fit/i],
  ["isaac-castro", /isaac castro/i],
] as const) {
  test(`landing /${slug} carga con su marca`, async ({ page }) => {
    await page.goto(`/${slug}`)
    await expect(page.getByText(nombre).first()).toBeVisible()
  })
}

test("slug inexistente → 404", async ({ page }) => {
  const res = await page.goto("/gym-fantasma")
  expect(res?.status()).toBe(404)
})

for (const ruta of ["dashboard", "users", "products", "payments", "workout"]) {
  test(`/${ruta} sin login rebota al login de ese gym`, async ({ page }) => {
    await page.goto(`/gym-ulate/${ruta}`)
    await expect(page).toHaveURL(/\/auth\/login\?gym=gym-ulate/)
  })
}

test("ruta privada de otro gym también pide login con su slug", async ({ page }) => {
  await page.goto("/zona-fit/dashboard")
  await expect(page).toHaveURL(/\/auth\/login\?gym=zona-fit/)
})

test("login carga con botones OAuth", async ({ page }) => {
  await page.goto("/auth/login?gym=gym-ulate")
  await expect(page).toHaveTitle(/iniciar sesión/i)
  await expect(page.getByRole("button", { name: /continuar con google/i })).toBeVisible()
  await expect(page.getByRole("button", { name: /continuar con facebook/i })).toBeVisible()
})
