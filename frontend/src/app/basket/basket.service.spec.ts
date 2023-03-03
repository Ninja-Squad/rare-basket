import { TestBed } from '@angular/core/testing';
import { HttpStatusCode, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { BasketService } from './basket.service';
import { Basket, BasketCommand } from './basket.model';

describe('BasketService', () => {
  let service: BasketService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(BasketService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('get a basket', () => {
    let actualBasket: Basket = null;

    service.get('ref1').subscribe(basket => (actualBasket = basket));

    const expectedBasket = { id: 42 } as Basket;
    http.expectOne({ method: 'GET', url: 'api/baskets/ref1' }).flush(expectedBasket);
    expect(actualBasket).toBe(expectedBasket);
  });

  it('should save a basket', () => {
    let done = false;

    const command = { rationale: 'because' } as BasketCommand;
    service.save('ref1', command).subscribe(() => (done = true));
    const testRequest = http.expectOne({ method: 'PUT', url: 'api/baskets/ref1' });
    expect(testRequest.request.body).toBe(command);
    testRequest.flush(null);

    expect(done).toBe(true);
  });

  it('should confirm a basket', () => {
    let done = false;

    const confirmationCode = 'ZYXWVUTS';
    service.confirm('ref1', confirmationCode).subscribe(() => (done = true));
    const testRequest = http.expectOne({ method: 'PUT', url: 'api/baskets/ref1/confirmation' });
    expect(testRequest.request.body).toEqual({ confirmationCode });
    testRequest.flush(null);

    expect(done).toBe(true);
  });

  it('should ignore already confirmed error', () => {
    let done = false;

    const confirmationCode = 'ZYXWVUTS';
    service.confirm('ref1', confirmationCode).subscribe(() => (done = true));
    http
      .expectOne({ method: 'PUT', url: 'api/baskets/ref1/confirmation' })
      .flush({ functionalError: 'BASKET_ALREADY_CONFIRMED' }, { status: HttpStatusCode.BadRequest, statusText: 'Bad Request' });

    expect(done).toBe(true);
  });

  it('should not ignore other errors', () => {
    let done = false;

    const confirmationCode = 'ZYXWVUTS';
    service.confirm('ref1', confirmationCode).subscribe({ error: () => (done = true) });
    http
      .expectOne({ method: 'PUT', url: 'api/baskets/ref1/confirmation' })
      .flush({}, { status: HttpStatusCode.BadRequest, statusText: 'Bad Request' });

    expect(done).toBe(true);
  });
});
