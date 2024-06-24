import test, { expect } from '@playwright/test';
import { createUser, createUserWithSpace, deleteUser } from './db.utils';
import { alphanumericId } from './utils';
import { LoginPage } from './pages/login.page';
import { HomePage } from './pages/home.page';

test('Users can create a new space', async ({ page }) => {
  // Login with Existing User
  const password = '123456789';
  const existingUser = await createUser(password);
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await expect(loginPage.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await loginPage.login(existingUser.email, password);
  await page.waitForURL('/');
  await expect(page.getByRole('heading', { name: `Welcome ${existingUser.email}` })).toBeVisible();

  // Create a new space
  const homePage = new HomePage(page);
  const spaceName = 'Quito Lambda';
  const spaceSlug = alphanumericId(5);

  await homePage.createNewSpaceLink();
  await expect(homePage.page.getByRole('heading', { name: 'Create a space' })).toBeVisible();

  await homePage.createSpace(spaceName, spaceSlug);
  await expect(homePage.page.getByText("Space created successfully! You'll be redirected.")).toBeVisible();
  await expect(homePage.page.getByRole('heading', { name: spaceName, exact: true })).toBeVisible();

  // Remove User from DB:
  await deleteUser(existingUser.email);
});

test('Users can invite users to their space', async ({ browser }) => {
  // Create a browser with its own context for each user
  const firstUserContext = await browser.newContext();
  const loginPageFirstUser = new LoginPage(await firstUserContext.newPage());
  const firstUserPassword = '123456789';
  const space = { name: 'Quito Lambda', slug: alphanumericId(5) };
  const firstUser = await createUserWithSpace(firstUserPassword, space);

  const secondUserContext = await browser.newContext();
  const loginPageSecondUser = new LoginPage(await secondUserContext.newPage());
  const secondUserPassword = '123456789*';
  const secondUser = await createUser(secondUserPassword);

  // Login with the first user
  await loginPageFirstUser.goto();
  await expect(loginPageFirstUser.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await loginPageFirstUser.login(firstUser.email, firstUserPassword);
  await expect(loginPageFirstUser.page.getByRole('heading', { name: `Welcome ${firstUser.email}` })).toBeVisible();

  // Navigate to the space of the first user
  const homePageFirstUser = new HomePage(loginPageFirstUser.page);
  await homePageFirstUser.gotoSpace(space.name, space.slug);
  await expect(homePageFirstUser.page.getByRole('heading', { name: space.name, exact: true })).toBeVisible();

  // Invite the second user to the new space
  await homePageFirstUser.addCollaboratorButton.click();
  await expect(homePageFirstUser.page.getByRole('heading', { name: `Manage Members of ${space.name}` })).toBeVisible();

  await homePageFirstUser.addCollaboratorToSpace(secondUser.email);
  await expect(homePageFirstUser.page.getByText(secondUser.email)).toBeVisible();

  // Login with the second user
  await loginPageSecondUser.goto();
  await expect(loginPageSecondUser.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await loginPageSecondUser.login(secondUser.email, secondUserPassword);
  await expect(loginPageSecondUser.page.getByRole('heading', { name: `Welcome ${secondUser.email}` })).toBeVisible();

  // Check that the second user has access to the shared space
  const homePageSecondUser = new HomePage(loginPageSecondUser.page);
  await homePageSecondUser.gotoSpace(space.name, space.slug);
  await expect(homePageSecondUser.page.getByRole('heading', { name: space.name, exact: true })).toBeVisible();

  // Remove User from DB:
  await deleteUser(firstUser.email);
  await deleteUser(secondUser.email);
});
