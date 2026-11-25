import { test } from '../src/fixtures/test';
import { testData } from '../src/data/test-data';

test.describe('Fluxo de compra - SauceDemo', () => {
  test('comprar um produto e gerar o comprovante em PDF', async ({ compra }) => {
    await compra.loginComCredenciaisDaTela();
    await compra.validarPaginaDeProdutos();

    const produto = await compra.adicionarAoCarrinho(testData.produto);
    await compra.validarCarrinho(produto);

    await compra.realizarCheckout(testData.cliente);
    const totais = await compra.validarPrecoFinal(produto);

    await compra.finalizarEValidarConfirmacao();
    await compra.gerarPdfDaCompra(produto, totais, testData.cliente);
  });
});