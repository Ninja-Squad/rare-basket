import { TestBed } from '@angular/core/testing';

import { OrderComponent } from './order.component';
import { ComponentTester, fakeRoute, fakeSnapshot, speculoosMatchers } from 'ngx-speculoos';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { EMPTY, of } from 'rxjs';
import { Order } from '../order.model';
import { LOCALE_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

class OrderComponentTester extends ComponentTester<OrderComponent> {
  constructor() {
    super(OrderComponent);
  }

  get title() {
    return this.element('h1');
  }

  get items() {
    return this.elements('.order-item');
  }
}

describe('OrderComponent', () => {
  let tester: OrderComponentTester;
  let orderService: jasmine.SpyObj<OrderService>;

  let order: Order;

  beforeEach(() => {
    const route = fakeRoute({
      snapshot: fakeSnapshot({
        params: { orderId: 42 }
      })
    });

    orderService = jasmine.createSpyObj<OrderService>('OrderService', ['get']);

    TestBed.configureTestingModule({
      declarations: [OrderComponent],
      imports: [FontAwesomeModule, RouterTestingModule, SharedModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: OrderService, useValue: orderService },
        { provide: LOCALE_ID, useValue: 'fr' }
      ]
    });

    tester = new OrderComponentTester();
    jasmine.addMatchers(speculoosMatchers);

    order = {
      id: 42,
      status: 'DRAFT',
      basket: {
        customer: {
          name: 'John Doe',
          email: 'john@mail.com',
          address: 'Av. du Centre\n75000 Paris',
          type: 'BIOLOGIST'
        },
        rationale: 'Why not?',
        reference: 'ABCDEFGH',
        confirmationInstant: '2020-04-02T11:00:00Z'
      },
      items: [
        {
          id: 1,
          accession: 'rosa',
          quantity: 1234
        },
        {
          id: 2,
          accession: 'violetta',
          quantity: 5
        }
      ]
    };
  });

  it('should not display anything until order is there', () => {
    orderService.get.and.returnValue(EMPTY);
    tester.detectChanges();

    expect(orderService.get).toHaveBeenCalledWith(42);
    expect(tester.title).toBeNull();
    expect(tester.items.length).toBe(0);
  });

  it('should have a title', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.title).toContainText('Commande n° ABCDEFGH');
  });

  it('should display customer information', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.testElement).toContainText('John');
    expect(tester.testElement).toContainText('john@mail.com');
    expect(tester.testElement).toContainText('Av. du Centre\n75000 Paris');
    expect(tester.testElement).toContainText('Biologiste');
    expect(tester.testElement).toContainText('Why not?');
  });

  it('should display order items', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.items.length).toBe(2);
    expect(tester.items[0]).toContainText('rosa');
    expect(tester.items[0]).toContainText('1 234');
    expect(tester.items[1]).toContainText('violetta');
  });
});
