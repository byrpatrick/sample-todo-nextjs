import test, { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { createUser, deleteUser } from './db.utils';
import { LoginPage } from './pages/login.page';

test('can login as existing user', async ({ page }) => {
  const password = '123456789';
  const existingUser = await createUser(password);
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await expect(loginPage.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await loginPage.login(existingUser.email, password);
  await page.waitForURL('/');
  await expect(page.getByRole('heading', { name: `Welcome ${existingUser.email}` })).toBeVisible();

  await deleteUser(existingUser.email);
});

test('can create a free account', async ({ page }) => {
  const email = faker.internet.exampleEmail();
  const password = faker.internet.password();
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await expect(loginPage.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await loginPage.switchToRegisterMode();
  await expect(loginPage.page.getByRole('heading', { name: 'Create a Free Account' })).toBeVisible();

  await loginPage.register(email, password);
  await page.waitForURL('/');
  await expect(page.getByRole('heading', { name: `Welcome ${email}` })).toBeVisible();

  await deleteUser(email);
});
