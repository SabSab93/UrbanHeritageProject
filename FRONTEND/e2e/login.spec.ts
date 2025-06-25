import { test, expect } from '@playwright/test';

test.describe('Page de connexion UrbanHeritage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/connexion');
  });

  test('les champs et le bouton sont présents, bouton désactivé si vide', async ({ page }) => {
    // On cible par id
    const emailInput    = page.locator('#email-input');
    const passwordInput = page.locator('#password-input');
    const submitBtn     = page.locator('#submit-button');

    // Vérifier la présence
    await expect(emailInput).toHaveAttribute('placeholder', 'Adresse e-mail *');
    await expect(passwordInput).toHaveAttribute('placeholder', 'Mot de passe *');
    // Comme le formulaire est vide, le bouton doit être désactivé
    await expect(submitBtn).toBeDisabled();
  });

  test('bouton activé après saisie valide', async ({ page }) => {
    await page.fill('#email-input', 'user@example.com');
    await page.fill('#password-input', 'password123');
    const submitBtn = page.locator('#submit-button');
    // Le formulaire est maintenant valide
    await expect(submitBtn).toBeEnabled();
  });

  test('affiche message d’erreur si identifiants invalides', async ({ page }) => {
    // On intercepte l’appel de login pour renvoyer une 401
    await page.route('**/auth/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Identifiants invalides' })
      });
    });

    await page.fill('#email-input', 'wrong@example.com');
    await page.fill('#password-input', 'wrongpass');
    await page.click('#submit-button');
    // On attend que l’erreur s’affiche
    const error = page.locator('#error-message');
    await expect(error).toHaveText('Identifiants invalides');
  });

  test('les liens “Mot de passe oublié” et “Inscris-toi” pointent aux bonnes routes', async ({ page }) => {
    const forgotLink = page.locator('#forgot-link');
    await expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    await forgotLink.click();
    await expect(page).toHaveURL(/\/forgot-password$/);

    // Retour à /connexion pour tester le lien suivant
    await page.goto('http://localhost:4200/connexion');
    const signupLink = page.locator('#signup-link');
    await expect(signupLink).toHaveAttribute('href', '/inscription');
    await signupLink.click();
    await expect(page).toHaveURL(/\/inscription$/);
  });
});
