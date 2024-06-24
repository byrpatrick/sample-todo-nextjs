import test, { expect } from '@playwright/test';
import { createUser, createUserWithSpace } from './db.utils';
import { nanoid } from 'nanoid';

const baseUrl = 'http://localhost:3000';

test('Users can create a new space', async ({ page }) => {
  // Login with Existing User
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

  // Create a new space
  await page.getByRole('link', { name: 'create a new one.' }).click();
  await page.waitForURL(`${baseUrl}/create-space`);
  await expect(page.getByRole('heading', { name: 'Create a space' })).toBeVisible();

  const spaceName = 'Quito Lambda';
  const spaceNameInput = page.getByLabel('Space name');
  await spaceNameInput.click();
  await spaceNameInput.fill(spaceName);

  const spaceSlug = 'quitolambda';
  const spaceSlugInput = page.getByLabel('Space slug');
  await spaceSlugInput.click();
  await spaceSlugInput.fill(spaceSlug);

  await page.getByRole('button', { name: 'Create' }).click();

  await expect(page.getByText("Space created successfully! You'll be redirected.")).toBeVisible();
  await page.waitForURL(`${baseUrl}/space/${spaceSlug}`);
  await expect(page.getByRole('heading', { name: spaceName, exact: true })).toBeVisible();
});

test('Users can invite users to their space', async ({ browser }) => {
  // Create a browser with its own context for each user
  const firstUserContext = await browser.newContext();
  const firstUserPage = await firstUserContext.newPage();

  const secondUserContext = await browser.newContext();
  const secondUserPage = await secondUserContext.newPage();

  const firstUserPassword = '123456789';
  const space = { name: 'Quito Lambda', slug: nanoid(5) };
  const firstUser = await createUserWithSpace(firstUserPassword, space);

  const secondUserPassword = '123456789*';
  const secondUser = await createUser(secondUserPassword);

  // Login with the first user
  await firstUserPage.goto(baseUrl);
  await firstUserPage.waitForURL(`${baseUrl}/signin`);
  await expect(firstUserPage.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  const emailInput = firstUserPage.getByLabel('Your email');
  await emailInput.click();
  await emailInput.fill(firstUser.email);

  const passwordInput = firstUserPage.getByLabel('Your password');
  await passwordInput.click();
  await passwordInput.fill(firstUserPassword);

  await firstUserPage.getByRole('button', { name: 'Login to your account' }).click();

  await firstUserPage.waitForURL(baseUrl);
  await expect(firstUserPage.getByRole('heading', { name: `Welcome ${firstUser.email}` })).toBeVisible();

  // Navigate to the space of the first user
  await firstUserPage.getByRole('link', { name: space.name, exact: true }).click();

  await firstUserPage.waitForURL(`${baseUrl}/space/${space.slug}`);
  await expect(firstUserPage.getByRole('heading', { name: space.name, exact: true })).toBeVisible();

  // Invite the second user to the new space
  await firstUserPage.getByText('+ Add collaborator').click();

  await expect(firstUserPage.getByRole('heading', { name: `Manage Members of ${space.name}` })).toBeVisible();
  await firstUserPage.getByPlaceholder('Type user email and enter to').click();
  await firstUserPage.getByPlaceholder('Type user email and enter to').fill(secondUser.email);
  await firstUserPage.getByPlaceholder('Type user email and enter to').press('Enter');
  await expect(firstUserPage.getByText(secondUser.email)).toBeVisible();

  // Login with the second user
  await secondUserPage.goto(baseUrl);
  await secondUserPage.waitForURL(`${baseUrl}/signin`);
  await expect(secondUserPage.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  const emailInputSecondUser = secondUserPage.getByLabel('Your email');
  await emailInputSecondUser.click();
  await emailInputSecondUser.fill(secondUser.email);

  const passwordInputSecondUser = secondUserPage.getByLabel('Your password');
  await passwordInputSecondUser.click();
  await passwordInputSecondUser.fill(secondUserPassword);

  await secondUserPage.getByRole('button', { name: 'Login to your account' }).click();

  await secondUserPage.waitForURL(baseUrl);
  await expect(secondUserPage.getByRole('heading', { name: `Welcome ${secondUser.email}` })).toBeVisible();

  // Check that the second user has access to the shared space
  await secondUserPage.getByRole('link', { name: space.name, exact: true }).click();

  await secondUserPage.waitForURL(`${baseUrl}/space/${space.slug}`);
  await expect(secondUserPage.getByRole('heading', { name: space.name, exact: true })).toBeVisible();
});
