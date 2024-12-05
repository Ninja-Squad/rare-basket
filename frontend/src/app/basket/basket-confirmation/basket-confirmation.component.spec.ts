import { TestBed } from '@angular/core/testing';

import { BasketConfirmationComponent } from './basket-confirmation.component';
import { ComponentTester, createMock, stubRoute } from 'ngx-speculoos';
import { ActivatedRoute, Router } from '@angular/router';
import { BasketService } from '../basket.service';
import { of, throwError } from 'rxjs';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

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
  let basketService: jasmine.SpyObj<BasketService>;

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

  it('should confirm and redirect if successful', () => {
    basketService.confirm.and.returnValue(of(undefined));
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    tester = new BasketConfirmationComponentTester();
    tester.detectChanges();

    expect(tester.alert).toBeNull();
    expect(basketService.confirm).toHaveBeenCalledWith('ABCDEFGH', 'XYXWVUTS');
    expect(router.navigate).toHaveBeenCalledWith(['/baskets', 'ABCDEFGH']);
  });

  it('should confirm and display an alert is unsuccessful', () => {
    basketService.confirm.and.returnValue(throwError(() => undefined));
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    tester = new BasketConfirmationComponentTester();
    tester.detectChanges();

    expect(basketService.confirm).toHaveBeenCalledWith('ABCDEFGH', 'XYXWVUTS');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(tester.alert).not.toBeNull();
  });
});
