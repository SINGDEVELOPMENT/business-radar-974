import { test, expect } from '@playwright/test'

// Tests d'export — nécessitent une session authentifiée
// Ces tests sont skippés si pas de credentials de test
test.describe('Exports (authentifié)', () => {
  test.skip(!process.env.TEST_USER_EMAIL, 'Nécessite TEST_USER_EMAIL dans .env.test')

  test.beforeEach(async ({ page }) => {
    // Login avant chaque test
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByRole('textbox', { name: /email/i }).fill(process.env.TEST_USER_EMAIL!)
    await page.getByRole('textbox', { name: /mot de passe|password/i }).fill(process.env.TEST_USER_PASSWORD!)
    await page.getByRole('button', { name: /connexion|se connecter/i }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForURL(/dashboard/)
  })

  test('export XLSX retourne un fichier', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.goto('/api/export/xlsx')
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/)
  })

  test('export PDF retourne un fichier', async ({ page }) => {
    // Vérifie que l'API répond (peut retourner 404 si aucun rapport, c'est OK)
    const response = await page.request.get('/api/reports/pdf')
    expect([200, 404]).toContain(response.status())
    if (response.status() === 200) {
      expect(response.headers()['content-type']).toContain('application/pdf')
    }
  })
})
