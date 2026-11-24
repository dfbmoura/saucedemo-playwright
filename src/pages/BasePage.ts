import { expect, Locator, Page } from '@playwright/test';

/**
 * Comportamentos comuns a todas as páginas autenticadas do SauceDemo
 * (título da página, carrinho no cabeçalho, URL).
 */
export abstract class BasePage {
  /** Caminho relativo da página, usado para navegar e validar URL. */
  protected abstract readonly path: string;

  readonly title: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(protected readonly page: Page) {
    this.title = page.getByTestId('title');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectLoaded(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${this.path.replace('.', '\\.')}$`));
    await expect(this.title).toHaveText(expectedTitle);
  }

  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toBeHidden();
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
