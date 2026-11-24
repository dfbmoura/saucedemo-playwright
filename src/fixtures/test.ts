import { test as base } from '@playwright/test';
import { PurchaseKeywords } from '../keywords/PurchaseKeywords';

type Fixtures = {
  purchase: PurchaseKeywords;
};

/**
 * Fixture customizada: injeta as keywords já instanciadas em cada teste,
 * evitando "new" e setup repetido nos specs.
 */
export const test = base.extend<Fixtures>({
  purchase: async ({ page }, use, testInfo) => {
    await use(new PurchaseKeywords(page, testInfo));
  },
});

export { expect } from '@playwright/test';
