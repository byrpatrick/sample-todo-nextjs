import test, { expect } from '@playwright/test';
import { createUserOnSharedSpace, createUserWithSpace, deleteUser } from './db.utils';
import { alphanumericId } from './utils';
import { LoginPage } from './pages/login.page';
import { HomePage } from './pages/home.page';
import { SpacePage } from './pages/space.page';

test('Collaborators can see a public list on a shared space', async ({ browser }) => {
  // Create a browser with its own context for each user
  const firstUserContext = await browser.newContext();
  const loginPageFirstUser = new LoginPage(await firstUserContext.newPage());
  const firstUserPassword = '123456789';
  const space = { name: 'Quito Lambda', slug: alphanumericId(5) };
  const firstUser = await createUserWithSpace(firstUserPassword, space);

  const secondUserContext = await browser.newContext();
  const loginPageSecondUser = new LoginPage(await secondUserContext.newPage());
  const secondUserPassword = '123456789*';
  const secondUser = await createUserOnSharedSpace(secondUserPassword, { slug: space.slug });

  // Login with the first user
  await loginPageFirstUser.goto();
  await expect(loginPageFirstUser.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await loginPageFirstUser.login(firstUser.email, firstUserPassword);
  await expect(loginPageFirstUser.page.getByRole('heading', { name: `Welcome ${firstUser.email}` })).toBeVisible();

  // Login with the second user
  await loginPageSecondUser.goto();
  await expect(loginPageSecondUser.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await loginPageSecondUser.login(secondUser.email, secondUserPassword);
  await expect(loginPageSecondUser.page.getByRole('heading', { name: `Welcome ${secondUser.email}` })).toBeVisible();

  // Users Navigate to shared space
  const homePageFirstUser = new HomePage(loginPageFirstUser.page);
  await homePageFirstUser.gotoSpace(space.name, space.slug);
  await expect(homePageFirstUser.page.getByRole('heading', { name: space.name, exact: true })).toBeVisible();

  const homePageSecondUser = new HomePage(loginPageSecondUser.page);
  await homePageSecondUser.gotoSpace(space.name, space.slug);
  await expect(homePageSecondUser.page.getByRole('heading', { name: space.name, exact: true })).toBeVisible();

  // Create a public list with first user
  const spacePageFirstUser = new SpacePage(homePageFirstUser.page);
  const newPublicList = 'E2E Playwright!';

  await spacePageFirstUser.createListBtn.click();
  await expect(spacePageFirstUser.page.getByRole('heading', { name: 'Create a Todo list' })).toBeVisible();

  await spacePageFirstUser.createPublicList(newPublicList);
  await expect(spacePageFirstUser.page.getByText('List created successfully!')).toBeVisible();
  await expect(spacePageFirstUser.page.getByRole('heading', { name: newPublicList })).toBeVisible();

  await spacePageFirstUser.gotoList(newPublicList);
  await expect(spacePageFirstUser.page.getByRole('heading', { name: newPublicList })).toBeVisible();
  await expect(spacePageFirstUser.page.getByPlaceholder('Type a title and press enter')).toBeVisible();

  // Check that the second user can see and access the created list
  const spacePageSecondUser = new SpacePage(homePageSecondUser.page);
  await expect(spacePageSecondUser.page.getByRole('heading', { name: newPublicList })).toBeVisible();

  await spacePageSecondUser.gotoList(newPublicList);
  await expect(spacePageSecondUser.page.getByRole('heading', { name: newPublicList })).toBeVisible();
  await expect(spacePageSecondUser.page.getByPlaceholder('Type a title and press enter')).toBeVisible();

  // Remove User from DB:
  await deleteUser(firstUser.email);
  await deleteUser(secondUser.email);
});

test('Collaborators can not see a private list on a shared space', async ({ browser }) => {
  // Create a browser with its own context for each user
  const firstUserContext = await browser.newContext();
  const loginPageFirstUser = new LoginPage(await firstUserContext.newPage());
  const firstUserPassword = '123456789';
  const space = { name: 'Quito Lambda', slug: alphanumericId(5) };
  const firstUser = await createUserWithSpace(firstUserPassword, space);

  const secondUserContext = await browser.newContext();
  const loginPageSecondUser = new LoginPage(await secondUserContext.newPage());
  const secondUserPassword = '123456789*';
  const secondUser = await createUserOnSharedSpace(secondUserPassword, { slug: space.slug });

  // Login with the first user
  await loginPageFirstUser.goto();
  await expect(loginPageFirstUser.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await loginPageFirstUser.login(firstUser.email, firstUserPassword);
  await expect(loginPageFirstUser.page.getByRole('heading', { name: `Welcome ${firstUser.email}` })).toBeVisible();

  // Login with the second user
  await loginPageSecondUser.goto();
  await expect(loginPageSecondUser.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await loginPageSecondUser.login(secondUser.email, secondUserPassword);
  await expect(loginPageSecondUser.page.getByRole('heading', { name: `Welcome ${secondUser.email}` })).toBeVisible();

  // Users Navigate to shared space
  const homePageFirstUser = new HomePage(loginPageFirstUser.page);
  await homePageFirstUser.gotoSpace(space.name, space.slug);
  await expect(homePageFirstUser.page.getByRole('heading', { name: space.name, exact: true })).toBeVisible();

  const homePageSecondUser = new HomePage(loginPageSecondUser.page);
  await homePageSecondUser.gotoSpace(space.name, space.slug);
  await expect(homePageSecondUser.page.getByRole('heading', { name: space.name, exact: true })).toBeVisible();

  // Create a private list with first user
  const spacePageFirstUser = new SpacePage(homePageFirstUser.page);
  const newPrivateList = 'E2E Playwright!';

  await spacePageFirstUser.createListBtn.click();
  await expect(spacePageFirstUser.page.getByRole('heading', { name: 'Create a Todo list' })).toBeVisible();

  await spacePageFirstUser.createPrivateList(newPrivateList);
  await expect(spacePageFirstUser.page.getByText('List created successfully!')).toBeVisible();
  await expect(spacePageFirstUser.page.getByRole('heading', { name: newPrivateList })).toBeVisible();

  await spacePageFirstUser.gotoList(newPrivateList);
  await expect(spacePageFirstUser.page.getByRole('heading', { name: newPrivateList })).toBeVisible();
  await expect(spacePageFirstUser.page.getByPlaceholder('Type a title and press enter')).toBeVisible();

  // Check that the second user can not see or access the created list
  const spacePageSecondUser = new SpacePage(homePageSecondUser.page);
  await expect(spacePageSecondUser.page.getByRole('heading', { name: newPrivateList })).not.toBeVisible();

  const unreacheablePath = spacePageFirstUser.page.url();
  await spacePageSecondUser.page.goto(unreacheablePath);
  await expect(spacePageSecondUser.page.getByRole('heading', { name: 'This page could not be found.' })).toBeVisible();

  // Remove User from DB:
  await deleteUser(firstUser.email);
  await deleteUser(secondUser.email);
});
