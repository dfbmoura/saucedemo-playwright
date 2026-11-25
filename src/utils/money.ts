/**
 * Converte um texto com valor em dólar para centavos (número inteiro).
 * Exemplos:
 *   "$29.99"             -> 2999
 *   "Item total: $29.99" -> 2999
 *   "Tax: $2.40"         -> 240
 */
export function paraCentavos(texto: string): number {
  const somenteNumero = texto.replace(/[^0-9.]/g, '');
  return Math.round(Number(somenteNumero) * 100);
}

/** Converte centavos de volta para texto. Ex.: 3239 -> "$32.39" */
export function formatarCentavos(centavos: number): string {
  return `$${(centavos / 100).toFixed(2)}`;
}