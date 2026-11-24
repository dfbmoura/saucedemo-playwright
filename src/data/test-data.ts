import { Customer } from './types';

/**
 * Massa de dados centralizada. Pode ser sobrescrita por variáveis de ambiente
 * sem alterar o código dos testes.
 */
export const testData = {
  /** Usuário válido exibido na tela de login (as credenciais são lidas da própria tela). */
  username: process.env.SAUCE_USER ?? 'standard_user',

  product: process.env.SAUCE_PRODUCT ?? 'Sauce Labs Backpack',

  customer: {
    firstName: 'Diego',
    lastName: 'Moura',
    postalCode: '54000-000',
  } satisfies Customer,

  messages: {
    productsTitle: 'Products',
    cartTitle: 'Your Cart',
    overviewTitle: 'Checkout: Overview',
    completeTitle: 'Checkout: Complete!',
    completeHeader: 'Thank you for your order!',
    completeText: 'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
  },
} as const;
