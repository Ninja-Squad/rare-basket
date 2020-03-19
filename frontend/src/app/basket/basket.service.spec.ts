import { TestBed } from '@angular/core/testing';

import { BasketService } from './basket.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Basket, BasketCommand } from './basket.model';

describe('BasketService', () => {
  let service: BasketService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(BasketService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('get a basket', () => {
    let actualBasket: Basket = null;

    service.get('ref1').subscribe(basket => (actualBasket = basket));

    const expectedBasket = { id: 42 } as Basket;
    http.expectOne({ method: 'GET', url: '/api/baskets/ref1' }).flush(expectedBasket);
    expect(actualBasket).toBe(expectedBasket);
  });

  it('should save a basket', () => {
    let done = false;

    const command = { rationale: 'because' } as BasketCommand;
    service.save('ref1', command).subscribe(() => (done = true));
    const testRequest = http.expectOne({ method: 'PUT', url: '/api/baskets/ref1' });
    expect(testRequest.request.body).toBe(command);
    testRequest.flush(null);

    expect(done).toBe(true);
  });
});
