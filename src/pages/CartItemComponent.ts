import { Locator, Page } from '@playwright/test';
import { Product } from '../data/types';
import { parseMoneyToCents } from '../utils/money';

/**
 * Componente reutilizável que representa uma linha de produto.
 * O SauceDemo usa a mesma estrutura (data-test="inventory-item") no
 * carrinho e na tela de resumo do checkout, então a leitura fica em um só lugar.
 */
export class CartItemComponent {
  readonly items: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
  }

  itemByName(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }

  async readAll(): Promise<Product[]> {
    const products: Product[] = [];
    for (const row of await this.items.all()) {
      products.push({
        name: (await row.getByTestId('inventory-item-name').innerText()).trim(),
        priceCents: parseMoneyToCents(await row.getByTestId('inventory-item-price').innerText()),
        quantity: Number((await row.getByTestId('item-quantity').innerText()).trim()),
      });
    }
    return products;
  }
}
