import { BrowserContext } from '@playwright/test';
import { Customer, OrderSummary } from '../data/types';
import { formatCents } from './money';

export interface ReceiptData {
  orderId: string;
  purchasedAt: Date;
  username: string;
  customer: Customer;
  summary: OrderSummary;
  confirmationHeader: string;
  confirmationText: string;
  /** Screenshot (PNG) da tela de confirmação, embutido no PDF como evidência. */
  confirmationScreenshot: Buffer;
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function buildReceiptHtml(data: ReceiptData): string {
  const rows = data.summary.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${formatCents(item.priceCents)}</td>
          <td class="num">${formatCents(item.priceCents * item.quantity)}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1f2933; margin: 0; padding: 32px 40px; font-size: 12px; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #3ddc91; padding-bottom: 12px; }
  h1 { margin: 0; font-size: 22px; }
  .muted { color: #6b7280; }
  .status { background: #e7f9f0; color: #0f7a4a; font-weight: bold; padding: 6px 12px; border-radius: 4px; }
  h2 { font-size: 14px; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: .04em; color: #374151; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
  th { background: #f3f4f6; }
  .num { text-align: right; }
  .totals { width: 280px; margin-left: auto; margin-top: 8px; }
  .totals td { border: none; padding: 4px 8px; }
  .totals .grand td { border-top: 2px solid #1f2933; font-weight: bold; font-size: 14px; }
  .confirmation { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; }
  img { width: 100%; border: 1px solid #e5e7eb; margin-top: 8px; }
  footer { margin-top: 24px; font-size: 10px; }
</style>
</head>
<body>
  <header>
    <div>
      <h1>Comprovante de compra</h1>
      <div class="muted">Swag Labs (saucedemo.com) &middot; gerado automaticamente pelo Playwright</div>
    </div>
    <div class="status">COMPRA CONCLUÍDA</div>
  </header>

  <h2>Dados do pedido</h2>
  <div class="grid">
    <div><b>Pedido:</b> ${escapeHtml(data.orderId)}</div>
    <div><b>Data/hora:</b> ${data.purchasedAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</div>
    <div><b>Usuário:</b> ${escapeHtml(data.username)}</div>
    <div><b>Cliente:</b> ${escapeHtml(`${data.customer.firstName} ${data.customer.lastName}`)}</div>
    <div><b>CEP:</b> ${escapeHtml(data.customer.postalCode)}</div>
    <div><b>Pagamento:</b> ${escapeHtml(data.summary.paymentInfo)}</div>
    <div><b>Entrega:</b> ${escapeHtml(data.summary.shippingInfo)}</div>
  </div>

  <h2>Itens</h2>
  <table>
    <thead><tr><th>Produto</th><th class="num">Qtd.</th><th class="num">Preço unit.</th><th class="num">Subtotal</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="totals">
    <tr><td>Item total</td><td class="num">${formatCents(data.summary.itemTotalCents)}</td></tr>
    <tr><td>Taxa</td><td class="num">${formatCents(data.summary.taxCents)}</td></tr>
    <tr class="grand"><td>Total</td><td class="num">${formatCents(data.summary.totalCents)}</td></tr>
  </table>

  <h2>Confirmação</h2>
  <div class="confirmation">
    <b>${escapeHtml(data.confirmationHeader)}</b><br />
    <span>${escapeHtml(data.confirmationText)}</span>
    <img src="data:image/png;base64,${data.confirmationScreenshot.toString('base64')}" alt="Tela de confirmação" />
  </div>

  <footer class="muted">Evidência de execução automatizada &mdash; desafio técnico QA Automation.</footer>
</body>
</html>`;
}

/**
 * Renderiza o comprovante em uma aba auxiliar do mesmo contexto e gera o PDF.
 * Observação: page.pdf() é suportado apenas no Chromium.
 */
export async function generateReceiptPdf(context: BrowserContext, data: ReceiptData, outputPath: string): Promise<Buffer> {
  const page = await context.newPage();
  try {
    await page.setContent(buildReceiptHtml(data), { waitUntil: 'load' });
    return await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' },
    });
  } finally {
    await page.close();
  }
}
