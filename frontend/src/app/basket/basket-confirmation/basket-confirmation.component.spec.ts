import { beforeEach, describe, expect, it, type MockedObject, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { BasketConfirmationComponent } from './basket-confirmation.component';
import { ComponentTester, stubRoute } from 'ngx-speculoos';
import { ActivatedRoute, Router } from '@angular/router';
import { BasketService } from '../basket.service';
import { of, throwError } from 'rxjs';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { createMock } from '../../../mock';

class BasketConfirmationComponentTester extends ComponentTester<BasketConfirmationComponent> {
  constructor() {
    super(BasketConfirmationComponent);
  }

  get alert() {
    return this.element('.alert');
  }
}

describe('BasketConfirmationComponent', () => {
  let tester: BasketConfirmationComponentTester;
  let basketService: MockedObject<BasketService>;

  beforeEach(() => {
    const route = stubRoute({
      params: {
        reference: 'ABCDEFGH'
      },
      queryParams: {
        code: 'XYXWVUTS'
      }
    });

    basketService = createMock(BasketService);

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: ActivatedRoute, useValue: route }, { provide: BasketService, useValue: basketService }]
    });
  });

  it('should confirm and redirect if successful', async () => {
    basketService.confirm.mockReturnValue(of(undefined));
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    tester = new BasketConfirmationComponentTester();
    await tester.stable();

    expect(tester.alert).toBeNull();
    expect(basketService.confirm).toHaveBeenCalledWith('ABCDEFGH', 'XYXWVUTS');
    expect(router.navigate).toHaveBeenCalledWith(['/baskets', 'ABCDEFGH']);
  });

  it('should confirm and display an alert is unsuccessful', async () => {
    basketService.confirm.mockReturnValue(throwError(() => undefined));
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    tester = new BasketConfirmationComponentTester();
    await tester.stable();

    expect(basketService.confirm).toHaveBeenCalledWith('ABCDEFGH', 'XYXWVUTS');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(tester.alert).not.toBeNull();
  });
});
