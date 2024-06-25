import { alphanumericId } from './utils';
import { HomePage } from './pages/home.page';
import { expect, multipleAuthenticatedUserTest, singleUserTest } from './fixtures';

singleUserTest('Users can create a new space', async ({ authenticatedUser }) => {
  const spaceName = 'Quito Lambda';
  const spaceSlug = alphanumericId(5);

  const homePage = new HomePage(authenticatedUser);
  await homePage.createNewSpaceLink();
  await expect(homePage.page.getByRole('heading', { name: 'Create a space' })).toBeVisible();

  await homePage.createSpace(spaceName, spaceSlug);
  await expect(homePage.page.getByText("Space created successfully! You'll be redirected.")).toBeVisible();
  await expect(homePage.page.getByRole('heading', { name: spaceName, exact: true })).toBeVisible();
});

multipleAuthenticatedUserTest(
  'Users can invite users to their space',
  async ({ newCollaboratorUser, sharedSpace, loginMainUser, loginNewCollaboratorUser }) => {
    // Main user navigate to their space
    const homePageFirstUser = new HomePage(loginMainUser);
    await homePageFirstUser.gotoSpace(sharedSpace.name, sharedSpace.slug);
    await expect(homePageFirstUser.page.getByRole('heading', { name: sharedSpace.name, exact: true })).toBeVisible();

    // Invite the second user to space
    await homePageFirstUser.addCollaboratorButton.click();
    await expect(
      homePageFirstUser.page.getByRole('heading', { name: `Manage Members of ${sharedSpace.name}` })
    ).toBeVisible();

    await homePageFirstUser.addCollaboratorToSpace(newCollaboratorUser.email);
    await expect(homePageFirstUser.page.getByText(newCollaboratorUser.email)).toBeVisible();

    // Check that the second user has access to the shared space
    const homePageSecondUser = new HomePage(await loginNewCollaboratorUser());
    await homePageSecondUser.gotoSpace(sharedSpace.name, sharedSpace.slug);
    await expect(homePageSecondUser.page.getByRole('heading', { name: sharedSpace.name, exact: true })).toBeVisible();
  }
);
