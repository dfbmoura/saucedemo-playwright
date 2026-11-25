export interface Cliente {
  nome: string;
  sobrenome: string;
  cep: string;
}

export interface Produto {
  nome: string;
  preco: string;   // como aparece na tela, ex.: "$29.99"
  quantidade: number;
}

export interface Totais {
  itemTotal: number; // em centavos
  taxa: number;      // em centavos
  total: number;     // em centavos
}

export const testData = {
  usuario: 'standard_user',
  produto: 'Sauce Labs Backpack',

  cliente: {
    nome: 'Diego',
    sobrenome: 'Moura',
    cep: '54000-000',
  } as Cliente,
  

  mensagens: {
    confirmacaoTitulo: 'Thank you for your order!',
    confirmacaoTexto: 'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
  },
};