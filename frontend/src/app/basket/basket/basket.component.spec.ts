import { TestBed } from '@angular/core/testing';

import { BasketComponent } from './basket.component';
import { ComponentTester, createMock, stubRoute } from 'ngx-speculoos';
import { EditBasketComponent } from '../edit-basket/edit-basket.component';
import { ActivatedRoute } from '@angular/router';
import { Basket, BasketCommand } from '../basket.model';
import { BasketService } from '../basket.service';
import { of } from 'rxjs';
import { EditConfirmationComponent } from '../edit-confirmation/edit-confirmation.component';
import { ConfirmedComponent } from '../confirmed/confirmed.component';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

class BasketComponentTester extends ComponentTester<BasketComponent> {
  constructor() {
    super(BasketComponent);
  }

  get title() {
    return this.element('h1');
  }

  get editBasketComponent(): EditBasketComponent {
    return this.component(EditBasketComponent);
  }

  get editConfirmationComponent(): EditConfirmationComponent {
    return this.component(EditConfirmationComponent);
  }

  get confirmedComponent(): ConfirmedComponent {
    return this.component(ConfirmedComponent);
  }
}

describe('BasketComponent', () => {
  let tester: BasketComponentTester;
  let basketService: jasmine.SpyObj<BasketService>;

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
        accessionHolderBaskets: []
      } as Basket;

      savedBasket = {
        reference: 'ABCDEFGH',
        status: 'SAVED',
        customer: {
          email: 'john@mail.com'
        },
        accessionHolderBaskets: []
      } as Basket;

      basketService.get.and.returnValues(of(basket), of(savedBasket));
      tester = new BasketComponentTester();
      await tester.stable();
    });

    it('should have a title', () => {
      expect(tester.title).toContainText('Votre commande ABCDEFGH');
    });

    it('should have an edit component', () => {
      expect(basketService.get).toHaveBeenCalledWith('ABCDEFGH');
      expect(tester.editBasketComponent).not.toBeNull();
      expect(tester.editBasketComponent.basket()).toBe(basket);
      expect(tester.editConfirmationComponent).toBeNull();
      expect(tester.confirmedComponent).toBeNull();
    });

    it('should save basket when edit component emits', async () => {
      const command = {} as BasketCommand;

      basketService.save.and.returnValue(of(undefined));

      tester.editBasketComponent.basketSaved.emit(command);
      await tester.stable();

      expect(basketService.save).toHaveBeenCalledWith('ABCDEFGH', command);
      expect(tester.componentInstance.basket()).toBe(savedBasket);
      expect(tester.editBasketComponent).toBeNull();
      expect(tester.editConfirmationComponent).not.toBeNull();
      expect(tester.editConfirmationComponent.basket()).toBe(savedBasket);
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
        accessionHolderBaskets: []
      } as Basket;

      confirmedBasket = {
        reference: 'ABCDEFGH',
        status: 'CONFIRMED',
        customer: {
          email: 'john@mail.com'
        },
        accessionHolderBaskets: []
      } as Basket;

      basketService.get.and.returnValues(of(basket), of(confirmedBasket));

      tester = new BasketComponentTester();
      await tester.stable();
    });

    it('should have an edit confirmation component', () => {
      expect(basketService.get).toHaveBeenCalledWith('ABCDEFGH');
      expect(tester.editBasketComponent).toBeNull();
      expect(tester.editConfirmationComponent).not.toBeNull();
      expect(tester.confirmedComponent).toBeNull();

      expect(tester.editConfirmationComponent.basket()).toBe(basket);
    });

    it('should confirm when edit confirmation component emits', async () => {
      basketService.confirm.and.returnValue(of(undefined));

      tester.editConfirmationComponent.basketConfirmed.emit('CODE');
      await tester.stable();

      expect(basketService.confirm).toHaveBeenCalledWith('ABCDEFGH', 'CODE');
      expect(tester.componentInstance.basket()).toBe(confirmedBasket);
      expect(tester.editConfirmationComponent).toBeNull();
      expect(tester.confirmedComponent).not.toBeNull();
      expect(tester.confirmedComponent.basket()).toBe(confirmedBasket);
    });

    it('should refresh when edit confirmation component asks to', async () => {
      tester.editConfirmationComponent.refreshRequested.emit(undefined);
      await tester.stable();

      expect(tester.componentInstance.basket()).toBe(confirmedBasket);
    });
  });
});
