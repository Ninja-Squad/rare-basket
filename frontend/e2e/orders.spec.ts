import { expect, Page, test } from '@playwright/test';

const inProgressNinjaSquadOrder = {
  id: 952,
  basket: {
    reference: 'OMGVJPNK',
    rationale: null as string,
    customer: {
      name: 'Ninja Squad',
      organization: null as string,
      email: 'contact@ninja-squad.com',
      deliveryAddress: '13 lot les Tilleuls, 42170 ST JUST ST RAMBERT',
      billingAddress: '13 lot les Tilleuls, 42170 ST JUST ST RAMBERT',
      type: 'FR_COMPANY',
      language: 'fr'
    },
    confirmationInstant: '2022-09-30T19:23:30.191702Z'
  },
  status: 'DRAFT',
  items: [] as Array<unknown>,
  documents: [] as Array<unknown>
};
export const inProgressOrders = (page: Page) =>
  page.route('**/api/orders?status=DRAFT&page=0', route => {
    route.fulfill({
      body: JSON.stringify({ content: [inProgressNinjaSquadOrder], totalElements: 1, totalPages: 1, size: 20, number: 0 })
    });
  });

export const postOrder = (page: Page) =>
  page.route('**/api/orders', route => {
    route.fulfill({
      body: JSON.stringify(inProgressNinjaSquadOrder)
    });
  });

export const getOrder = (page: Page) =>
  page.route('**/api/orders/952', route => {
    route.fulfill({
      body: JSON.stringify(inProgressNinjaSquadOrder)
    });
  });

test.describe('Orders', () => {
  test('should display in progress orders', async ({ page }) => {
    // api call to get the "in progress" orders
    await inProgressOrders(page);
    // api call to get an order
    await getOrder(page);
    // api call to create a new order
    await postOrder(page);

    await page.goto('/rare-basket/orders');
    await expect(page.locator('h1')).toHaveText('Orders');
    await expect(page.locator('a.active')).toHaveText('In progress');

    // one order in progress
    await expect(page.getByText('1 order(s) in progress')).toBeVisible();
    await expect(page.getByText('OMGVJPNK')).toBeVisible();

    // create an order
    await page.getByText('Create an order').click();
    await page.getByText('Customer name').fill('Ninja Squad');
    await page.getByText('Customer email').fill('contact@ninja-squad.com');
    await page.getByText('Delivery address of the customer').fill('13 lot les Tilleuls, 42170 ST JUST ST RAMBERT');
    await page.getByText('Use the delivery address as the billing address').check();
    await page.getByText('Customer category').selectOption({ label: 'French private company' });
    await page.getByText('Preferred language of the customer').selectOption({ label: 'French' });
    await page.getByText('Save').click();

    // accession selection
    await expect(page.locator('h1')).toContainText('Order OMGVJPNK');
  });
});
