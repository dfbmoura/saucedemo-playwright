import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartItemComponent } from './CartItemComponent';
import { OrderSummary } from '../data/types';
import { parseMoneyToCents } from '../utils/money';

export class CheckoutOverviewPage extends BasePage {
  protected readonly path = '/checkout-step-two.html';

  readonly cartItems: CartItemComponent;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = new CartItemComponent(page);
    this.paymentInfo = page.getByTestId('payment-info-value');
    this.shippingInfo = page.getByTestId('shipping-info-value');
    this.itemTotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
  }

  async readSummary(): Promise<OrderSummary> {
    return {
      items: await this.cartItems.readAll(),
      paymentInfo: (await this.paymentInfo.innerText()).trim(),
      shippingInfo: (await this.shippingInfo.innerText()).trim(),
      itemTotalCents: parseMoneyToCents(await this.itemTotalLabel.innerText()),
      taxCents: parseMoneyToCents(await this.taxLabel.innerText()),
      totalCents: parseMoneyToCents(await this.totalLabel.innerText()),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
