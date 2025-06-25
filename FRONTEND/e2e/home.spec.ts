import { test, expect } from '@playwright/test';

test.describe('Page d’accueil UrbanHeritage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/');
  });

  test('le header est présent dans le DOM', async ({ page }) => {
    const count = await page.locator('app-header').count();
    expect(count).toBeGreaterThan(0);
  });

  test('la bannière est présente dans le DOM', async ({ page }) => {
    const count = await page.locator('app-banner').count();
    expect(count).toBeGreaterThan(0);
  });

  test('le footer est présent dans le DOM', async ({ page }) => {
    const count = await page.locator('app-footer').count();
    expect(count).toBeGreaterThan(0);
  });
});