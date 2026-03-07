import { test, expect } from '@playwright/test'

// Tests sur les pages /demo (pas d'auth requise)
test.describe('Demo publique', () => {
  test('page demo principale se charge', async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('networkidle')

    // Vérifie que la sidebar et les KPIs sont présents
    await expect(page.getByText(/note google|avis|score/i).first()).toBeVisible()
  })

  test('page demo avis se charge', async ({ page }) => {
    await page.goto('/demo/reviews')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/avis/i).first()).toBeVisible()
  })

  test('page demo SEO se charge', async ({ page }) => {
    await page.goto('/demo/seo')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/seo|performance/i).first()).toBeVisible()
  })

  test('page demo concurrents se charge', async ({ page }) => {
    await page.goto('/demo/competitors')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/concurrent|compétiteur/i).first()).toBeVisible()
  })

  test('page demo réseaux sociaux se charge', async ({ page }) => {
    await page.goto('/demo/social')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/facebook|instagram|social/i).first()).toBeVisible()
  })

  test('page demo rapports se charge', async ({ page }) => {
    await page.goto('/demo/reports')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/rapport|analyse/i).first()).toBeVisible()
  })
})

test.describe('Demo premium', () => {
  test('page demo-premium principale se charge', async ({ page }) => {
    await page.goto('/demo-premium')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/premium|note|score/i).first()).toBeVisible()
  })

  test('page demo-premium SEO se charge', async ({ page }) => {
    await page.goto('/demo-premium/seo')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/seo|performance|on-page/i).first()).toBeVisible()
  })
})
