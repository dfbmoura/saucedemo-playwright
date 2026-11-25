import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductList } from '../components/ProductList';
import { paraCentavos } from '../utils/money';
import { Totais } from '../data/test-data';

export class CheckoutOverviewPage extends BasePage {
  protected readonly path = 'checkout-step-two.html';
  protected readonly expectedTitle = 'Checkout: Overview';

  readonly products: ProductList;
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.products = new ProductList(page);
    this.itemTotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
  }

  async lerTotais(): Promise<Totais> {
    const itemTotal = paraCentavos(await this.itemTotalLabel.innerText());
    const taxa = paraCentavos(await this.taxLabel.innerText());
    const total = paraCentavos(await this.totalLabel.innerText());
    return { itemTotal, taxa, total };
  }

  async finalizar() {
    await this.finishButton.click();
  }
}