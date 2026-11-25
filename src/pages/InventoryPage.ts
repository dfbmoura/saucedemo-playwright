import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductList } from '../components/ProductList';

export class InventoryPage extends BasePage {
  protected readonly path = 'inventory.html';
  protected readonly expectedTitle = 'Products';

  readonly products: ProductList;

  constructor(page: Page) {
    super(page);
    this.products = new ProductList(page);
  }

  async expectLoaded() {
    await super.expectLoaded();
    await expect(this.products.items.first()).toBeVisible();
  }

  async addToCart(name: string) {
    const item = this.products.itemByName(name);
    await item.getByRole('button', { name: 'Add to cart' }).click();
    await expect(item.getByRole('button', { name: 'Remove' })).toBeVisible();
  }
}