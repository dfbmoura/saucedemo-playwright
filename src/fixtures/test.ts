import { test as base } from '@playwright/test';
import { PurchaseKeywords } from '../keywords/PurchaseKeywords';

type MinhasFixtures = {
  compra: PurchaseKeywords;
};

export const test = base.extend<MinhasFixtures>({
  compra: async ({ page }, use, testInfo) => {
    // antes do teste (setup)
    const keywords = new PurchaseKeywords(page, testInfo);

    await use(keywords);   // o teste roda aqui

    // depois do teste (teardown) - nada a limpar por enquanto
  },
});

export { expect } from '@playwright/test';