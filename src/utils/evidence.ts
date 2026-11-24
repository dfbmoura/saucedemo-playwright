import { Page, TestInfo, test } from '@playwright/test';

/** Anexa ao relatório um screenshot de página inteira com o nome informado. */
export async function attachScreenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const body = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, { body, contentType: 'image/png' });
}

/**
 * Base das keywords customizadas: executa o corpo dentro de um test.step
 * (aparece nomeado no relatório HTML) e, ao final, anexa um screenshot como evidência.
 * Em caso de falha, também registra a evidência do momento do erro.
 */
export async function keyword<T>(
  title: string,
  page: Page,
  testInfo: TestInfo,
  body: () => Promise<T>,
): Promise<T> {
  return test.step(title, async () => {
    try {
      const result = await body();
      await attachScreenshot(page, testInfo, `Evidência - ${title}`);
      return result;
    } catch (error) {
      await attachScreenshot(page, testInfo, `FALHA - ${title}`).catch(() => undefined);
      throw error;
    }
  }, { box: true });
}
