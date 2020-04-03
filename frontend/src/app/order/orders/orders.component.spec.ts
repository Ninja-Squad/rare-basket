import { TestBed } from '@angular/core/testing';

import { OrdersComponent } from './orders.component';
import { Component, LOCALE_ID } from '@angular/core';
import { Order } from '../order.model';
import { Page } from '../../shared/page.model';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { PaginationComponent } from '../../rb-ngb/pagination/pagination.component';
import { By } from '@angular/platform-browser';
import { RbNgbModule } from '../../rb-ngb/rb-ngb.module';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { RouterTestingModule } from '@angular/router/testing';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';

@Component({
  template: `
    <rb-orders [orders]="orders"></rb-orders>
  `
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
            type: 'BIOLOGIST',
            name: 'John Doe'
          }
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
            name: 'Jane Doe'
          }
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
    return this.debugElement.query(By.directive(PaginationComponent)).componentInstance;
  }

  get rows() {
    return this.elements('.row');
  }
}

describe('OrdersComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrdersComponent, TestComponent, CustomerTypeEnumPipe, OrderStatusEnumPipe],
      imports: [I18nTestingModule, RouterTestingModule, RbNgbModule],
      providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
    });

    tester = new TestComponentTester();
    tester.detectChanges();
    jasmine.addMatchers(speculoosMatchers);
  });

  it('should have a pagination', () => {
    expect(tester.pagination.page).toBe(tester.componentInstance.orders);
    expect(tester.pagination.navigate).toBe(true);
  });

  it('should have rows of data', () => {
    expect(tester.rows.length).toBe(2);
    expect(tester.rows[0]).toContainText('ABCDEFGH');
    expect(tester.rows[0]).toContainText('John Doe, Biologiste');
    expect(tester.rows[0]).toContainText('2 avr. 2020');
    expect(tester.rows[0]).toContainText('2 accessions');
    expect(tester.rows[0]).toContainText('En cours');

    expect(tester.rows[1]).toContainText('1 accession');
  });
});
