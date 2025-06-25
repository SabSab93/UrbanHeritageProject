import { test, expect } from '@playwright/test';

test.describe('Page d’inscription UrbanHeritage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/inscription');
  });

  test('champs présents et bouton désactivé si formulaire vide', async ({ page }) => {
    // Sélecteurs par id
    const ids = [
      'nom-input', 'prenom-input', 'civilite-select', 'date-input',
      'adresse-input', 'cp-input', 'ville-input', 'pays-input',
      'email-input', 'password-input', 'confirm-password-input',
      'submit-button'
    ];
    for (const id of ids) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    // Bouton désactivé tant que tout est vide
    await expect(page.locator('#submit-button')).toBeDisabled();
  });

  test('affiche erreur email invalide après saisie et blur', async ({ page }) => {
    const email = page.locator('#email-input');
    // Tape un email incorrect et sort du champ
    await email.fill('not-an-email');
    await email.blur();
    // L’erreur doit apparaître
    await expect(page.locator('#email-error')).toHaveText('Format d\'email invalide.');
  });

  test('affiche erreur password mismatch', async ({ page }) => {
    // Remplir password et confirmation différente
    await page.fill('#password-input', 'password123');
    await page.fill('#confirm-password-input', 'password321');
    // Force le touched + validation
    await page.click('body');
    await expect(page.locator('#confirm-error')).toHaveText('Les mots de passe ne correspondent pas.');
  });

  test('bouton activé quand tout est valide', async ({ page }) => {
    // Remplir tout le formulaire de façon valide
    await page.fill('#nom-input', 'Dupont');
    await page.fill('#prenom-input', 'Jean');
    await page.selectOption('#civilite-select', 'homme');
    await page.fill('#date-input', '1990-01-01');
    await page.fill('#adresse-input', '123 rue Exemple');
    await page.fill('#cp-input', '75001');
    await page.fill('#ville-input', 'Paris');
    await page.fill('#pays-input', 'France');
    await page.fill('#email-input', 'jean.dupont@example.com');
    await page.fill('#password-input', 'password123');
    await page.fill('#confirm-password-input', 'password123');

    // Le form est valide, le bouton doit être actif
    await expect(page.locator('#submit-button')).toBeEnabled();
  });

  test('le lien “Connecte-toi” amène à /connexion', async ({ page }) => {
    const link = page.locator('#login-link');
    await expect(link).toHaveAttribute('href', '/connexion');
    await link.click();
    await expect(page).toHaveURL(/\/connexion$/);
  });
});
