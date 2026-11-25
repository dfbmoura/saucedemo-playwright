import { expect, Page, TestInfo } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInformationPage } from '../pages/CheckoutInformationPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { Cliente, Produto, Totais, testData } from '../data/test-data';
import { keyword } from '../utils/evidence';
import { paraCentavos, formatarCentavos } from '../utils/money';
import * as fs from 'fs';
import * as path from 'path';
import { gerarPdf, montarHtmlComprovante } from '../utils/pdf';

export class PurchaseKeywords {
  private readonly loginPage: LoginPage;
  private readonly inventoryPage: InventoryPage;
  private readonly cartPage: CartPage;
  private readonly checkoutInfoPage: CheckoutInformationPage;
  private readonly overviewPage: CheckoutOverviewPage;
  private readonly completePage: CheckoutCompletePage;
  private usuarioLogado = '';

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

  /** Atalho para não repetir page e testInfo em toda keyword. */
  private passo<T>(titulo: string, acao: () => Promise<T>): Promise<T> {
    return keyword(titulo, this.page, this.testInfo, acao);
  }

  async loginComCredenciaisDaTela(usuario: string = testData.usuario) {
    await this.passo(`Realizar login com "${usuario}" (credenciais da tela)`, async () => {
      await this.loginPage.goto();
      const credenciais = await this.loginPage.getDisplayedCredentials();
      expect(credenciais.usuarios, 'Usuário deve estar listado na tela').toContain(usuario);
      await this.loginPage.login(usuario, credenciais.senha);
            this.usuarioLogado = usuario;
    });
  }

  async validarPaginaDeProdutos() {
    await this.passo('Validar acesso à página de produtos', async () => {
      await this.inventoryPage.expectLoaded();
      await expect(this.inventoryPage.cartBadge).toBeHidden();
    });
  }

  async adicionarAoCarrinho(nome: string): Promise<Produto> {
    return this.passo(`Adicionar "${nome}" ao carrinho`, async () => {
      const preco = await this.inventoryPage.products.priceOf(nome).innerText();
      await this.inventoryPage.addToCart(nome);
      await expect(this.inventoryPage.cartBadge).toHaveText('1');
      return { nome, preco, quantidade: 1 };
    });
  }

  async validarCarrinho(produto: Produto) {
    await this.passo('Validar nome, quantidade e preço no carrinho', async () => {
      await this.inventoryPage.openCart();
      await this.cartPage.expectLoaded();
      const lista = this.cartPage.products;
      await expect(lista.items).toHaveCount(1);
      await expect(lista.nameOf(produto.nome)).toHaveText(produto.nome);
      await expect(lista.quantityOf(produto.nome)).toHaveText(String(produto.quantidade));
      await expect(lista.priceOf(produto.nome)).toHaveText(produto.preco);
    });
  }

  async realizarCheckout(cliente: Cliente) {
    await this.passo('Realizar checkout', async () => {
      await this.cartPage.irParaCheckout();
      await this.checkoutInfoPage.expectLoaded();
      await this.checkoutInfoPage.preencherDados(cliente);
      await this.checkoutInfoPage.continuar();
      await this.overviewPage.expectLoaded();
    });
  }

  async validarPrecoFinal(produto: Produto) {
    return this.passo('Validar que o preço final corresponde ao que foi comprado', async () => {
      const lista = this.overviewPage.products;
      await expect(lista.quantityOf(produto.nome)).toHaveText(String(produto.quantidade));
      await expect(lista.priceOf(produto.nome)).toHaveText(produto.preco);

      const precoComprado = paraCentavos(produto.preco) * produto.quantidade;
      const totais = await this.overviewPage.lerTotais();

      expect(totais.itemTotal,
        `Item total (${formatarCentavos(totais.itemTotal)}) = preço comprado (${formatarCentavos(precoComprado)})`,
      ).toBe(precoComprado);
      expect(totais.total,
        `Total (${formatarCentavos(totais.total)}) = Item total + Taxa`,
      ).toBe(totais.itemTotal + totais.taxa);

      return totais;
    });
  }

  async finalizarEValidarConfirmacao() {
    await this.passo('Finalizar compra e validar mensagem de confirmação', async () => {
      await this.overviewPage.finalizar();
      await this.completePage.expectLoaded();
      await expect(this.completePage.completeHeader).toHaveText(testData.mensagens.confirmacaoTitulo);
      await expect(this.completePage.completeText).toHaveText(testData.mensagens.confirmacaoTexto);
      await expect(this.completePage.cartBadge).toBeHidden();
    });
  }
  async gerarPdfDaCompra(produto: Produto, totais: Totais, cliente: Cliente): Promise<string> {
    return this.passo('Gerar PDF da compra', async () => {
      // 1. Onde salvar: reports/pdf/compra-<data-hora>.pdf
      const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
      const pasta = path.resolve('reports', 'pdf');
      fs.mkdirSync(pasta, { recursive: true });
      const caminho = path.join(pasta, `compra-${carimbo}.pdf`);

      // 2. Montar o comprovante com os dados da compra + print da tela de confirmação
      const html = montarHtmlComprovante({
        usuario: this.usuarioLogado,
        cliente,
        produto,
        totais,
        mensagem: await this.completePage.completeHeader.innerText(),
        printConfirmacao: await this.page.screenshot({ fullPage: true }),
      });

      // 3. Gerar o PDF
      const pdf = await gerarPdf(this.page.context(), html, caminho);

      // 4. Validar que o arquivo foi gerado e é um PDF de verdade
      expect(fs.existsSync(caminho), 'Arquivo PDF deve existir').toBe(true);
      expect(pdf.subarray(0, 5).toString(), 'Arquivo deve ser um PDF válido').toBe('%PDF-');

      // 5. Anexar o PDF ao relatório
      await this.testInfo.attach('Comprovante da compra (PDF)', {
        path: caminho,
        contentType: 'application/pdf',
      });

      console.log(`PDF gerado em: ${caminho}`);
      return caminho;
    });
  }
}