import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductList } from '../components/ProductList';

export class CartPage extends BasePage {
  protected readonly path = 'cart.html';
  protected readonly expectedTitle = 'Your Cart';

  readonly products: ProductList;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.products = new ProductList(page);
    this.checkoutButton = page.getByTestId('checkout');
  }

  async irParaCheckout() {
    await this.checkoutButton.click();
  }
}