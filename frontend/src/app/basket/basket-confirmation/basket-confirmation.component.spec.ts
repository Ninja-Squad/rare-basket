import { TestBed } from '@angular/core/testing';

import { BasketConfirmationComponent } from './basket-confirmation.component';
import { ComponentTester, createMock, stubRoute } from 'ngx-speculoos';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BasketService } from '../basket.service';
import { of, throwError } from 'rxjs';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';

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
      declarations: [BasketConfirmationComponent],
      imports: [I18nTestingModule, FontAwesomeModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: BasketService, useValue: basketService }
      ]
    });

    tester = new BasketConfirmationComponentTester();
  });

  it('should confirm and redirect if successful', () => {
    basketService.confirm.and.returnValue(of(undefined));
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    tester.detectChanges();

    expect(tester.alert).toBeNull();
    expect(basketService.confirm).toHaveBeenCalledWith('ABCDEFGH', 'XYXWVUTS');
    expect(router.navigate).toHaveBeenCalledWith(['/baskets', 'ABCDEFGH']);
  });

  it('should confirm and display an alert is unsuccessful', () => {
    basketService.confirm.and.returnValue(throwError(undefined));
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    tester.detectChanges();

    expect(basketService.confirm).toHaveBeenCalledWith('ABCDEFGH', 'XYXWVUTS');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(tester.alert).not.toBeNull();
  });
});
