import { type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/signin');
    await this.page.waitForURL(`/signin`);
  }

  async login(email: string, password: string) {
    const emailInput = this.page.getByLabel('Your email');
    await emailInput.click();
    await emailInput.fill(email);

    const passwordInput = this.page.getByLabel('Your password');
    await passwordInput.click();
    await passwordInput.fill(password);

    await this.page.getByRole('button', { name: 'Login to your account' }).click();
  }

  async switchToRegisterMode() {
    await this.page.getByRole('link', { name: 'Create account' }).click();
    await this.page.waitForURL(`/signup`);
  }

  async register(email: string, password: string) {
    const emailInput = this.page.getByLabel('Your email');
    await emailInput.click();
    await emailInput.fill(email);

    const passwordInput = this.page.getByLabel('Your password');
    await passwordInput.click();
    await passwordInput.fill(password);

    await this.page.getByRole('checkbox', { name: 'I accept the Terms and Conditions' }).click();
    await this.page.getByRole('button', { name: 'Create account' }).click();
  }
}
