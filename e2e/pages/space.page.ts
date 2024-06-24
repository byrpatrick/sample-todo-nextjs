import { type Locator, type Page } from '@playwright/test';

export class SpacePage {
  readonly page: Page;
  readonly createListBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createListBtn = page.getByText('Create a list');
  }

  async goto(slug: string) {
    await this.page.goto('/space');
    await this.page.waitForURL(`/space/${slug}`);
  }

  async createPublicList(title: string) {
    const inputTodoAdmin = this.page.getByPlaceholder('Title of your list');
    await inputTodoAdmin.click();
    await inputTodoAdmin.fill(title);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async createPrivateList(title: string) {
    const inputTodoAdmin = this.page.getByPlaceholder('Title of your list');
    await inputTodoAdmin.click();
    await inputTodoAdmin.fill(title);
    await this.page.getByLabel('Private').check();
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async gotoList(listTitle: string) {
    await this.page.getByRole('link', { name: listTitle }).click();
    await this.page.waitForURL(/^http:\/\/localhost:3000\/space\/[^\/]+\/[^\/]+$/);
  }
}
