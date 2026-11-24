import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração central do Playwright.
 * - testIdAttribute = "data-test": o SauceDemo expõe seletores estáveis nesse atributo,
 *   então usamos page.getByTestId() em todos os Page Objects.
 * - Evidências: screenshot, vídeo e trace de toda execução, além das evidências
 *   anexadas por cada keyword.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['json', { outputFile: 'reports/json/results.json' }],
  ],
  outputDir: 'test-results',

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      // A geração de PDF (page.pdf) é suportada apenas pelo Chromium.
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
