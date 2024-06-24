import test, { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { createUser, deleteUser } from './db.utils';

const baseUrl = 'http://localhost:3000';

test('can login as existing user', async ({ page }) => {
  const password = '123456789';
  const existingUser = await createUser(password);

  await page.goto(baseUrl);
  await page.waitForURL(`${baseUrl}/signin`);
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  const emailInput = page.getByLabel('Your email');
  await emailInput.click();
  await emailInput.fill(existingUser.email);

  const passwordInput = page.getByLabel('Your password');
  await passwordInput.click();
  await passwordInput.fill(password);

  await page.getByRole('button', { name: 'Login to your account' }).click();

  await page.waitForURL(baseUrl);
  await expect(page.getByRole('heading', { name: `Welcome ${existingUser.email}` })).toBeVisible();

  await deleteUser(existingUser.email);
});

test('can create a free account', async ({ page }) => {
  await page.goto(baseUrl);
  await page.waitForURL(`${baseUrl}/signin`);
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await page.getByRole('link', { name: 'Create account' }).click();

  await page.waitForURL(`${baseUrl}/signup`);
  await expect(page.getByRole('heading', { name: 'Create a Free Account' })).toBeVisible();

  const email = faker.internet.exampleEmail();
  const emailInput = page.getByLabel('Your email');
  await emailInput.click();
  await emailInput.fill(email);

  const password = faker.internet.password();
  const passwordInput = page.getByLabel('Your password');
  await passwordInput.click();
  await passwordInput.fill(password);

  await page.getByRole('checkbox', { name: 'I accept the Terms and Conditions' }).click();
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.waitForURL(baseUrl);
  await expect(page.getByRole('heading', { name: `Welcome ${email}` })).toBeVisible();

  await deleteUser(email);
});
