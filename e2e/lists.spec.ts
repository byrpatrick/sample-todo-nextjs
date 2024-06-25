import { HomePage } from './pages/home.page';
import { SpacePage } from './pages/space.page';
import { multipleAuthenticatedUserTest, expect } from './fixtures';

multipleAuthenticatedUserTest(
  'Collaborators can see a public list on a shared space',
  async ({ loginMainUser, loginCollaboratorUser, sharedSpace }) => {
    // Navigate to shared spaces
    const homePageFirstUser = new HomePage(loginMainUser);
    await homePageFirstUser.gotoSpace(sharedSpace.name, sharedSpace.slug);
    await expect(homePageFirstUser.page.getByRole('heading', { name: sharedSpace.name, exact: true })).toBeVisible();

    const homePageSecondUser = new HomePage(loginCollaboratorUser);
    await homePageSecondUser.gotoSpace(sharedSpace.name, sharedSpace.slug);
    await expect(homePageSecondUser.page.getByRole('heading', { name: sharedSpace.name, exact: true })).toBeVisible();

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
  }
);

multipleAuthenticatedUserTest(
  'Collaborators can not see a private list on a shared space',
  async ({ loginMainUser, loginCollaboratorUser, sharedSpace }) => {
    // Users Navigate to shared space
    const homePageFirstUser = new HomePage(loginMainUser);
    await homePageFirstUser.gotoSpace(sharedSpace.name, sharedSpace.slug);
    await expect(homePageFirstUser.page.getByRole('heading', { name: sharedSpace.name, exact: true })).toBeVisible();

    const homePageSecondUser = new HomePage(loginCollaboratorUser);
    await homePageSecondUser.gotoSpace(sharedSpace.name, sharedSpace.slug);
    await expect(homePageSecondUser.page.getByRole('heading', { name: sharedSpace.name, exact: true })).toBeVisible();

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
    await expect(
      spacePageSecondUser.page.getByRole('heading', { name: 'This page could not be found.' })
    ).toBeVisible();
  }
);
