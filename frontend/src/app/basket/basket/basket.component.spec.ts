import { TestBed } from '@angular/core/testing';

import { BasketComponent } from './basket.component';
import { ComponentTester, fakeRoute, fakeSnapshot, speculoosMatchers } from 'ngx-speculoos';
import { EditBasketComponent } from '../edit-basket/edit-basket.component';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Basket, BasketCommand } from '../basket.model';
import { BasketService } from '../basket.service';
import { of } from 'rxjs';
import { RbNgbModule } from '../../rb-ngb/rb-ngb.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../shared/shared.module';
import { ValdemortModule } from 'ngx-valdemort';

class BasketComponentTester extends ComponentTester<BasketComponent> {
  constructor() {
    super(BasketComponent);
  }

  get title() {
    return this.element('h1');
  }

  get editBasketComponent(): EditBasketComponent {
    return this.debugElement.query(By.directive(EditBasketComponent))?.componentInstance ?? null;
  }
}

describe('BasketComponent', () => {
  let tester: BasketComponentTester;
  let basketService: jasmine.SpyObj<BasketService>;

  beforeEach(() => {
    const route = fakeRoute({
      snapshot: fakeSnapshot({
        params: {
          reference: 'ABCDEFGH'
        }
      })
    });

    basketService = jasmine.createSpyObj<BasketService>('BasketService', ['get', 'save']);

    TestBed.configureTestingModule({
      declarations: [BasketComponent, EditBasketComponent],
      imports: [RbNgbModule, ReactiveFormsModule, FontAwesomeModule, SharedModule, ValdemortModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: BasketService, useValue: basketService }
      ]
    });

    tester = new BasketComponentTester();

    jasmine.addMatchers(speculoosMatchers);
  });

  describe('with draft basket', () => {
    let basket: Basket;
    let savedBasket: Basket;

    beforeEach(() => {
      basket = {
        reference: 'ABCDEFGH',
        status: 'DRAFT',
        items: []
      } as Basket;

      savedBasket = {
        reference: 'ABCDEFGH',
        status: 'SAVED',
        items: []
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
    });

    it('should save basket when edit component emits', () => {
      const command = {} as BasketCommand;

      basketService.save.and.returnValue(of(undefined));

      tester.editBasketComponent.basketSaved.emit(command);
      tester.detectChanges();

      expect(basketService.save).toHaveBeenCalledWith('ABCDEFGH', command);
      expect(tester.componentInstance.basket).toBe(savedBasket);
      expect(tester.editBasketComponent).toBeNull();
    });
  });

  describe('with a saved basket', () => {
    let basket: Basket;

    beforeEach(() => {
      basket = {
        reference: 'ABCDEFGH',
        status: 'SAVED',
        items: []
      } as Basket;

      basketService.get.and.returnValues(of(basket));

      tester.detectChanges();
    });

    it('should not have an edit component', () => {
      expect(basketService.get).toHaveBeenCalledWith('ABCDEFGH');
      expect(tester.editBasketComponent).toBeNull();
    });
  });
});
