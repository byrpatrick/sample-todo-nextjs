import { expect, singleUserTest } from './fixtures';

singleUserTest('can login as existing user', async ({ loginPage, page, existingUser }) => {
  await loginPage.goto();
  await expect(loginPage.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await loginPage.login(existingUser.email, existingUser.password);
  await page.waitForURL('/');
  await expect(page.getByRole('heading', { name: `Welcome ${existingUser.email}` })).toBeVisible();
});

singleUserTest('can create a free account', async ({ loginPage, page, newUser }) => {
  await loginPage.goto();
  await expect(loginPage.page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

  await loginPage.switchToRegisterMode();
  await expect(loginPage.page.getByRole('heading', { name: 'Create a Free Account' })).toBeVisible();

  await loginPage.register(newUser.email, newUser.password);
  await page.waitForURL('/');
  await expect(page.getByRole('heading', { name: `Welcome ${newUser.email}` })).toBeVisible();
});
