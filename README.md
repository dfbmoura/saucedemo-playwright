# SauceDemo – Automação do fluxo de compra com Playwright

Desafio técnico de QA Automation: automação ponta a ponta do fluxo de compra em
[saucedemo.com](https://www.saucedemo.com/) com **Playwright + TypeScript**,
**Page Object Model** e **keywords customizadas**, gerando relatório, evidências
e o **comprovante da compra em PDF**.

## Cenário automatizado

O teste (`tests/compra.spec.ts`) é escrito em linguagem de negócio:

```ts
await compra.loginComCredenciaisDaTela();
await compra.validarPaginaDeProdutos();

const produto = await compra.adicionarAoCarrinho(testData.produto);
await compra.validarCarrinho(produto);

await compra.realizarCheckout(testData.cliente);
const totais = await compra.validarPrecoFinal(produto);

await compra.finalizarEValidarConfirmacao();
await compra.gerarPdfDaCompra(produto, totais, testData.cliente);
```

| # | Requisito | Keyword |
|---|-----------|---------|
| 1 | Login com as credenciais válidas exibidas na tela inicial (lidas da própria tela, não fixas no código) | `loginComCredenciaisDaTela` |
| 2 | Validar o acesso à página de produtos | `validarPaginaDeProdutos` |
| 3 | Selecionar um produto e adicioná-lo ao carrinho | `adicionarAoCarrinho` |
| 4 | Validar nome, quantidade e preço do produto | `validarCarrinho` |
| 5 | Realizar o checkout | `realizarCheckout` |
| 6 | Validar se o preço final é igual ao que foi comprado (`Item total` = preço comprado; `Total` = `Item total` + `Tax`) | `validarPrecoFinal` |
| 7 | Validar a mensagem de confirmação da compra | `finalizarEValidarConfirmacao` |
| 8 | Gerar o PDF da compra | `gerarPdfDaCompra` |

## Arquitetura

```
├── playwright.config.ts           # baseURL, testIdAttribute=data-test, reporters, evidências
├── src
│   ├── pages/                     # Page Objects: seletores e ações de cada tela
│   │   ├── BasePage.ts            # comum a todas as telas (título, carrinho, validação de URL)
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutInformationPage.ts
│   │   ├── CheckoutOverviewPage.ts
│   │   └── CheckoutCompletePage.ts
│   ├── components/
│   │   └── ProductList.ts         # lista de produtos reutilizada na vitrine, carrinho e resumo
│   ├── keywords/
│   │   └── PurchaseKeywords.ts    # keywords de negócio: compõem os Page Objects + validações
│   ├── fixtures/test.ts           # fixture "compra": injeta as keywords nos testes
│   ├── data/test-data.ts          # massa de dados e tipos (Cliente, Produto, Totais)
│   └── utils/
│       ├── evidence.ts            # wrapper de keyword: test.step + screenshot automático
│       ├── money.ts               # conversão de valores para centavos
│       └── pdf.ts                 # montagem e geração do comprovante em PDF
├── tests/compra.spec.ts
└── .github/workflows/playwright.yml
```

```
Teste (compra.spec.ts)        → O QUÊ: roteiro de negócio
   ↓ recebe pela fixture
Keywords (PurchaseKeywords)   → regras de negócio + validações + evidência
   ↓ usa
Page Objects + ProductList    → ONDE e COMO interagir com a tela
   ↓
saucedemo.com
```

### Decisões de projeto

- **Seletores estáveis:** o SauceDemo expõe `data-test` em todos os elementos. Com
  `testIdAttribute: 'data-test'`, os Page Objects usam `page.getByTestId()` em vez de CSS/XPath.
- **Credenciais lidas da tela:** o login lê usuários e senha exibidos na tela inicial,
  como pede o enunciado, e valida que o usuário está na lista.
- **Keywords customizadas:** cada keyword é um passo de negócio executado dentro de um
  `test.step` nomeado e anexa um screenshot ao final (ou da falha, se quebrar).
- **Sem duplicação:** herança (`BasePage`) para o comum a todas as telas, composição
  (`ProductList`) para a lista de produtos e fixture para eliminar setup nos testes.
- **Valores em centavos:** comparações de preço com inteiros evitam erros de ponto
  flutuante (em JavaScript, `0.1 + 0.2 = 0.30000000000000004`).
- **Comprovante em PDF:** montado com os dados coletados durante o teste e gerado com
  `page.pdf()` em uma aba auxiliar. Validado pela assinatura `%PDF-` do arquivo.

## Como executar

Pré-requisito: Node.js 18+.

```bash
npm install
npx playwright install chromium
npm test
```

| Comando | O que faz |
|---------|-----------|
| `npm test` | executa os testes |
| `npm run test:ui` | abre o modo UI do Playwright (timeline, passo a passo) |
| `npm run report` | abre o relatório HTML da última execução |

> A geração de PDF usa `page.pdf()`, suportado apenas no **Chromium em modo headless**.
> Por isso o projeto roda em Chromium e o fluxo completo deve ser executado sem `--headed`.

## Relatórios e evidências

| Artefato | Local |
|----------|-------|
| Relatório HTML (passos nomeados, screenshots, vídeo, trace e PDF anexado) | `reports/html/index.html` |
| Comprovante da compra | `reports/pdf/compra-<data-hora>.pdf` |
| JUnit (integração com CI) | `reports/junit/results.xml` |
| JSON | `reports/json/results.json` |
| Vídeos, traces e screenshots brutos | `test-results/` |

No GitHub Actions, os testes rodam a cada push e o relatório com as evidências fica
disponível como artefato `playwright-report` em cada execução.
