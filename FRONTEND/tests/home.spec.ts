import { test, expect } from '@playwright/test';

test.describe('Page d’accueil UrbanHeritage', () => {
    test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/');
    });

  test('doit afficher le header, la bannière et le footer', async ({ page }) => {
    // Vérifie qu’on a bien chargé le header, la bannière (app-banner) et le footer
    await expect(page.locator('app-header')).toBeVisible();
    await expect(page.locator('app-banner .banner')).toBeVisible();
    await expect(page.locator('app-footer')).toBeVisible();
  });

  test('la bannière de réductions défile et affiche au moins un item', async ({ page }) => {
    const items = page.locator('app-banner .marquee .item');
    await expect(items.first()).toBeVisible();
    // Au moins une offre
    const itemCount = await items.count();
    expect(itemCount).toBeGreaterThan(0);
  });

  test('section "À propos" contient le titre et le texte', async ({ page }) => {
    const aboutTitle = page.locator('app-section-a-propos h2.about-title');
    await expect(aboutTitle).toHaveText('À propos de la marque');

    const paragraphs = page.locator('app-section-a-propos .about-text p');
    await expect(paragraphs.first()).toContainText('Chaque design puise');
  });

  test('le bouton "Nos engagements" navigue vers /engagements', async ({ page }) => {
    const btn = page.locator('app-section-a-propos button.btn-engagements');
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page).toHaveURL(/\/engagements$/);
  });

  test('section “Coups de cœur” est présente', async ({ page }) => {
    await expect(page.locator('app-section-maillots-coup-de-coeur')).toBeVisible();
  });
});
