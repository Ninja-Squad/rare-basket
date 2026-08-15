import { expect, Page, test } from '@playwright/test';
import { loginWithKeycloak } from './utils-e2e';

const grcs = [
  {
    id: 1,
    name: 'GRC1',
    address: '10 rue du Louvre 75000 Paris',
    institution: 'INRAE'
  },
  {
    id: 2,
    name: 'GRC2',
    address: '20 rue du Louvre 75000 Paris',
    institution: 'INRAE'
  }
];

const statistics = {
  createdOrderCount: 40,
  finalizedOrderCount: 35,
  cancelledOrderCount: 10,
  distinctFinalizedOrderCustomerCount: 20,
  averageFinalizationDurationInDays: 3.5,
  orderStatusStatistics: [
    {
      orderStatus: 'DRAFT',
      createdOrderCount: 24
    },
    {
      orderStatus: 'FINALIZED',
      createdOrderCount: 16
    }
  ],
  customerTypeStatistics: [
    {
      customerType: 'CITIZEN',
      finalizedOrderCount: 22
    },
    {
      customerType: 'FARMER',
      finalizedOrderCount: 13
    }
  ]
};

const expectChartToBeRendered = async (page: Page, selector: string) => {
  const canvas = page.locator(`${selector} canvas`);
  await expect(canvas).toBeVisible();
  await expect.poll(() => canvas.evaluate(element => element.width > 0 && element.height > 0)).toBe(true);
};

test.describe('Statistics', () => {
  test('should update the URL and charts for a selected GRC', async ({ page }) => {
    await page.route('**/api/grcs', route => route.fulfill({ json: grcs }));
    await page.route('**/api/orders/statistics**', route => route.fulfill({ json: statistics }));

    await page.goto('/rare-basket/');
    await loginWithKeycloak(page);
    await page.goto('/rare-basket/orders/stats?from=2019-01-01&to=2020-01-01');

    await expectChartToBeRendered(page, '#customer-types-chart');
    await expectChartToBeRendered(page, '#order-status-chart');

    await page.locator('#edit-perimeter').click();
    await page.locator('#no-global-visualization').check();
    await page.locator('#grc-2').check();

    const filteredStatisticsRequest = page.waitForRequest(request => {
      const url = new URL(request.url());
      return url.pathname.endsWith('/api/orders/statistics') && url.searchParams.getAll('grcs').includes('2');
    });

    await page.locator('#refresh-button').click();
    const request = await filteredStatisticsRequest;

    await expect(page).toHaveURL(url => url.searchParams.getAll('grcs').join(',') === '2');
    expect(new URL(request.url()).searchParams.getAll('grcs')).toEqual(['2']);

    await expectChartToBeRendered(page, '#customer-types-chart');
    await expectChartToBeRendered(page, '#order-status-chart');
  });
});
