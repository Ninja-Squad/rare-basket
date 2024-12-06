import { expect, Page } from '@playwright/test';

const currentUser = {
  id: 1,
  name: 'admin',
  permissions: ['ADMINISTRATION', 'ORDER_MANAGEMENT', 'ORDER_VISUALIZATION'],
  globalVisualization: true,
  visualizationGrcs: [],
  accessionHolders: [
    {
      id: 1,
      name: 'CBGP',
      email: 'contact1@grc1.fr',
      grc: { id: 1, name: 'GRC1', address: '10 rue du Louvres 75000 Paris', institution: 'INRAE' },
      phone: ''
    }
  ]
};

const loadCurrentUser = (page: Page) =>
  page.route('**/api/users/me', route => {
    route.fulfill({
      json: currentUser
    });
  });

export async function loginWithKeycloak(page: Page) {
  // log in
  await expect(page.locator('#login-button')).toHaveText('Log in');
  await page.locator('#login-button').click();

  // Keycloak login
  await expect(page.getByRole('heading')).toHaveText('Sign in to your account');
  await page.getByLabel('Username or email').fill('admin');
  await page.getByLabel('Password', { exact: true }).fill('password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await loadCurrentUser(page);
}
