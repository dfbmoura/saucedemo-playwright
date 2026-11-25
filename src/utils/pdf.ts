import { BrowserContext } from '@playwright/test';
import { Cliente, Produto, Totais } from '../data/test-data';
import { formatarCentavos, paraCentavos } from './money';

export interface DadosComprovante {
  usuario: string;
  cliente: Cliente;
  produto: Produto;
  totais: Totais;
  mensagem: string;
  printConfirmacao: Buffer;
}

/** Monta o HTML do comprovante com os dados coletados durante o teste. */
export function montarHtmlComprovante(dados: DadosComprovante): string {
  const dataHora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const subtotalItem = paraCentavos(dados.produto.preco) * dados.produto.quantidade;
  const imagemBase64 = dados.printConfirmacao.toString('base64');

  return `
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body  { font-family: Arial, sans-serif; padding: 30px; color: #222; font-size: 13px; }
      h1    { border-bottom: 3px solid #3ddc91; padding-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
      th    { background: #f3f3f3; }
      .valor { text-align: right; }
      .total { font-weight: bold; font-size: 15px; }
      img   { width: 100%; border: 1px solid #ddd; margin-top: 10px; }
    </style>
  </head>
  <body>
    <h1>Comprovante de compra - SauceDemo</h1>
    <p><b>Data/hora:</b> ${dataHora}</p>
    <p><b>Usuário:</b> ${dados.usuario}</p>
    <p><b>Cliente:</b> ${dados.cliente.nome} ${dados.cliente.sobrenome} - CEP ${dados.cliente.cep}</p>

    <h2>Itens</h2>
    <table>
      <tr><th>Produto</th><th>Qtd.</th><th class="valor">Preço</th><th class="valor">Subtotal</th></tr>
      <tr>
        <td>${dados.produto.nome}</td>
        <td>${dados.produto.quantidade}</td>
        <td class="valor">${dados.produto.preco}</td>
        <td class="valor">${formatarCentavos(subtotalItem)}</td>
      </tr>
    </table>

    <table style="width: 300px; margin-left: auto;">
      <tr><td>Item total</td><td class="valor">${formatarCentavos(dados.totais.itemTotal)}</td></tr>
      <tr><td>Taxa</td><td class="valor">${formatarCentavos(dados.totais.taxa)}</td></tr>
      <tr class="total"><td>Total</td><td class="valor">${formatarCentavos(dados.totais.total)}</td></tr>
    </table>

    <h2>Confirmação</h2>
    <p><b>${dados.mensagem}</b></p>
    <img src="data:image/png;base64,${imagemBase64}" />
  </body>
  </html>`;
}

/** Abre o HTML numa aba auxiliar, gera o PDF e fecha a aba. */
export async function gerarPdf(contexto: BrowserContext, html: string, caminho: string): Promise<Buffer> {
  const abaAuxiliar = await contexto.newPage();
  try {
    await abaAuxiliar.setContent(html);
    return await abaAuxiliar.pdf({
      path: caminho,
      format: 'A4',
      printBackground: true,
    });
  } finally {
    await abaAuxiliar.close();
  }
}