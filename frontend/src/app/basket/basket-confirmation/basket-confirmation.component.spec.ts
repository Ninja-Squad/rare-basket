import { TestBed } from '@angular/core/testing';

import { BasketConfirmationComponent } from './basket-confirmation.component';
import { createMock, MockObject } from '../../../test/mock';
import { stubRoute } from '../../../test/route-stub';
import { ActivatedRoute, Router } from '@angular/router';
import { BasketService } from '../basket.service';
import { of, throwError } from 'rxjs';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test, vi } from 'vitest';

class BasketConfirmationComponentTester {
  readonly fixture = TestBed.createComponent(BasketConfirmationComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly alert = this.root.getByCss('.alert');
}

describe('BasketConfirmationComponent', () => {
  let tester: BasketConfirmationComponentTester;
  let basketService: MockObject<BasketService>;

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

  test('should confirm and redirect if successful', async () => {
    basketService.confirm.mockReturnValue(of(undefined));
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    tester = new BasketConfirmationComponentTester();

    await expect.element(tester.alert).not.toBeInTheDocument();
    expect(basketService.confirm).toHaveBeenCalledWith('ABCDEFGH', 'XYXWVUTS');
    expect(router.navigate).toHaveBeenCalledWith(['/baskets', 'ABCDEFGH']);
  });

  test('should confirm and display an alert is unsuccessful', async () => {
    basketService.confirm.mockReturnValue(throwError(() => undefined));
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    tester = new BasketConfirmationComponentTester();

    expect(basketService.confirm).toHaveBeenCalledWith('ABCDEFGH', 'XYXWVUTS');
    expect(router.navigate).not.toHaveBeenCalled();
    await expect.element(tester.alert).toBeInTheDocument();
  });
});
