import { expect, Locator, Page } from '@playwright/test';
import { Credentials } from '../data/types';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly acceptedUsernames: Locator;
  readonly passwordHint: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error');
    this.acceptedUsernames = page.getByTestId('login-credentials');
    this.passwordHint = page.getByTestId('login-password');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Lê as credenciais exibidas na própria tela inicial
   * ("Accepted usernames are:" / "Password for all users:"),
   * em vez de deixá-las fixas no código.
   */
  async getDisplayedCredentials(): Promise<{ usernames: string[]; password: string }> {
    const usernames = (await this.acceptedUsernames.innerText())
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.endsWith(':'));

    const password = (await this.passwordHint.innerText())
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.endsWith(':'))
      .pop();

    if (!usernames.length || !password) {
      throw new Error('Não foi possível ler as credenciais exibidas na tela de login.');
    }
    return { usernames, password };
  }

  async login({ username, password }: Credentials): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
