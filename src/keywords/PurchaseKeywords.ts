import { expect, Page, TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  CartPage,
  CheckoutCompletePage,
  CheckoutInformationPage,
  CheckoutOverviewPage,
  InventoryPage,
  LoginPage,
} from '../pages';
import { Customer, OrderSummary, Product } from '../data/types';
import { testData } from '../data/test-data';
import { keyword } from '../utils/evidence';
import { formatCents, sumCents } from '../utils/money';
import { generateReceiptPdf } from '../utils/receipt-pdf';

/**
 * Keywords customizadas de negócio.
 * Cada método é uma ação completa e reutilizável do fluxo de compra
 * (estilo Robot Framework), composta pelos Page Objects. Os testes
 * falam a linguagem do negócio; os Page Objects cuidam dos seletores.
 */
export class PurchaseKeywords {
  private loggedUser = '';

  private readonly loginPage: LoginPage;
  private readonly inventoryPage: InventoryPage;
  private readonly cartPage: CartPage;
  private readonly checkoutInfoPage: CheckoutInformationPage;
  private readonly overviewPage: CheckoutOverviewPage;
  private readonly completePage: CheckoutCompletePage;

  constructor(
    private readonly page: Page,
    private readonly testInfo: TestInfo,
  ) {
    this.loginPage = new LoginPage(page);
    this.inventoryPage = new InventoryPage(page);
    this.cartPage = new CartPage(page);
    this.checkoutInfoPage = new CheckoutInformationPage(page);
    this.overviewPage = new CheckoutOverviewPage(page);
    this.completePage = new CheckoutCompletePage(page);
  }

  private run<T>(title: string, body: () => Promise<T>): Promise<T> {
    return keyword(title, this.page, this.testInfo, body);
  }

  /** Faz login usando as credenciais exibidas na tela inicial. */
  async loginWithDisplayedCredentials(username: string = testData.username): Promise<void> {
    await this.run(`Realizar login com o usuário "${username}" exibido na tela`, async () => {
      await this.loginPage.goto();
      const { usernames, password } = await this.loginPage.getDisplayedCredentials();
      expect(usernames, 'O usuário deve estar listado na tela de login').toContain(username);

      await this.loginPage.login({ username, password });
      await expect(this.loginPage.errorMessage).toBeHidden();
      this.loggedUser = username;
    });
  }

  async validateProductsPage(): Promise<void> {
    await this.run('Validar acesso à página de produtos', async () => {
      await this.inventoryPage.expectLoaded(testData.messages.productsTitle);
      await this.inventoryPage.expectProductsListed();
      await this.inventoryPage.expectCartCount(0);
    });
  }

  /** Adiciona o produto ao carrinho e devolve nome/preço lidos da vitrine. */
  async addProductToCart(productName: string): Promise<Product> {
    return this.run(`Adicionar "${productName}" ao carrinho`, async () => {
      const product = await this.inventoryPage.readProduct(productName);
      await this.inventoryPage.addToCart(productName);
      await this.inventoryPage.expectCartCount(1);
      return product;
    });
  }

  /** Abre o carrinho e valida nome, quantidade e preço de cada item. */
  async validateCart(expected: Product[]): Promise<void> {
    await this.run('Validar nome, quantidade e preço no carrinho', async () => {
      await this.inventoryPage.openCart();
      await this.cartPage.expectLoaded(testData.messages.cartTitle);
      const cartItems = await this.cartPage.cartItems.readAll();
      expect(cartItems, 'Itens do carrinho devem ser iguais aos selecionados').toEqual(expected);
    });
  }

  async checkout(customer: Customer): Promise<void> {
    await this.run('Realizar checkout (dados do cliente)', async () => {
      await this.cartPage.proceedToCheckout();
      await this.checkoutInfoPage.expectLoaded('Checkout: Your Information');
      await this.checkoutInfoPage.fillCustomer(customer);
      await this.checkoutInfoPage.continue();
      await this.overviewPage.expectLoaded(testData.messages.overviewTitle);
    });
  }

  /**
   * Valida o resumo do pedido:
   *  - itens do resumo = itens comprados (nome, quantidade e preço);
   *  - "Item total" = soma dos preços dos produtos comprados;
   *  - "Total" = Item total + Tax.
   */
  async validateOrderTotal(purchased: Product[]): Promise<OrderSummary> {
    return this.run('Validar que o preço final corresponde ao que foi comprado', async () => {
      const summary = await this.overviewPage.readSummary();
      const expectedItemTotal = sumCents(purchased.map((p) => p.priceCents * p.quantity));

      expect(summary.items, 'Itens do resumo').toEqual(purchased);
      expect(
        summary.itemTotalCents,
        `Item total (${formatCents(summary.itemTotalCents)}) deve ser igual à soma comprada (${formatCents(expectedItemTotal)})`,
      ).toBe(expectedItemTotal);
      expect(
        summary.totalCents,
        `Total (${formatCents(summary.totalCents)}) deve ser Item total + Tax`,
      ).toBe(summary.itemTotalCents + summary.taxCents);

      await this.testInfo.attach('Resumo do pedido (JSON)', {
        body: JSON.stringify(summary, null, 2),
        contentType: 'application/json',
      });
      return summary;
    });
  }

  async finishAndValidateConfirmation(): Promise<{ header: string; text: string }> {
    return this.run('Finalizar compra e validar mensagem de confirmação', async () => {
      await this.overviewPage.finish();
      await this.completePage.expectLoaded(testData.messages.completeTitle);
      await expect(this.completePage.completeHeader).toHaveText(testData.messages.completeHeader);
      await expect(this.completePage.completeText).toHaveText(testData.messages.completeText);
      await this.completePage.expectCartCount(0);
      return {
        header: (await this.completePage.completeHeader.innerText()).trim(),
        text: (await this.completePage.completeText.innerText()).trim(),
      };
    });
  }

  /** Gera o PDF do comprovante, salva em reports/pdf e anexa ao relatório. */
  async generatePurchasePdf(
    customer: Customer,
    summary: OrderSummary,
    confirmation: { header: string; text: string },
  ): Promise<string> {
    return this.run('Gerar PDF da compra', async () => {
      const purchasedAt = new Date();
      const stamp = purchasedAt.toISOString().replace(/[:.]/g, '-');
      const orderId = `SD-${stamp}`;
      const outputDir = path.resolve('reports', 'pdf');
      fs.mkdirSync(outputDir, { recursive: true });
      const outputPath = path.join(outputDir, `compra-${stamp}.pdf`);

      const pdf = await generateReceiptPdf(
        this.page.context(),
        {
          orderId,
          purchasedAt,
          username: this.loggedUser,
          customer,
          summary,
          confirmationHeader: confirmation.header,
          confirmationText: confirmation.text,
          confirmationScreenshot: await this.page.screenshot({ fullPage: true }),
        },
        outputPath,
      );

      expect(fs.existsSync(outputPath), 'O PDF deve ser gerado em disco').toBe(true);
      expect(pdf.subarray(0, 5).toString(), 'Arquivo gerado deve ser um PDF válido').toBe('%PDF-');
      await this.testInfo.attach('Comprovante da compra (PDF)', { path: outputPath, contentType: 'application/pdf' });
      return outputPath;
    });
  }
}
