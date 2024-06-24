import { type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly addCollaboratorButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addCollaboratorButton = page.getByText('+ Add collaborator');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForURL(`/`);
  }

  async createNewSpaceLink() {
    await this.page.getByRole('link', { name: 'create a new one.' }).click();
    await this.page.waitForURL(`/create-space`);
  }

  async createSpace(name: string, slug: string) {
    const spaceNameInput = this.page.getByLabel('Space name');
    await spaceNameInput.click();
    await spaceNameInput.fill(name);

    const spaceSlugInput = this.page.getByLabel('Space slug');
    await spaceSlugInput.click();
    await spaceSlugInput.fill(slug);

    await this.page.getByRole('button', { name: 'Create' }).click();

    await this.page.waitForURL(`/space/${slug}`);
  }

  async gotoSpace(name: string, slug: string) {
    await this.page.getByRole('link', { name: name, exact: true }).click();
    await this.page.waitForURL(`/space/${slug}`);
  }

  async addCollaboratorToSpace(email: string) {
    await this.page.getByPlaceholder('Type user email and enter to').click();
    await this.page.getByPlaceholder('Type user email and enter to').fill(email);
    await this.page.getByPlaceholder('Type user email and enter to').press('Enter');
  }
}
