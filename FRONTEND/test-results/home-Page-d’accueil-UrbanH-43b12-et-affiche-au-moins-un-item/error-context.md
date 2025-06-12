# Test info

- Name: Page d’accueil UrbanHeritage >> la bannière de réductions défile et affiche au moins un item
- Location: /root/dev/UrbanHeritageProject/FRONTEND/tests/home.spec.ts:15:7

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

╔════════════════════════════════════════════════════════════════════════════════════════════════╗
║ Looks like you launched a headed browser without having a XServer running.                     ║
║ Set either 'headless: true' or use 'xvfb-run <your-playwright-app>' before running Playwright. ║
║                                                                                                ║
║ <3 Playwright Team                                                                             ║
╚════════════════════════════════════════════════════════════════════════════════════════════════╝
Call log:
  - <launching> /root/.cache/ms-playwright/chromium-1169/chrome-linux/chrome --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AcceptCHFrame,AutoExpandDetailsElement,AvoidUnnecessaryBeforeUnloadCheckSync,CertificateTransparencyComponentUpdater,DeferRendererTasksAfterInput,DestroyProfileOnBrowserClose,DialMediaRouteProvider,ExtensionManifestV2Disabled,GlobalMediaControls,HttpsUpgrades,ImprovedCookieControls,LazyFrameLoading,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --enable-automation --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --no-sandbox --user-data-dir=/tmp/playwright_chromiumdev_profile-claPZv --remote-debugging-pipe --no-startup-window
  - <launched> pid=21381
  - [pid=21381][err] [21381:21381:0609/154802.977931:ERROR:ui/ozone/platform/x11/ozone_platform_x11.cc:249] Missing X server or $DISPLAY
  - [pid=21381][err] [21381:21381:0609/154802.978506:ERROR:ui/aura/env.cc:257] The platform failed to initialize.  Exiting.

```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Page d’accueil UrbanHeritage', () => {
   4 |     test.beforeEach(async ({ page }) => {
   5 |     await page.goto('http://localhost:4200/');
   6 |     });
   7 |
   8 |   test('doit afficher le header, la bannière et le footer', async ({ page }) => {
   9 |     // Vérifie qu’on a bien chargé le header, la bannière (app-banner) et le footer
  10 |     await expect(page.locator('app-header')).toBeVisible();
  11 |     await expect(page.locator('app-banner .banner')).toBeVisible();
  12 |     await expect(page.locator('app-footer')).toBeVisible();
  13 |   });
  14 |
> 15 |   test('la bannière de réductions défile et affiche au moins un item', async ({ page }) => {
     |       ^ Error: browserType.launch: Target page, context or browser has been closed
  16 |     const items = page.locator('app-banner .marquee .item');
  17 |     await expect(items.first()).toBeVisible();
  18 |     // Au moins une offre
  19 |     const itemCount = await items.count();
  20 |     expect(itemCount).toBeGreaterThan(0);
  21 |   });
  22 |
  23 |   test('section "À propos" contient le titre et le texte', async ({ page }) => {
  24 |     const aboutTitle = page.locator('app-section-a-propos h2.about-title');
  25 |     await expect(aboutTitle).toHaveText('À propos de la marque');
  26 |
  27 |     const paragraphs = page.locator('app-section-a-propos .about-text p');
  28 |     await expect(paragraphs.first()).toContainText('Chaque design puise');
  29 |   });
  30 |
  31 |   test('le bouton "Nos engagements" navigue vers /engagements', async ({ page }) => {
  32 |     const btn = page.locator('app-section-a-propos button.btn-engagements');
  33 |     await expect(btn).toBeVisible();
  34 |     await btn.click();
  35 |     await expect(page).toHaveURL(/\/engagements$/);
  36 |   });
  37 |
  38 |   test('section “Coups de cœur” est présente', async ({ page }) => {
  39 |     await expect(page.locator('app-section-maillots-coup-de-coeur')).toBeVisible();
  40 |   });
  41 | });
  42 |
```