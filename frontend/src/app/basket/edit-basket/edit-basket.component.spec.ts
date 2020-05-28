import { TestBed } from '@angular/core/testing';

import { EditBasketComponent } from './edit-basket.component';
import { ComponentTester, speculoosMatchers, TestButton } from 'ngx-speculoos';
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
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';

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

  get gdprAgreement() {
    return this.input('#gdpr-agreement');
  }

  get saveButton() {
    return this.button('#save');
  }

  get errors() {
    return this.elements('.invalid-feedback div');
  }

  get accessionsHolderTitles() {
    return this.elements('h3');
  }

  get accessionsTables() {
    return this.elements('table');
  }

  accessionsHeadings(index: number) {
    return this.accessionsTables[index].elements('th');
  }

  get accessions() {
    return this.elements('.accession');
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
      imports: [I18nTestingModule, RbNgbModule, ReactiveFormsModule, FontAwesomeModule, SharedModule, ValdemortModule],
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
        accessionHolderBaskets: [
          {
            grcName: 'GRC1',
            accessionHolderName: 'Contact1',
            items: [
              {
                id: 1,
                accession: {
                  name: 'Rosa',
                  identifier: 'rosa1'
                },
                quantity: null,
                unit: null
              },
              {
                id: 2,
                accession: {
                  name: 'Violetta',
                  identifier: 'violetta1'
                },
                quantity: null,
                unit: null
              }
            ]
          },
          {
            grcName: 'GRC2',
            accessionHolderName: 'Contact2',
            items: [
              {
                id: 3,
                accession: {
                  name: 'Bacteria',
                  identifier: 'bacteria1'
                },
                quantity: null,
                unit: null
              }
            ]
          }
        ]
      };
    });

    it('should display an empty form', () => {
      tester.detectChanges();

      expect(tester.customerName).toHaveValue('');
      expect(tester.customerEmail).toHaveValue('');
      expect(tester.customerAddress).toHaveValue('');
      expect(tester.customerType).toHaveSelectedLabel('');
      expect(tester.rationale).toHaveValue('');
      expect(tester.accessionsHolderTitles.length).toBe(2);
      expect(tester.accessionsHolderTitles[0]).toHaveText('GRC1 - Contact1');
      expect(tester.accessionsHolderTitles[1]).toHaveText('GRC2 - Contact2');
      expect(tester.accessionsTables.length).toBe(2);
      expect(tester.accessionsHeadings(0).length).toBe(2);
      expect(tester.accessionsHeadings(1).length).toBe(2);
      expect(tester.accessionsHeadings(0)[0]).toHaveText('Accession');
      expect(tester.accessionsHeadings(0)[1]).toHaveText('');
      expect(tester.accessions.length).toBe(3);
      expect(tester.accessions[0]).toContainText('Rosa');
      expect(tester.accessions[0]).toContainText('rosa1');
      expect(tester.accessions[1]).toContainText('Violetta');
      expect(tester.accessions[1]).toContainText('violetta1');
      expect(tester.gdprAgreement).not.toBeChecked();
    });

    it('should display quantities if at least one is set', () => {
      tester.componentInstance.basket.accessionHolderBaskets[0].items[0].quantity = 10;
      tester.componentInstance.basket.accessionHolderBaskets[0].items[0].unit = 'bags';
      tester.detectChanges();

      expect(tester.accessionsHeadings(0).length).toBe(3);
      expect(tester.accessionsHeadings(1).length).toBe(3);
      expect(tester.accessionsHeadings(0)[0]).toHaveText('Accession');
      expect(tester.accessionsHeadings(0)[1]).toHaveText('Quantité');
      expect(tester.accessionsHeadings(0)[2]).toHaveText('');
      expect(tester.accessions[0]).toContainText('10 bags');
    });

    it('should validate and not save', () => {
      tester.detectChanges();

      tester.saveButton.click();
      expect(tester.componentInstance.savedCommand).toBeNull();
      expect(tester.errors.length).toBe(5);
      expect(tester.testElement).toContainText('Le nom est obligatoire');
      expect(tester.testElement).toContainText(`L'adresse courriel est obligatoire`);
      expect(tester.testElement).toContainText(`L'adresse postale est obligatoire`);
      expect(tester.testElement).toContainText(`La catégorie est obligatoire`);
      expect(tester.testElement).toContainText(`Vous devez cocher cette case pour pouvoir finaliser votre commande`);
    });

    it('should save', () => {
      tester.componentInstance.basket.accessionHolderBaskets[0].items[0].quantity = 10;
      tester.componentInstance.basket.accessionHolderBaskets[0].items[0].unit = 'bags';
      tester.detectChanges();

      tester.customerName.fillWith('John');
      tester.customerEmail.fillWith('john@mail.com');
      tester.customerAddress.fillWith('21 Jump Street');
      tester.customerType.selectLabel('Citoyen');
      tester.rationale.fillWith('Because');
      tester.gdprAgreement.check();

      tester.saveButton.click();
      expect(tester.errors.length).toBe(0);

      const expectedCommand: BasketCommand = {
        customer: {
          name: 'John',
          email: 'john@mail.com',
          address: '21 Jump Street',
          type: 'CITIZEN',
          language: 'fr'
        },
        rationale: 'Because',
        items: [
          {
            accession: {
              name: 'Rosa',
              identifier: 'rosa1'
            },
            quantity: 10,
            unit: 'bags'
          },
          {
            accession: {
              name: 'Violetta',
              identifier: 'violetta1'
            },
            quantity: null,
            unit: null
          },
          {
            accession: {
              name: 'Bacteria',
              identifier: 'bacteria1'
            },
            quantity: null,
            unit: null
          }
        ],
        complete: true
      };
      expect(tester.componentInstance.savedCommand).toEqual(expectedCommand);
    });

    it('should remove accession after confirmation and make last one removal disabled', () => {
      tester.componentInstance.basket.accessionHolderBaskets[0].items[0].quantity = 10;
      tester.detectChanges();

      confirmationService.confirm.and.returnValue(of(undefined));

      // delete first of 3 items
      tester.accessionDeleteButtons[0].click();

      expect(confirmationService.confirm).toHaveBeenCalled();
      expect(tester.accessionsTables.length).toBe(2);
      expect(tester.accessions.length).toBe(2);
      expect(tester.accessions[0]).toContainText('Violetta');
      expect(tester.accessionsHeadings(0).length).toBe(2); // because there is no accession with a quantity anymore

      // delete first of 2 items
      tester.accessionDeleteButtons[0].click();
      expect(tester.accessionsTables.length).toBe(1); // because the first accession holder basket is now empty, thus removed
      expect(tester.accessions.length).toBe(1);
      expect(tester.accessions[0]).toContainText('Bacteria');

      expect(tester.accessionDeleteButtons[0].disabled).toBe(true); // because it's the last one, which can thus not be deleted
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
          type: 'CITIZEN',
          language: 'en'
        },
        rationale: 'Because',
        status: 'DRAFT',
        accessionHolderBaskets: [
          {
            grcName: 'GRC1',
            accessionHolderName: 'Contact1',
            items: [
              {
                id: 1,
                accession: {
                  name: 'Rosa',
                  identifier: 'rosa1'
                },
                quantity: null,
                unit: null
              }
            ]
          }
        ]
      };

      tester.detectChanges();
    });

    it('should display a filled form', () => {
      expect(tester.customerName).toHaveValue('John');
      expect(tester.customerEmail).toHaveValue('john@mail.com');
      expect(tester.customerAddress).toHaveValue('21 Jump Street');
      expect(tester.customerType).toHaveSelectedLabel('Citoyen');
      expect(tester.rationale).toHaveValue('Because');
    });
  });
});
