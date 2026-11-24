/**
 * Converte textos monetários do site ("$29.99", "Item total: $29.99", "Tax: $2.40")
 * para centavos (inteiro), evitando problemas de ponto flutuante nas comparações.
 */
export function parseMoneyToCents(text: string): number {
  const match = text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
  if (!match) {
    throw new Error(`Não foi possível extrair um valor monetário de: "${text}"`);
  }
  const [intPart, decPart = '0'] = match[1].replace(/,/g, '').split('.');
  return Number(intPart) * 100 + Number(decPart.padEnd(2, '0'));
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function sumCents(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}
