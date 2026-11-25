import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Cliente } from '../data/test-data';

export class CheckoutInformationPage extends BasePage {
  protected readonly path = 'checkout-step-one.html';
  protected readonly expectedTitle = 'Checkout: Your Information';

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
  }

  async preencherDados(cliente: Cliente) {
    await this.firstNameInput.fill(cliente.nome);
    await this.lastNameInput.fill(cliente.sobrenome);
    await this.postalCodeInput.fill(cliente.cep);
  }

  async continuar() {
    await this.continueButton.click();
  }
}