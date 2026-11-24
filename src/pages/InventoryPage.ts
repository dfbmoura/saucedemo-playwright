import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Product } from '../data/types';
import { parseMoneyToCents } from '../utils/money';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';

  readonly inventoryList: Locator;
  readonly items: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryList = page.getByTestId('inventory-list');
    this.items = page.getByTestId('inventory-item');
  }

  itemByName(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }

  async expectProductsListed(): Promise<void> {
    await expect(this.inventoryList).toBeVisible();
    await expect(this.items.first()).toBeVisible();
    expect(await this.items.count()).toBeGreaterThan(0);
  }

  /** Lê nome e preço do card do produto na vitrine. */
  async readProduct(name: string): Promise<Product> {
    const item = this.itemByName(name);
    await expect(item, `Produto "${name}" não encontrado na vitrine`).toHaveCount(1);
    return {
      name: (await item.getByTestId('inventory-item-name').innerText()).trim(),
      priceCents: parseMoneyToCents(await item.getByTestId('inventory-item-price').innerText()),
      quantity: 1,
    };
  }

  async addToCart(name: string): Promise<void> {
    const item = this.itemByName(name);
    await item.getByRole('button', { name: /add to cart/i }).click();
    await expect(item.getByRole('button', { name: /remove/i })).toBeVisible();
  }
}
