import { Page, test as base, expect } from '@playwright/test';
import { createUser, createUserOnSharedSpace, createUserWithSpace, deleteUser } from './db.utils';
import { LoginPage } from 'e2e/pages/login.page';
import { faker } from '@faker-js/faker';
import { HomePage } from './pages/home.page';
import { alphanumericId } from './utils';

type Account = {
  email: string;
  password: string;
};

type OnboardingFixtures = {
  existingUser: Account;
  newUser: Account;
  loginPage: LoginPage;
  authenticatedUser: Page;
  homePage: HomePage;
};

export const singleUserTest = base.extend<OnboardingFixtures>({
  existingUser: async ({}, use) => {
    const password = 'supersecurepassword';
    const newUser = await createUser(password);

    await use({
      email: newUser.email,
      password: password,
    });

    await deleteUser(newUser.email);
  },
  newUser: async ({}, use) => {
    const password = 'supersecurepassword';
    const newUserEmail = faker.internet.email();

    await use({
      email: newUserEmail,
      password: password,
    });

    await deleteUser(newUserEmail);
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  authenticatedUser: async ({ page, existingUser, loginPage }, use) => {
    await loginPage.goto();
    await expect(loginPage.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

    await loginPage.login(existingUser.email, existingUser.password);
    await expect(page.getByRole('heading', { name: `Welcome ${existingUser.email}` })).toBeVisible();

    await use(loginPage.page);
  },
});

type multipleUser = {
  sharedSpace: {
    name: string;
    slug: string;
  };
  mainUser: Account;
  collaboratorUser: Account;
  newCollaboratorUser: Account;
  loginMainUser: Page;
  loginCollaboratorUser: Page;
  loginNewCollaboratorUser(): Promise<Page>;
};

export const multipleAuthenticatedUserTest = base.extend<multipleUser>({
  sharedSpace: [{ name: 'Quito Lambda', slug: alphanumericId(5) }, { option: true }],
  mainUser: async ({ sharedSpace }, use) => {
    const password = 'supersecurepassword';
    const newUser = await createUserWithSpace(password, {
      ...sharedSpace,
    });

    await use({
      email: newUser.email,
      password: password,
    });

    await deleteUser(newUser.email);
  },
  collaboratorUser: async ({ sharedSpace }, use) => {
    const password = 'supersecurepassword';
    const newUser = await createUserOnSharedSpace(password, {
      ...sharedSpace,
    });

    await use({
      email: newUser.email,
      password: password,
    });

    await deleteUser(newUser.email);
  },
  newCollaboratorUser: async ({}, use) => {
    const password = 'supersecurepassword';
    const newUser = await createUser(password);

    await use({
      email: newUser.email,
      password: password,
    });

    await deleteUser(newUser.email);
  },
  loginMainUser: async ({ browser, mainUser }, use) => {
    const firstUserContext = await browser.newContext();
    const loginPageFirstUser = new LoginPage(await firstUserContext.newPage());

    await loginPageFirstUser.goto();
    await expect(loginPageFirstUser.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

    await loginPageFirstUser.login(mainUser.email, mainUser.password);
    await expect(loginPageFirstUser.page.getByRole('heading', { name: `Welcome ${mainUser.email}` })).toBeVisible();

    await use(loginPageFirstUser.page);
  },
  loginCollaboratorUser: async ({ browser, collaboratorUser }, use) => {
    const secondUserContext = await browser.newContext();
    const loginPageSecondUser = new LoginPage(await secondUserContext.newPage());

    await loginPageSecondUser.goto();
    await expect(loginPageSecondUser.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

    await loginPageSecondUser.login(collaboratorUser.email, collaboratorUser.password);
    await expect(
      loginPageSecondUser.page.getByRole('heading', { name: `Welcome ${collaboratorUser.email}` })
    ).toBeVisible();

    await use(loginPageSecondUser.page);
  },
  loginNewCollaboratorUser: async ({ browser, newCollaboratorUser }, use) => {
    await use(async () => {
      const userContext = await browser.newContext();
      const loginPage = new LoginPage(await userContext.newPage());

      await loginPage.goto();
      await expect(loginPage.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

      await loginPage.login(newCollaboratorUser.email, newCollaboratorUser.password);
      await expect(loginPage.page.getByRole('heading', { name: `Welcome ${newCollaboratorUser.email}` })).toBeVisible();

      return loginPage.page;
    });
  },
});

export { expect } from '@playwright/test';
