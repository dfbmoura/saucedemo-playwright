import { Locator, Page } from '@playwright/test';

/**
 * Lista de produtos. O SauceDemo usa a mesma estrutura (data-test="inventory-item")
 * na vitrine, no carrinho e no resumo do checkout, então essa lógica fica num lugar só.
 */
export class ProductList {
  readonly items: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
  }

  itemByName(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }

  nameOf(name: string): Locator {
    return this.itemByName(name).getByTestId('inventory-item-name');
  }

  priceOf(name: string): Locator {
    return this.itemByName(name).getByTestId('inventory-item-price');
  }

  quantityOf(name: string): Locator {
    return this.itemByName(name).getByTestId('item-quantity');
  }
}