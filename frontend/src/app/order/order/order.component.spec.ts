import { TestBed } from '@angular/core/testing';

import { OrderComponent } from './order.component';
import { ComponentTester, fakeRoute, fakeSnapshot, speculoosMatchers } from 'ngx-speculoos';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { EMPTY, of } from 'rxjs';
import { Order, OrderCommand } from '../order.model';
import { LOCALE_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { LanguageEnumPipe } from '../language-enum.pipe';
import { EditOrderComponent } from '../edit-order/edit-order.component';
import { By } from '@angular/platform-browser';
import { ValdemortModule } from 'ngx-valdemort';
import { ReactiveFormsModule } from '@angular/forms';

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

  get editOrderButton() {
    return this.button('#edit-order-button');
  }

  get editOrderComponent(): EditOrderComponent | null {
    return this.debugElement.query(By.directive(EditOrderComponent))?.componentInstance ?? null;
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

    orderService = jasmine.createSpyObj<OrderService>('OrderService', ['get', 'update']);

    TestBed.configureTestingModule({
      declarations: [OrderComponent, LanguageEnumPipe, EditOrderComponent],
      imports: [I18nTestingModule, FontAwesomeModule, RouterTestingModule, SharedModule, ReactiveFormsModule, ValdemortModule],
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
          type: 'BIOLOGIST',
          language: 'en'
        },
        rationale: 'Why not?',
        reference: 'ABCDEFGH',
        confirmationInstant: '2020-04-02T11:00:00Z'
      },
      items: [
        {
          id: 1,
          accession: {
            name: 'Rosa',
            identifier: 'rosa1'
          },
          quantity: 1234
        },
        {
          id: 2,
          accession: {
            name: 'Violetta',
            identifier: 'violetta1'
          },
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
    expect(tester.editOrderComponent).toBeNull();
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
    expect(tester.testElement).toContainText('Anglais');
    expect(tester.testElement).toContainText('Why not?');
  });

  it('should display order items', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.items.length).toBe(2);
    expect(tester.items[0]).toContainText('Rosa');
    expect(tester.items[0]).toContainText('1 234');
    expect(tester.items[1]).toContainText('Violetta');

    expect(tester.editOrderComponent).toBeNull();
  });

  it('should not display edit button if order is not draft', () => {
    orderService.get.and.returnValue(of({ ...order, status: 'CANCELLED' }));
    tester.detectChanges();

    expect(tester.editOrderButton).toBeNull();
  });

  it('should edit order', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    tester.editOrderButton.click();

    expect(tester.items.length).toBe(0);
    expect(tester.editOrderComponent).not.toBeNull();
    expect(tester.editOrderComponent.order).toBe(tester.componentInstance.order);
  });

  it('should cancel edition', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    tester.editOrderButton.click();

    tester.editOrderComponent.cancel();
    tester.detectChanges();

    expect(tester.items.length).toBe(2);
    expect(tester.editOrderComponent).toBeNull();
  });

  it('should save and refresh', () => {
    const newOrder = { ...order };
    orderService.get.and.returnValues(of(order), of(newOrder));
    tester.detectChanges();

    tester.editOrderButton.click();

    orderService.update.and.returnValue(of(undefined));
    const command = {} as OrderCommand;
    tester.editOrderComponent.saved.emit(command);
    tester.detectChanges();

    expect(orderService.update).toHaveBeenCalledWith(order.id, command);
    expect(tester.componentInstance.order).toBe(newOrder);
    expect(tester.items.length).toBe(2);
    expect(tester.editOrderComponent).toBeNull();
  });
});
