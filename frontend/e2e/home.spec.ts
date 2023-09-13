import { expect, test } from '@playwright/test';
import { login } from './utils';

test.describe('Home', () => {
  test('should display a welcome message', async ({ page }) => {
    await login(page);

    await expect(page.locator('h2')).toHaveText('Welcome admin');
    await expect(page.locator('#orders-link')).toHaveText('Orders');
  });
});
