import { Page, TestInfo, test } from '@playwright/test';

/**
 * Executa uma keyword:
 *  - registra um passo com nome no relatório (test.step);
 *  - anexa um screenshot ao final (evidência);
 *  - se falhar, anexa o screenshot do momento do erro e repassa o erro.
 */
export async function keyword<T>(
  titulo: string,
  page: Page,
  testInfo: TestInfo,
  acao: () => Promise<T>,
): Promise<T> {
  return test.step(titulo, async () => {
    try {
      const resultado = await acao();
      await anexarPrint(page, testInfo, `Evidência - ${titulo}`);
      return resultado;
    } catch (erro) {
      await anexarPrint(page, testInfo, `FALHA - ${titulo}`);
      throw erro;
    }
  }, { box: true });
}

async function anexarPrint(page: Page, testInfo: TestInfo, nome: string) {
  try {
    const imagem = await page.screenshot({ fullPage: true });
    await testInfo.attach(nome, { body: imagem, contentType: 'image/png' });
  } catch {
    // se nem o print for possível (ex.: navegador fechou), não esconde o erro original
  }
}