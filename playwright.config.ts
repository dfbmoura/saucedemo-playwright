import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração dos testes. Documentação: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['json', { outputFile: 'reports/json/results.json' }],
  ],

  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    screenshot: 'on',
    video: 'on',
    trace: 'on',
  },

  projects: [
    {
      // page.pdf() (comprovante da compra) só é suportado no Chromium
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
