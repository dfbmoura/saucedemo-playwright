import { expect, Locator, Page } from '@playwright/test';

export abstract class BasePage {
  protected abstract readonly path: string;
  protected abstract readonly expectedTitle: string;

  readonly title: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;

  constructor(protected readonly page: Page) {
    this.title = page.getByTestId('title');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(new RegExp(this.path));
    await expect(this.title).toHaveText(this.expectedTitle);
  }

  async openCart() {
    await this.cartLink.click();
  }
}