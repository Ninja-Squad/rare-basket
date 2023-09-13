import { expect, Page } from '@playwright/test';

export async function login(page: Page) {
  await page.route('**/api/users/me', route => {
    route.fulfill({
      json: {
        id: 1,
        name: 'admin',
        permissions: ['ADMINISTRATION', 'ORDER_MANAGEMENT', 'ORDER_VISUALIZATION'],
        globalVisualization: true,
        visualizationGrcs: [],
        accessionHolder: {
          id: 1,
          name: 'CBGP',
          email: 'contact1@grc1.fr',
          grc: { id: 1, name: 'GRC1', address: '10 rue du Louvres 75000 Paris', institution: 'INRAE' },
          phone: ''
        }
      }
    });
  });
  await page.goto('/rare-basket/');
  await page.locator('#login-button').click();

  // Check that we have been redirected to Keycloak on localhost:8082
  expect(page.url()).toContain(
    'http://localhost:8082/auth/realms/rare-basket/protocol/openid-connect/auth?client_id=rare-basket&redirect_uri=http%3A%2F%2Flocalhost%3A4202%2Frare-basket%2F'
  );

  // fill in the username
  await page.locator('#username').fill('contact11');
  // fill in the password
  await page.locator('#password').fill('password');
  await page.locator('#kc-login').click();

  // we should be back to the app and connected
  expect(page.url()).toContain('http://localhost:4202/rare-basket/');
  await expect(page.locator('#login-button')).not.toBeVisible();
}
