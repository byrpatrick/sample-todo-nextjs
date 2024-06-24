import test, { expect } from '@playwright/test';
import { createUser, createUserOnSharedSpace, createUserWithSpace } from './db.utils';
import { nanoid } from 'nanoid';

const baseUrl = 'http://localhost:3000';

test('Collaborators can see a public list on a shared space', async ({ browser }) => {
  // Create a browser with its own context for each user
  const firstUserContext = await browser.newContext();
  const firstUserPage = await firstUserContext.newPage();

  const secondUserContext = await browser.newContext();
  const secondUserPage = await secondUserContext.newPage();

  const firstUserPassword = '123456789';
  const space = { name: 'Quito Lambda', slug: nanoid(5) };
  const firstUser = await createUserWithSpace(firstUserPassword, space);

  const secondUserPassword = '123456789*';
  const secondUser = await createUserOnSharedSpace(secondUserPassword, { slug: space.slug });

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

  // Users Navigate to shared space
  await firstUserPage.getByRole('link', { name: space.name, exact: true }).click();

  await firstUserPage.waitForURL(`${baseUrl}/space/${space.slug}`);
  await expect(firstUserPage.getByRole('heading', { name: space.name, exact: true })).toBeVisible();

  await secondUserPage.getByRole('link', { name: space.name, exact: true }).click();

  await secondUserPage.waitForURL(`${baseUrl}/space/${space.slug}`);
  await expect(secondUserPage.getByRole('heading', { name: space.name, exact: true })).toBeVisible();

  // Create a public list with first user
  await firstUserPage.getByText('Create a list').click();

  await expect(firstUserPage.getByRole('heading', { name: 'Create a Todo list' })).toBeVisible();

  const newPublicList = 'E2E Playwright!';
  const inputTodoAdmin = firstUserPage.getByPlaceholder('Title of your list');
  await inputTodoAdmin.click();
  await inputTodoAdmin.fill(newPublicList);

  await firstUserPage.getByRole('button', { name: 'Create' }).click();

  await expect(firstUserPage.getByText('List created successfully!')).toBeVisible();
  await expect(firstUserPage.getByRole('heading', { name: newPublicList })).toBeVisible();

  await firstUserPage.getByRole('link', { name: newPublicList }).click();

  await expect(firstUserPage.getByRole('heading', { name: newPublicList })).toBeVisible();
  await firstUserPage.waitForURL(/^http:\/\/localhost:3000\/space\/[^\/]+\/[^\/]+$/);
  await expect(firstUserPage.getByPlaceholder('Type a title and press enter')).toBeVisible();

  // Check that the second user can see and access the created list
  await expect(secondUserPage.getByRole('heading', { name: newPublicList })).toBeVisible();

  await secondUserPage.getByRole('link', { name: newPublicList }).click();

  await expect(secondUserPage.getByRole('heading', { name: newPublicList })).toBeVisible();
  await secondUserPage.waitForURL(firstUserPage.url());
  await expect(secondUserPage.getByPlaceholder('Type a title and press enter')).toBeVisible();
});

test('Collaborators can not see a private list on a shared space', async ({ browser }) => {
  // Create a browser with its own context for each user
  const firstUserContext = await browser.newContext();
  const firstUserPage = await firstUserContext.newPage();

  const secondUserContext = await browser.newContext();
  const secondUserPage = await secondUserContext.newPage();

  const firstUserPassword = '123456789';
  const space = { name: 'Quito Lambda', slug: nanoid(5) };
  const firstUser = await createUserWithSpace(firstUserPassword, space);

  const secondUserPassword = '123456789*';
  const secondUser = await createUserOnSharedSpace(secondUserPassword, { slug: space.slug });

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

  // Users Navigate to shared space
  await firstUserPage.getByRole('link', { name: space.name, exact: true }).click();

  await firstUserPage.waitForURL(`${baseUrl}/space/${space.slug}`);
  await expect(firstUserPage.getByRole('heading', { name: space.name, exact: true })).toBeVisible();

  await secondUserPage.getByRole('link', { name: space.name, exact: true }).click();

  await secondUserPage.waitForURL(`${baseUrl}/space/${space.slug}`);
  await expect(secondUserPage.getByRole('heading', { name: space.name, exact: true })).toBeVisible();

  // Create a private list with first user
  await firstUserPage.getByText('Create a list').click();

  await expect(firstUserPage.getByRole('heading', { name: 'Create a Todo list' })).toBeVisible();

  const privateListFirstUser = 'E2E Playwright!';
  const inputTodoAdmin = firstUserPage.getByPlaceholder('Title of your list');
  await inputTodoAdmin.click();
  await inputTodoAdmin.fill(privateListFirstUser);
  await firstUserPage.getByLabel('Private').check();

  await firstUserPage.getByRole('button', { name: 'Create' }).click();

  await expect(firstUserPage.getByText('List created successfully!')).toBeVisible();
  await expect(firstUserPage.getByRole('heading', { name: privateListFirstUser })).toBeVisible();

  await firstUserPage.getByRole('link', { name: privateListFirstUser }).click();

  await expect(firstUserPage.getByRole('heading', { name: privateListFirstUser })).toBeVisible();
  await firstUserPage.waitForURL(/^http:\/\/localhost:3000\/space\/[^\/]+\/[^\/]+$/);
  await expect(firstUserPage.getByPlaceholder('Type a title and press enter')).toBeVisible();

  // Check that the second user can not see or access the created list
  await expect(secondUserPage.getByRole('heading', { name: privateListFirstUser })).not.toBeVisible();
  const unreacheablePath = firstUserPage.url();
  await secondUserPage.goto(unreacheablePath);

  await expect(secondUserPage.getByRole('heading', { name: 'This page could not be found.' })).toBeVisible();
});
