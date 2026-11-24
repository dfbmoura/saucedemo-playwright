# SauceDemo – Automação do fluxo de compra com Playwright

Desafio técnico de QA Automation: automação ponta a ponta do fluxo de compra em
[saucedemo.com](https://www.saucedemo.com/) usando **Playwright + TypeScript**,
**Page Object Model** e **keywords customizadas**, com relatório, evidências e
comprovante da compra em **PDF**.

## Cenário automatizado

| # | Requisito | Onde está |
|---|-----------|-----------|
| 1 | Login com as credenciais válidas exibidas na tela inicial (lidas da própria tela, não fixas no código) | `loginWithDisplayedCredentials` |
| 2 | Validar acesso à página de produtos | `validateProductsPage` |
| 3 | Selecionar um produto e adicionar ao carrinho | `addProductToCart` |
| 4 | Validar nome, quantidade e preço no carrinho | `validateCart` |
| 5 | Realizar o checkout | `checkout` |
| 6 | Validar que o preço final corresponde ao que foi comprado (`Item total` = soma dos produtos; `Total` = `Item total` + `Tax`) | `validateOrderTotal` |
| 7 | Validar a mensagem de confirmação da compra | `finishAndValidateConfirmation` |
| 8 | Gerar o PDF da compra | `generatePurchasePdf` |

O teste (`tests/compra.spec.ts`) fica em linguagem de negócio:

```ts
await purchase.loginWithDisplayedCredentials();
await purchase.validateProductsPage();
const product = await purchase.addProductToCart(testData.product);
await purchase.validateCart([product]);
await purchase.checkout(testData.customer);
const summary = await purchase.validateOrderTotal([product]);
const confirmation = await purchase.finishAndValidateConfirmation();
await purchase.generatePurchasePdf(testData.customer, summary, confirmation);
```

## Arquitetura

```
├── playwright.config.ts        # baseURL, testIdAttribute=data-test, reporters, evidências
├── src
│   ├── pages/                  # Page Objects (somente seletores e ações de tela)
│   │   ├── BasePage.ts         # título, carrinho, validação de URL (herdado pelas páginas)
│   │   ├── CartItemComponent.ts# leitura de itens, reutilizada no carrinho e no resumo
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutInformationPage.ts
│   │   ├── CheckoutOverviewPage.ts
│   │   └── CheckoutCompletePage.ts
│   ├── keywords/
│   │   └── PurchaseKeywords.ts # keywords de negócio (compõem os Page Objects + asserções)
│   ├── fixtures/test.ts        # fixture que injeta as keywords nos testes
│   ├── data/                   # massa de dados e tipos
│   └── utils/
│       ├── evidence.ts         # wrapper de keyword: test.step + screenshot automático
│       ├── money.ts            # parse/format de valores em centavos
│       └── receipt-pdf.ts      # geração do comprovante em PDF
├── tests/compra.spec.ts
└── .github/workflows/playwright.yml  # execução em CI com upload do relatório
```

**Decisões de projeto**

- **Seletores estáveis**: o SauceDemo expõe `data-test` em todos os elementos; o
  `testIdAttribute` foi configurado para usar `page.getByTestId()` em vez de CSS/XPath.
- **Keywords customizadas**: cada keyword roda dentro de um `test.step` nomeado
  (aparece no relatório HTML) e anexa um screenshot ao final — ou um screenshot de
  falha, se quebrar. Assim toda keyword gera evidência sem código repetido.
- **Sem duplicação**: `BasePage` concentra comportamentos comuns; `CartItemComponent`
  é reaproveitado no carrinho e no resumo do checkout; a fixture elimina setup nos specs.
- **Valores em centavos**: as comparações de preço usam inteiros, evitando erro de
  ponto flutuante (ex.: `29.99 + 2.40`).
- **Dados configuráveis**: usuário e produto podem ser trocados por variável de ambiente
  sem alterar código.

## Como executar

Pré-requisito: Node.js 18+.

```bash
npm install
npx playwright install chromium
npm test
```

Outros comandos:

```bash
npm run test:headed     # executa com o navegador visível
npm run report          # abre o relatório HTML
npm run typecheck       # checagem de tipos

# trocar produto/usuário sem alterar código
SAUCE_PRODUCT="Sauce Labs Bike Light" npm test
```

> A geração de PDF usa `page.pdf()`, suportado apenas no Chromium — por isso o
> projeto está configurado com o projeto `chromium`.

## Relatórios e evidências

Após a execução:

| Artefato | Local |
|----------|-------|
| Relatório HTML (steps, screenshots por keyword, vídeo, trace, PDF anexado) | `reports/html/index.html` |
| Comprovante da compra em PDF | `reports/pdf/compra-<timestamp>.pdf` |
| JUnit (para CI) | `reports/junit/results.xml` |
| JSON | `reports/json/results.json` |
| Vídeos, traces e screenshots brutos | `test-results/` |

O PDF traz os dados do pedido (usuário, cliente, pagamento, entrega), itens com
quantidade e preço, item total, taxa, total e a mensagem de confirmação com o
screenshot da tela final.

No GitHub Actions, o relatório e as evidências ficam disponíveis como artefato
`playwright-report` em cada execução.
