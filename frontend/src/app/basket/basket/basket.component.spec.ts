import { TestBed } from '@angular/core/testing';

import { BasketComponent } from './basket.component';
import { createMock, MockObject } from '../../../test/mock';
import { stubRoute } from '../../../test/route-stub';
import { EditBasketComponent } from '../edit-basket/edit-basket.component';
import { ActivatedRoute } from '@angular/router';
import { AccessionHolderBasket, Basket, BasketCommand } from '../basket.model';
import { BasketService } from '../basket.service';
import { of } from 'rxjs';
import { EditConfirmationComponent } from '../edit-confirmation/edit-confirmation.component';
import { ConfirmedComponent } from '../confirmed/confirmed.component';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, test } from 'vitest';

class BasketComponentTester {
  readonly fixture = TestBed.createComponent(BasketComponent);
  readonly title = page.getByCss('h1');
  readonly componentInstance = this.fixture.componentInstance;

  get editBasketComponent(): EditBasketComponent | null {
    return this.fixture.debugElement.query(By.directive(EditBasketComponent))?.componentInstance ?? null;
  }

  get editConfirmationComponent(): EditConfirmationComponent | null {
    return this.fixture.debugElement.query(By.directive(EditConfirmationComponent))?.componentInstance ?? null;
  }

  get confirmedComponent(): ConfirmedComponent | null {
    return this.fixture.debugElement.query(By.directive(ConfirmedComponent))?.componentInstance ?? null;
  }
}

describe('BasketComponent', () => {
  let tester: BasketComponentTester;
  let basketService: MockObject<BasketService>;

  beforeEach(() => {
    const route = stubRoute({
      params: {
        reference: 'ABCDEFGH'
      }
    });

    basketService = createMock(BasketService);

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: ActivatedRoute, useValue: route }, { provide: BasketService, useValue: basketService }]
    });
  });

  describe('with draft basket', () => {
    let basket: Basket;
    let savedBasket: Basket;

    beforeEach(async () => {
      basket = {
        reference: 'ABCDEFGH',
        status: 'DRAFT',
        accessionHolderBaskets: [] as Array<AccessionHolderBasket>
      } as Basket;

      savedBasket = {
        reference: 'ABCDEFGH',
        status: 'SAVED',
        customer: {
          email: 'john@mail.com'
        },
        accessionHolderBaskets: [] as Array<AccessionHolderBasket>
      } as Basket;

      basketService.get.mockReturnValueOnce(of(basket)).mockReturnValueOnce(of(savedBasket));
      tester = new BasketComponentTester();
      await tester.fixture.whenStable();
    });

    test('should have a title', () => {
      expect(tester.title.element().textContent).toContain('Votre commande ABCDEFGH');
    });

    test('should have an edit component', () => {
      expect(basketService.get).toHaveBeenCalledWith('ABCDEFGH');
      expect(tester.editBasketComponent).not.toBeNull();
      expect(tester.editBasketComponent!.basket()).toBe(basket);
      expect(tester.editConfirmationComponent).toBeNull();
      expect(tester.confirmedComponent).toBeNull();
    });

    test('should save basket when edit component emits', async () => {
      const command = {} as BasketCommand;

      basketService.save.mockReturnValue(of(undefined));

      tester.editBasketComponent!.basketSaved.emit(command);
      await tester.fixture.whenStable();

      expect(basketService.save).toHaveBeenCalledWith('ABCDEFGH', command);
      expect(tester.componentInstance.basket()).toBe(savedBasket);
      expect(tester.editBasketComponent).toBeNull();
      expect(tester.editConfirmationComponent).not.toBeNull();
      expect(tester.editConfirmationComponent!.basket()).toBe(savedBasket);
    });
  });

  describe('with a saved basket', async () => {
    let basket: Basket;
    let confirmedBasket: Basket;

    beforeEach(async () => {
      basket = {
        reference: 'ABCDEFGH',
        status: 'SAVED',
        customer: {
          email: 'john@mail.com'
        },
        accessionHolderBaskets: [] as Array<AccessionHolderBasket>
      } as Basket;

      confirmedBasket = {
        reference: 'ABCDEFGH',
        status: 'CONFIRMED',
        customer: {
          email: 'john@mail.com'
        },
        accessionHolderBaskets: [] as Array<AccessionHolderBasket>
      } as Basket;

      basketService.get.mockReturnValueOnce(of(basket)).mockReturnValueOnce(of(confirmedBasket));

      tester = new BasketComponentTester();
      await tester.fixture.whenStable();
    });

    test('should have an edit confirmation component', () => {
      expect(basketService.get).toHaveBeenCalledWith('ABCDEFGH');
      expect(tester.editBasketComponent).toBeNull();
      expect(tester.editConfirmationComponent).not.toBeNull();
      expect(tester.confirmedComponent).toBeNull();

      expect(tester.editConfirmationComponent!.basket()).toBe(basket);
    });

    test('should confirm when edit confirmation component emits', async () => {
      basketService.confirm.mockReturnValue(of(undefined));

      tester.editConfirmationComponent!.basketConfirmed.emit('CODE');
      await tester.fixture.whenStable();

      expect(basketService.confirm).toHaveBeenCalledWith('ABCDEFGH', 'CODE');
      expect(tester.componentInstance.basket()).toBe(confirmedBasket);
      expect(tester.editConfirmationComponent).toBeNull();
      expect(tester.confirmedComponent).not.toBeNull();
      expect(tester.confirmedComponent!.basket()).toBe(confirmedBasket);
    });

    test('should refresh when edit confirmation component asks to', async () => {
      tester.editConfirmationComponent!.refreshRequested.emit(undefined);
      await tester.fixture.whenStable();

      expect(tester.componentInstance.basket()).toBe(confirmedBasket);
    });
  });
});
