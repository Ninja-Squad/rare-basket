import { TestBed } from '@angular/core/testing';

import { EditBasketComponent } from './edit-basket.component';
import { ComponentTester, speculoosMatchers, TestButton, TestInput } from 'ngx-speculoos';
import { Component } from '@angular/core';
import { Basket, BasketCommand } from '../basket.model';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { RbNgbModule } from '../../rb-ngb/rb-ngb.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../../shared/shared.module';
import { ValdemortModule } from 'ngx-valdemort';
import { ConfirmationService } from '../../shared/confirmation.service';
import { of } from 'rxjs';

@Component({
  template: '<rb-edit-basket [basket]="basket" (basketSaved)="savedCommand = $event"></rb-edit-basket>'
})
class TestComponent {
  basket: Basket;
  savedCommand: BasketCommand = null;
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get customerName() {
    return this.input('#name');
  }

  get customerEmail() {
    return this.input('#email');
  }

  get customerAddress() {
    return this.textarea('#address');
  }

  get customerType() {
    return this.select('#type');
  }

  get rationale() {
    return this.textarea('#rationale');
  }

  get quantities(): Array<TestInput> {
    return this.elements('.quantity') as Array<TestInput>;
  }

  get saveButton() {
    return this.button('#save');
  }

  get errors() {
    return this.elements('.invalid-feedback div');
  }

  get accessionTitles() {
    return this.elements('.accession h3');
  }

  get accessionDeleteButtons(): Array<TestButton> {
    return this.elements('.accession .delete-btn') as Array<TestButton>;
  }
}

describe('EditBasketComponent', () => {
  let tester: TestComponentTester;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;

  beforeEach(() => {
    confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);

    TestBed.configureTestingModule({
      declarations: [EditBasketComponent, TestComponent, ValidationDefaultsComponent],
      imports: [RbNgbModule, ReactiveFormsModule, FontAwesomeModule, SharedModule, ValdemortModule],
      providers: [{ provide: ConfirmationService, useValue: confirmationService }]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new TestComponentTester();

    jasmine.addMatchers(speculoosMatchers);
  });

  describe('with an empty draft basket', () => {
    beforeEach(() => {
      tester.componentInstance.basket = {
        id: 42,
        reference: 'ABCDEFGH',
        customer: null,
        rationale: null,
        status: 'DRAFT',
        items: [
          {
            id: 1,
            accession: {
              name: 'Rosa',
              identifier: 'rosa1'
            },
            quantity: null
          },
          {
            id: 2,
            accession: {
              name: 'Violetta',
              identifier: 'violetta1'
            },
            quantity: null
          }
        ]
      };

      tester.detectChanges();
    });

    it('should display an empty form', () => {
      expect(tester.customerName).toHaveValue('');
      expect(tester.customerEmail).toHaveValue('');
      expect(tester.customerAddress).toHaveValue('');
      expect(tester.customerType).toHaveSelectedLabel('');
      expect(tester.rationale).toHaveValue('');
      expect(tester.quantities.length).toBe(2);
      tester.quantities.forEach(quantity => expect(quantity).toHaveValue(''));
      expect(tester.accessionTitles[0]).toContainText('Rosa');
      expect(tester.accessionTitles[0]).toContainText('rosa1');
      expect(tester.accessionTitles[1]).toContainText('Violetta');
      expect(tester.accessionTitles[1]).toContainText('violetta1');
    });

    it('should validate and not save', () => {
      tester.saveButton.click();
      expect(tester.componentInstance.savedCommand).toBeNull();
      expect(tester.errors.length).toBe(6);
      expect(tester.testElement).toContainText('Le nom est obligatoire');
      expect(tester.testElement).toContainText(`L'adresse courriel est obligatoire`);
      expect(tester.testElement).toContainText(`L'adresse postale est obligatoire`);
      expect(tester.testElement).toContainText(`Le secteur d'activité est obligatoire`);
      expect(tester.testElement).toContainText(`La quantité est obligatoire`);

      tester.quantities[0].fillWith('0');
      tester.saveButton.click();
      expect(tester.testElement).toContainText(`La quantité doit être supérieure ou égale à 1`);
    });

    it('should save', () => {
      tester.customerName.fillWith('John');
      tester.customerEmail.fillWith('john@mail.com');
      tester.customerAddress.fillWith('21 Jump Street');
      tester.customerType.selectLabel('Biologiste');
      tester.rationale.fillWith('Because');
      tester.quantities[0].fillWith('10');
      tester.quantities[1].fillWith('20');

      tester.saveButton.click();
      expect(tester.errors.length).toBe(0);

      const expectedCommand: BasketCommand = {
        customer: {
          name: 'John',
          email: 'john@mail.com',
          address: '21 Jump Street',
          type: 'BIOLOGIST'
        },
        rationale: 'Because',
        items: [
          {
            accession: {
              name: 'Rosa',
              identifier: 'rosa1'
            },
            quantity: 10
          },
          {
            accession: {
              name: 'Violetta',
              identifier: 'violetta1'
            },
            quantity: 20
          }
        ],
        complete: true
      };
      expect(tester.componentInstance.savedCommand).toEqual(expectedCommand);
    });

    it('should remove accession after confirmation and make last one removal disabled', () => {
      confirmationService.confirm.and.returnValue(of(undefined));
      tester.accessionDeleteButtons[0].click();

      expect(confirmationService.confirm).toHaveBeenCalled();
      expect(tester.quantities.length).toBe(1);
      expect(tester.accessionTitles.length).toBe(1);
      expect(tester.accessionTitles[0]).toContainText('Violetta');
      expect(tester.accessionTitles[0]).toContainText('violetta1');
      expect(tester.accessionDeleteButtons[0].disabled).toBe(true);
    });
  });

  describe('with a non-empty draft basket', () => {
    beforeEach(() => {
      tester.componentInstance.basket = {
        id: 42,
        reference: 'ABCDEFGH',
        customer: {
          name: 'John',
          email: 'john@mail.com',
          address: '21 Jump Street',
          type: 'BIOLOGIST'
        },
        rationale: 'Because',
        status: 'DRAFT',
        items: [
          {
            id: 1,
            accession: {
              name: 'rosa',
              identifier: 'rosa1'
            },
            quantity: 10
          },
          {
            id: 2,
            accession: {
              name: 'rosa',
              identifier: 'rosa2'
            },
            quantity: 20
          }
        ]
      };

      tester.detectChanges();
    });

    it('should display a filled form', () => {
      expect(tester.customerName).toHaveValue('John');
      expect(tester.customerEmail).toHaveValue('john@mail.com');
      expect(tester.customerAddress).toHaveValue('21 Jump Street');
      expect(tester.customerType).toHaveSelectedLabel('Biologiste');
      expect(tester.rationale).toHaveValue('Because');
      expect(tester.quantities[0]).toHaveValue('10');
      expect(tester.quantities[1]).toHaveValue('20');
    });
  });
});
