import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly acceptedUsernames: Locator;
  readonly passwordHint: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.acceptedUsernames = page.getByTestId('login-credentials');
    this.passwordHint = page.getByTestId('login-password');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.loginButton).toBeVisible();
  }

  /** Lê os usuários e a senha exibidos na parte de baixo da tela de login. */
  async getDisplayedCredentials() {
    const textoUsuarios = await this.acceptedUsernames.innerText();
    const textoSenha = await this.passwordHint.innerText();

    const usuarios = textoUsuarios
      .split('\n')
      .map((linha) => linha.trim())
      .filter((linha) => linha !== '' && !linha.endsWith(':'));

    const senha = textoSenha
      .split('\n')
      .map((linha) => linha.trim())
      .filter((linha) => linha !== '' && !linha.endsWith(':'))[0];

    return { usuarios, senha };
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}