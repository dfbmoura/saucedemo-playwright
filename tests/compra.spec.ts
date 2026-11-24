import { test } from '../src/fixtures/test';
import { testData } from '../src/data/test-data';

test.describe('Fluxo de compra - SauceDemo', () => {
  test('deve comprar um produto e gerar o comprovante em PDF', async ({ purchase }) => {
    await purchase.loginWithDisplayedCredentials();
    await purchase.validateProductsPage();

    const product = await purchase.addProductToCart(testData.product);
    await purchase.validateCart([product]);

    await purchase.checkout(testData.customer);
    const summary = await purchase.validateOrderTotal([product]);

    const confirmation = await purchase.finishAndValidateConfirmation();
    await purchase.generatePurchasePdf(testData.customer, summary, confirmation);
  });
});
