import { TestBed } from '@angular/core/testing';

import { OrdersContainerComponent } from './orders-container.component';
import { ComponentTester } from 'ngx-speculoos';
import { RouterOutlet } from '@angular/router';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';

class OrdersContainerComponentTester extends ComponentTester<OrdersContainerComponent> {
  constructor() {
    super(OrdersContainerComponent);
  }

  get routerOutlet() {
    return this.debugElement.query(By.directive(RouterOutlet));
  }
}

describe('OrdersContainerComponent', () => {
  let tester: OrdersContainerComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrdersContainerComponent],
      imports: [I18nTestingModule, RouterTestingModule]
    });

    tester = new OrdersContainerComponentTester();
    tester.detectChanges();
  });

  it('should have a router outlet', () => {
    expect(tester.routerOutlet).toBeTruthy();
  });
});
