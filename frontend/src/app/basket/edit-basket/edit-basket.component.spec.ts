import { TestBed } from '@angular/core/testing';

import { EditBasketComponent } from './edit-basket.component';
import { ComponentTester, createMock, TestButton } from 'ngx-speculoos';
import { Component } from '@angular/core';
import { Basket, BasketCommand } from '../basket.model';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { ConfirmationService } from '../../shared/confirmation.service';
import { of } from 'rxjs';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

@Component({
  template: `@if (basket) {
    <rb-edit-basket [basket]="basket" (basketSaved)="savedCommand = $event" />
  }`,
  imports: [EditBasketComponent]
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

  get customerOrganization() {
    return this.input('#organization');
  }

  get customerEmail() {
    return this.input('#email');
  }

  get customerDeliveryAddress() {
    return this.textarea('#delivery-address');
  }

  get customerBillingAddress() {
    return this.textarea('#billing-address');
  }

  get useDeliveryAddress() {
    return this.input('#use-delivery-address');
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
    confirmationService = createMock(ConfirmationService);

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: ConfirmationService, useValue: confirmationService }]
    });

    TestBed.createComponent(ValidationDefaultsComponent).detectChanges();

    tester = new TestComponentTester();
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
      expect(tester.customerDeliveryAddress).toHaveValue('');
      expect(tester.customerBillingAddress).toHaveValue('');
      expect(tester.useDeliveryAddress).not.toBeChecked();
      expect(tester.customerType).toHaveSelectedLabel('');
      expect(tester.rationale).toHaveValue('');
      expect(tester.accessionsHolderTitles.length).toBe(2);
      expect(tester.accessionsHolderTitles[0]).toHaveText('GRC1 - Contact1');
      expect(tester.accessionsHolderTitles[1]).toHaveText('GRC2 - Contact2');
      expect(tester.accessionsTables.length).toBe(2);
      expect(tester.accessionsHeadings(0).length).toBe(2);
      expect(tester.accessionsHeadings(1).length).toBe(2);
      expect(tester.accessionsHeadings(0)[0]).toHaveText('Accession');
      expect(tester.accessionsHeadings(0)[1]).toHaveText('Actions');
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
      expect(tester.accessionsHeadings(0)[2]).toHaveText('Actions');
      expect(tester.accessions[0]).toContainText('10 bags');
    });

    it('should validate and not save', () => {
      tester.detectChanges();

      tester.saveButton.click();
      expect(tester.componentInstance.savedCommand).toBeNull();
      expect(tester.errors.length).toBe(6);
      expect(tester.testElement).toContainText('Le nom est obligatoire');
      expect(tester.testElement).toContainText(`L'adresse courriel est obligatoire`);
      expect(tester.testElement).toContainText(`L'adresse postale de livraison est obligatoire`);
      expect(tester.testElement).toContainText(`L'adresse postale de facturation est obligatoire`);
      expect(tester.testElement).toContainText(`La catégorie est obligatoire`);
      expect(tester.testElement).toContainText(`Vous devez cocher cette case pour pouvoir finaliser votre commande`);
    });

    it('should save', () => {
      tester.componentInstance.basket.accessionHolderBaskets[0].items[0].quantity = 10;
      tester.componentInstance.basket.accessionHolderBaskets[0].items[0].unit = 'bags';
      tester.detectChanges();

      tester.customerName.fillWith('John');
      tester.customerOrganization.fillWith('Wheat SA');
      tester.customerEmail.fillWith('john@mail.com');
      tester.customerDeliveryAddress.fillWith('21 Jump Street');
      tester.customerBillingAddress.fillWith('21 Jump Street - billing service');
      tester.customerType.selectLabel('Citoyen');
      tester.rationale.fillWith('Because');
      tester.gdprAgreement.check();

      tester.saveButton.click();
      expect(tester.errors.length).toBe(0);

      const expectedCommand: BasketCommand = {
        customer: {
          name: 'John',
          organization: 'Wheat SA',
          email: 'john@mail.com',
          deliveryAddress: '21 Jump Street',
          billingAddress: '21 Jump Street - billing service',
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

    it('should use the delivery address as the billing address', () => {
      tester.detectChanges();

      tester.customerName.fillWith('John');
      tester.customerOrganization.fillWith('Wheat SA');
      tester.customerEmail.fillWith('john@mail.com');
      tester.customerDeliveryAddress.fillWith('21 Jump Street');
      tester.useDeliveryAddress.check();
      expect(tester.customerBillingAddress.disabled).toBe(true);
      tester.customerType.selectLabel('Citoyen');
      tester.rationale.fillWith('Because');
      tester.gdprAgreement.check();

      tester.saveButton.click();
      expect(tester.errors.length).toBe(0);
      expect(tester.componentInstance.savedCommand.customer.billingAddress).toEqual(
        tester.componentInstance.savedCommand.customer.deliveryAddress
      );
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
          organization: 'Wheat SA',
          email: 'john@mail.com',
          deliveryAddress: '21 Jump Street',
          billingAddress: '21 Jump Street - billing service',
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
      expect(tester.customerOrganization).toHaveValue('Wheat SA');
      expect(tester.customerEmail).toHaveValue('john@mail.com');
      expect(tester.customerDeliveryAddress).toHaveValue('21 Jump Street');
      expect(tester.customerBillingAddress).toHaveValue('21 Jump Street - billing service');
      expect(tester.useDeliveryAddress).not.toBeChecked();
      expect(tester.customerType).toHaveSelectedLabel('Citoyen');
      expect(tester.rationale).toHaveValue('Because');
    });
  });
});
