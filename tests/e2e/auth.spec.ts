import { test, expect } from '@playwright/test'

test.describe('Authentification', () => {
  test('la page login s\'affiche correctement', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveTitle(/Business Radar|login/i)
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /mot de passe|password/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /connexion|se connecter|login/i })).toBeVisible()
  })

  test('redirect vers login si non authentifié', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Doit rediriger vers login
    await expect(page).toHaveURL(/login/)
  })

  test('affiche une erreur avec des identifiants invalides', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    await page.getByRole('textbox', { name: /email/i }).fill('test@invalid.com')
    await page.getByRole('textbox', { name: /mot de passe|password/i }).fill('wrongpassword')
    await page.getByRole('button', { name: /connexion|se connecter|login/i }).click()

    await page.waitForLoadState('networkidle')
    // Doit afficher un message d'erreur
    await expect(page.getByText(/erreur|invalide|incorrect|invalid/i)).toBeVisible({ timeout: 5000 })
  })
})
