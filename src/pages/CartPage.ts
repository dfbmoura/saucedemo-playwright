import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartItemComponent } from './CartItemComponent';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  readonly cartItems: CartItemComponent;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = new CartItemComponent(page);
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
