import { TestBed } from '@angular/core/testing';

import { OrderService } from './order.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Order, OrderCommand } from './order.model';
import { Page } from '../shared/page.model';

describe('OrderService', () => {
  let service: OrderService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(OrderService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should get an order', () => {
    let actualOrder: Order = null;

    service.get(42).subscribe(order => (actualOrder = order));

    const expectedOrder = { id: 42 } as Order;
    http.expectOne({ method: 'GET', url: '/api/orders/42' }).flush(expectedOrder);
    expect(actualOrder).toBe(expectedOrder);
  });

  it('should list in progress orders', () => {
    let actualOrders: Page<Order> = null;

    service.listInProgress(0).subscribe(orders => (actualOrders = orders));

    const expectedOrders = { totalElements: 0 } as Page<Order>;
    http.expectOne({ method: 'GET', url: '/api/orders?status=DRAFT&page=0' }).flush(expectedOrders);
    expect(actualOrders).toBe(expectedOrders);
  });

  it('should list done orders', () => {
    let actualOrders: Page<Order> = null;

    service.listDone(0).subscribe(orders => (actualOrders = orders));

    const expectedOrders = { totalElements: 0 } as Page<Order>;
    http.expectOne({ method: 'GET', url: '/api/orders?status=FINALIZED&status=CANCELLED&page=0' }).flush(expectedOrders);
    expect(actualOrders).toBe(expectedOrders);
  });

  it('should update an order', () => {
    let done = false;

    const command = {} as OrderCommand;
    service.update(42, command).subscribe(() => (done = true));

    const testRequest = http.expectOne({ method: 'PUT', url: '/api/orders/42' });
    expect(testRequest.request.body).toBe(command);
    testRequest.flush(null);
    expect(done).toBe(true);
  });
});
