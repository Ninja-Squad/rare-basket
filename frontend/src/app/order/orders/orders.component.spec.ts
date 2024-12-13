import { TestBed } from '@angular/core/testing';

import { OrdersComponent } from './orders.component';
import { Component, LOCALE_ID } from '@angular/core';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { ComponentTester } from 'ngx-speculoos';
import { PaginationComponent } from '../../rb-ngb/pagination/pagination.component';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';
import { provideRouter } from '@angular/router';

@Component({
  template: `<rb-orders [orders]="orders" />`,
  imports: [OrdersComponent]
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

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get pagination(): PaginationComponent {
    return this.component(PaginationComponent);
  }

  get rows() {
    return this.elements('.row');
  }
}

describe('OrdersComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideI18nTesting(), { provide: LOCALE_ID, useValue: 'fr' }]
    });

    tester = new TestComponentTester();
    tester.detectChanges();
  });

  it('should have a pagination', () => {
    expect(tester.pagination.page()).toBe(tester.componentInstance.orders);
    expect(tester.pagination.navigate()).toBe(true);
  });

  it('should have rows of data', () => {
    expect(tester.rows.length).toBe(2);
    expect(tester.rows[0]).toContainText('ABCDEFGH');
    expect(tester.rows[0]).toContainText('pour the flower holder');
    expect(tester.rows[0]).toContainText('John Doe');
    expect(tester.rows[0]).toContainText('Citoyen');
    expect(tester.rows[0]).toContainText('2 avr. 2020');
    expect(tester.rows[0]).toContainText('2 accessions');
    expect(tester.rows[0]).toContainText('En cours');

    expect(tester.rows[1]).toContainText('(Farm Inc.)');
    expect(tester.rows[1]).toContainText('1 accession');
  });
});
