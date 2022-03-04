import { TestBed } from '@angular/core/testing';

import { BasketComponent } from './basket.component';
import { ComponentTester, createMock, stubRoute } from 'ngx-speculoos';
import { EditBasketComponent } from '../edit-basket/edit-basket.component';
import { ActivatedRoute } from '@angular/router';
import { Basket, BasketCommand } from '../basket.model';
import { BasketService } from '../basket.service';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../shared/shared.module';
import { ValdemortModule } from 'ngx-valdemort';
import { EditConfirmationComponent } from '../edit-confirmation/edit-confirmation.component';
import { ConfirmedComponent } from '../confirmed/confirmed.component';
import { BasketContentComponent } from '../basket-content/basket-content.component';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { RbNgbTestingModule } from '../../rb-ngb/rb-ngb-testing.module';

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
      declarations: [BasketComponent, EditBasketComponent, EditConfirmationComponent, ConfirmedComponent, BasketContentComponent],
      imports: [I18nTestingModule, RbNgbTestingModule, ReactiveFormsModule, FontAwesomeModule, SharedModule, ValdemortModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: BasketService, useValue: basketService }
      ]
    });

    tester = new BasketComponentTester();
  });

  describe('with draft basket', () => {
    let basket: Basket;
    let savedBasket: Basket;

    beforeEach(() => {
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
      tester.detectChanges();
    });

    it('should have a title', () => {
      expect(tester.title).toContainText('Votre commande ABCDEFGH');
    });

    it('should have an edit component', () => {
      expect(basketService.get).toHaveBeenCalledWith('ABCDEFGH');
      expect(tester.editBasketComponent).not.toBeNull();
      expect(tester.editBasketComponent.basket).toBe(basket);
      expect(tester.editConfirmationComponent).toBeNull();
      expect(tester.confirmedComponent).toBeNull();
    });

    it('should save basket when edit component emits', () => {
      const command = {} as BasketCommand;

      basketService.save.and.returnValue(of(undefined));

      tester.editBasketComponent.basketSaved.emit(command);
      tester.detectChanges();

      expect(basketService.save).toHaveBeenCalledWith('ABCDEFGH', command);
      expect(tester.componentInstance.basket).toBe(savedBasket);
      expect(tester.editBasketComponent).toBeNull();
      expect(tester.editConfirmationComponent).not.toBeNull();
      expect(tester.editConfirmationComponent.basket).toBe(savedBasket);
    });
  });

  describe('with a saved basket', () => {
    let basket: Basket;
    let confirmedBasket: Basket;

    beforeEach(() => {
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

      tester.detectChanges();
    });

    it('should have an edit confirmation component', () => {
      expect(basketService.get).toHaveBeenCalledWith('ABCDEFGH');
      expect(tester.editBasketComponent).toBeNull();
      expect(tester.editConfirmationComponent).not.toBeNull();
      expect(tester.confirmedComponent).toBeNull();

      expect(tester.editConfirmationComponent.basket).toBe(basket);
    });

    it('should confirm when edit confirmation component emits', () => {
      basketService.confirm.and.returnValue(of(undefined));

      tester.editConfirmationComponent.basketConfirmed.emit('CODE');
      tester.detectChanges();

      expect(basketService.confirm).toHaveBeenCalledWith('ABCDEFGH', 'CODE');
      expect(tester.componentInstance.basket).toBe(confirmedBasket);
      expect(tester.editConfirmationComponent).toBeNull();
      expect(tester.confirmedComponent).not.toBeNull();
      expect(tester.confirmedComponent.basket).toBe(confirmedBasket);
    });

    it('should refresh when edit confirmation component asks to', () => {
      tester.editConfirmationComponent.refreshRequested.emit(undefined);
      tester.detectChanges();

      expect(tester.componentInstance.basket).toBe(confirmedBasket);
    });
  });
});
