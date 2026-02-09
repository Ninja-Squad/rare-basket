import { TestBed } from '@angular/core/testing';

import { OrdersComponent } from './orders.component';
import { ChangeDetectionStrategy, Component, LOCALE_ID } from '@angular/core';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { PaginationComponent } from '../../rb-ngb/pagination/pagination.component';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { provideRouter } from '@angular/router';
import { page } from 'vitest/browser';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, test } from 'vitest';

@Component({
  template: `<rb-orders [orders]="orders" />`,
  imports: [OrdersComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  orders: Page<Order> = {
    totalPages: 2,
    totalElements: 22,
    number: 1,
    size: 20,
    content: [
      {
        id: 42,
        status: 'DRAFT',
        basket: {
          reference: 'ABCDEFGH',
          confirmationInstant: '2020-04-02T12:00:00Z',
          customer: {
            type: 'CITIZEN',
            name: 'John Doe'
          }
        },
        accessionHolder: {
          id: 42,
          name: 'the flower holder'
        },
        items: [{}, {}]
      },
      {
        id: 43,
        status: 'DRAFT',
        basket: {
          reference: 'HGFEDCBA',
          confirmationInstant: '2020-04-02T11:00:00Z',
          customer: {
            type: 'FARMER',
            name: 'Jane Doe',
            organization: 'Farm Inc.'
          }
        },
        accessionHolder: {
          id: 43,
          name: 'the mushroom holder'
        },
        items: [{}]
      }
    ] as Array<Order>
  };
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly rows = this.root.getByCss('.row');

  get componentInstance() {
    return this.fixture.componentInstance;
  }

  get pagination(): PaginationComponent {
    return this.fixture.debugElement.query(By.directive(PaginationComponent)).componentInstance;
  }
}

describe('OrdersComponent', () => {
  let tester: TestComponentTester;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting(), { provide: LOCALE_ID, useValue: 'fr' }]
    });

    tester = new TestComponentTester();
    await tester.fixture.whenStable();
  });

  test('should have a pagination', () => {
    expect(tester.pagination.page()).toBe(tester.componentInstance.orders);
    expect(tester.pagination.navigate()).toBe(true);
  });

  test('should have rows of data', async () => {
    await expect.element(tester.rows).toHaveLength(2);
    await expect.element(tester.rows.nth(0)).toHaveTextContent('ABCDEFGH');
    await expect.element(tester.rows.nth(0)).toHaveTextContent('pour the flower holder');
    await expect.element(tester.rows.nth(0)).toHaveTextContent('John Doe');
    await expect.element(tester.rows.nth(0)).toHaveTextContent('Citoyen');
    await expect.element(tester.rows.nth(0)).toHaveTextContent('2 avr. 2020');
    await expect.element(tester.rows.nth(0)).toHaveTextContent('2 accessions');
    await expect.element(tester.rows.nth(0)).toHaveTextContent('En cours');

    await expect.element(tester.rows.nth(1)).toHaveTextContent('(Farm Inc.)');
    await expect.element(tester.rows.nth(1)).toHaveTextContent('1 accession');
  });
});
