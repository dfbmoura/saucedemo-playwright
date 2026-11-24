export interface Credentials {
  username: string;
  password: string;
}

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Produto como foi visto/comprado. Valores monetários em centavos para evitar erro de ponto flutuante. */
export interface Product {
  name: string;
  priceCents: number;
  quantity: number;
}

export interface OrderSummary {
  items: Product[];
  paymentInfo: string;
  shippingInfo: string;
  itemTotalCents: number;
  taxCents: number;
  totalCents: number;
}
