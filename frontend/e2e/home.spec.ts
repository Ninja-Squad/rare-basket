import { expect, test } from '@playwright/test';
import { loginWithKeycloak } from './utils-e2e';

test.describe('Home', () => {
  test('should display a welcome message after login', async ({ page }) => {
    await page.goto('/rare-basket/');
    await loginWithKeycloak(page);

    // back to the home page
    await expect(page.locator('h2')).toHaveText('Welcome admin');
    await expect(page.locator('#orders-link')).toHaveText('Orders');
  });
});
