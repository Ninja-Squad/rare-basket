import { expect, test } from '@playwright/test';

test.describe('Home', () => {
  test('should display a welcome message', async ({ page }) => {
    await page.goto('/rare-basket/');
    await expect(page.locator('h2')).toHaveText('Welcome admin');
    await expect(page.locator('#orders-link')).toHaveText('Orders');
  });
});
