import { TestBed } from '@angular/core/testing';

import { EditBasketComponent } from './edit-basket.component';
import { createMock, MockObject } from '../../../test/mock';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AccessionHolderBasket, Basket, BasketCommand, BasketItem } from '../basket.model';
import { ValidationDefaultsComponent } from '../../validation-defaults/validation-defaults.component';
import { ConfirmationService } from '../../shared/confirmation.service';
import { of } from 'rxjs';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

@Component({
  template: `@if (basket(); as basket) {
    <rb-edit-basket [basket]="basket" (basketSaved)="savedCommand.set($event)" />
  }`,
  imports: [EditBasketComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  readonly basket = signal<Basket | null>(null);
  readonly savedCommand = signal<BasketCommand | null>(null);
}

const itemRosa: BasketItem = {
  id: 1,
  accession: {
    name: 'Rosa',
    identifier: 'rosa1',
    accessionNumber: null,
    taxon: 'rosaTaxon',
    url: 'https://rosa.com'
  },
  quantity: null,
  unit: null
};

const itemVioletta: BasketItem = {
  id: 2,
  accession: {
    name: 'Violetta',
    identifier: 'violetta1',
    accessionNumber: 'violettaNumber',
    taxon: 'violettaTaxon',
    url: 'https://violetta.com'
  },
  quantity: null,
  unit: null
};

const itemBacteria: BasketItem = {
  id: 3,
  accession: {
    name: 'Bacteria',
    identifier: 'bacteria1',
    accessionNumber: null,
    taxon: 'bacteriaTaxon',
    url: 'https://bacteria.com'
  },
  quantity: null,
  unit: null
};

const grc1: AccessionHolderBasket = {
  grcName: 'GRC1',
  accessionHolderName: 'Contact1',
  items: [itemRosa, itemVioletta]
};

const grc2: AccessionHolderBasket = {
  grcName: 'GRC2',
  accessionHolderName: 'Contact2',
  items: [itemBacteria]
};

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly customerName = this.root.getByCss('#name');
  readonly customerOrganization = this.root.getByCss('#organization');
  readonly customerEmail = this.root.getByCss('#email');
  readonly customerDeliveryAddress = this.root.getByCss('#delivery-address');
  readonly customerBillingAddress = this.root.getByCss('#billing-address');
  readonly useDeliveryAddress = this.root.getByCss('#use-delivery-address');
  readonly customerType = this.root.getByCss('#type');
  readonly rationale = this.root.getByCss('#rationale');
  readonly gdprAgreement = this.root.getByCss('#gdpr-agreement');
  readonly saveButton = this.root.getByCss('#save');
  readonly errors = this.root.getByCss('.invalid-feedback div');
  readonly accessionsHolderTitles = this.root.getByCss('h3');
  readonly accessionsTables = this.root.getByCss('table');
  readonly accessions = this.root.getByCss('.accession');
  readonly accessionDeleteButtons = this.root.getByCss('.accession .delete-btn');

  get componentInstance() {
    return this.fixture.componentInstance;
  }

  accessionsHeadings(index: number) {
    return this.accessionsTables.nth(index).getByCss('th');
  }

  optionLabels() {
    const select = this.customerType.element() as HTMLSelectElement;
    return Array.from(select.options).map(option => option.textContent ?? '');
  }
}

describe('EditBasketComponent', () => {
  let tester: TestComponentTester;
  let confirmationService: MockObject<ConfirmationService>;

  beforeEach(async () => {
    confirmationService = createMock(ConfirmationService);

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: ConfirmationService, useValue: confirmationService }]
    });

    await TestBed.createComponent(ValidationDefaultsComponent).whenStable();

    tester = new TestComponentTester();
  });

  describe('with an empty draft basket', () => {
    beforeEach(() => {
      tester.componentInstance.basket.set({
        id: 42,
        reference: 'ABCDEFGH',
        customer: null,
        rationale: null,
        status: 'DRAFT',
        accessionHolderBaskets: [grc1, grc2]
      });
    });

    test('should display an empty form', async () => {
      await expect.element(tester.customerName).toHaveValue('');
      await expect.element(tester.customerEmail).toHaveValue('');
      await expect.element(tester.customerDeliveryAddress).toHaveValue('');
      await expect.element(tester.customerBillingAddress).toHaveValue('');
      await expect.element(tester.useDeliveryAddress).not.toBeChecked();
      await expect.element(tester.customerType).toHaveDisplayValue('');
      await expect.element(tester.rationale).toHaveValue('');
      await expect.element(tester.accessionsHolderTitles).toHaveLength(2);
      await expect.element(tester.accessionsHolderTitles.nth(0)).toMatchTextContent('GRC1 - Contact1');
      await expect.element(tester.accessionsHolderTitles.nth(1)).toMatchTextContent('GRC2 - Contact2');
      await expect.element(tester.accessionsTables).toHaveLength(2);
      await expect.element(tester.accessionsHeadings(0)).toHaveLength(4);
      await expect.element(tester.accessionsHeadings(1)).toHaveLength(4);
      await expect.element(tester.accessionsHeadings(0).nth(0)).toMatchTextContent('Nom');
      await expect.element(tester.accessionsHeadings(0).nth(1)).toMatchTextContent(`N° d'accession`);
      await expect.element(tester.accessionsHeadings(0).nth(2)).toMatchTextContent('Taxon');
      await expect.element(tester.accessionsHeadings(0).nth(3)).toMatchTextContent('Actions');
      await expect.element(tester.accessions).toHaveLength(3);
      await expect.element(tester.accessions.nth(0)).toMatchTextContent('Rosa');
      await expect.element(tester.accessions.nth(0)).toMatchTextContent('rosaTaxon');
      await expect.element(tester.accessions.nth(1)).toMatchTextContent('Violetta');
      await expect.element(tester.accessions.nth(1)).toMatchTextContent('violettaNumber');
      await expect.element(tester.accessions.nth(1)).toMatchTextContent('violettaTaxon');
      await expect.element(tester.gdprAgreement).not.toBeChecked();
    });

    test('should display quantities if at least one is set', async () => {
      const itemRosaWith10Bags: BasketItem = {
        ...itemRosa,
        quantity: 10,
        unit: 'bags'
      };

      const grc1WithRosa10Bags: AccessionHolderBasket = {
        ...grc1,
        items: [itemRosaWith10Bags, itemVioletta]
      };

      tester.componentInstance.basket.update(basket => ({
        ...basket!,
        accessionHolderBaskets: [grc1WithRosa10Bags, grc2]
      }));

      await expect.element(tester.accessionsHeadings(0)).toHaveLength(5);
      await expect.element(tester.accessionsHeadings(1)).toHaveLength(5);
      await expect.element(tester.accessionsHeadings(0).nth(0)).toMatchTextContent('Nom');
      await expect.element(tester.accessionsHeadings(0).nth(1)).toMatchTextContent(`N° d'accession`);
      await expect.element(tester.accessionsHeadings(0).nth(2)).toMatchTextContent('Taxon');
      await expect.element(tester.accessionsHeadings(0).nth(3)).toMatchTextContent('Quantité');
      await expect.element(tester.accessionsHeadings(0).nth(4)).toMatchTextContent('Actions');
      await expect.element(tester.accessions.nth(0)).toMatchTextContent('10 bags');
    });

    test('should display accession numbers if at least one is set', async () => {
      await expect.element(tester.accessionsHeadings(0)).toHaveLength(4);
      await expect.element(tester.accessionsHeadings(0).nth(1)).toMatchTextContent(`N° d'accession`);

      confirmationService.confirm.mockReturnValue(of(undefined));
      await tester.accessionDeleteButtons.nth(1).click();

      await expect.element(tester.accessionsHeadings(0)).toHaveLength(3);
      await expect.element(tester.accessionsHeadings(0).nth(1)).toMatchTextContent(`Taxon`);
    });

    test('should validate and not save', async () => {
      await tester.saveButton.click();
      expect(tester.componentInstance.savedCommand()).toBeNull();
      await expect.element(tester.errors).toHaveLength(6);
      await expect.element(tester.root).toMatchTextContent('Le nom est obligatoire');
      await expect.element(tester.root).toMatchTextContent(`L'adresse courriel est obligatoire`);
      await expect.element(tester.root).toMatchTextContent(`L'adresse postale de livraison est obligatoire`);
      await expect.element(tester.root).toMatchTextContent(`L'adresse postale de facturation est obligatoire`);
      await expect.element(tester.root).toMatchTextContent(`La catégorie est obligatoire`);
      await expect.element(tester.root).toMatchTextContent(`Vous devez cocher cette case pour pouvoir finaliser votre commande`);
    });

    test('should save', async () => {
      const itemRosaWith10Bags: BasketItem = {
        ...itemRosa,
        quantity: 10,
        unit: 'bags'
      };

      const grc1WithRosa10Bags: AccessionHolderBasket = {
        ...grc1,
        items: [itemRosaWith10Bags, itemVioletta]
      };

      tester.componentInstance.basket.update(basket => ({
        ...basket!,
        accessionHolderBaskets: [grc1WithRosa10Bags, grc2]
      }));

      await tester.customerName.fill('John');
      await tester.customerOrganization.fill('Wheat SA');
      await tester.customerEmail.fill('john@mail.com');
      await tester.customerDeliveryAddress.fill('21 Jump Street');
      await tester.customerBillingAddress.fill('21 Jump Street - billing service');
      await tester.customerType.selectOptions('Citoyen');
      await tester.rationale.fill('Because');
      await tester.gdprAgreement.click();

      await tester.saveButton.click();
      await expect.element(tester.errors).toHaveLength(0);

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
            accession: itemRosa.accession,
            quantity: 10,
            unit: 'bags'
          },
          {
            accession: itemVioletta.accession,
            quantity: null,
            unit: null
          },
          {
            accession: itemBacteria.accession,
            quantity: null,
            unit: null
          }
        ],
        complete: true
      };
      expect(tester.componentInstance.savedCommand()).toEqual(expectedCommand);
    });

    test('should use the delivery address as the billing address', async () => {
      await tester.customerName.fill('John');
      await tester.customerOrganization.fill('Wheat SA');
      await tester.customerEmail.fill('john@mail.com');
      await tester.customerDeliveryAddress.fill('21 Jump Street');
      await tester.useDeliveryAddress.click();
      await expect.element(tester.customerBillingAddress).toBeDisabled();
      await tester.customerType.selectOptions('Citoyen');
      await tester.rationale.fill('Because');
      await new Promise(resolve => setTimeout(resolve, 100));
      await tester.gdprAgreement.click();
      await tester.saveButton.click();
      await expect.element(tester.errors).toHaveLength(0);
      expect(tester.componentInstance.savedCommand()!.customer.billingAddress).toEqual(
        tester.componentInstance.savedCommand()!.customer.deliveryAddress
      );
    });

    test('should remove accession after confirmation and make last one removal disabled', async () => {
      const itemRosaWith10: BasketItem = {
        ...itemRosa,
        quantity: 10
      };

      const grc1WithRosa10: AccessionHolderBasket = {
        ...grc1,
        items: [itemRosaWith10, itemVioletta]
      };

      tester.componentInstance.basket.update(basket => ({
        ...basket!,
        accessionHolderBaskets: [grc1WithRosa10, grc2]
      }));
      await tester.fixture.whenStable();

      confirmationService.confirm.mockReturnValue(of(undefined));

      // delete first of 3 items
      await tester.accessionDeleteButtons.nth(0).click();

      expect(confirmationService.confirm).toHaveBeenCalled();
      await expect.element(tester.accessionsTables).toHaveLength(2);
      await expect.element(tester.accessions).toHaveLength(2);
      await expect.element(tester.accessions.nth(0)).toMatchTextContent('Violetta');
      await expect.element(tester.accessionsHeadings(0)).toHaveLength(4); // because there is no accession with a quantity anymore

      // delete first of 2 items
      await tester.accessionDeleteButtons.nth(0).click();
      await expect.element(tester.accessionsTables).toHaveLength(1); // because the first accession holder basket is now empty, thus removed
      await expect.element(tester.accessions).toHaveLength(1);
      await expect.element(tester.accessions.nth(0)).toMatchTextContent('Bacteria');

      await expect.element(tester.accessionDeleteButtons.nth(0)).toBeDisabled(); // because it's the last one, which can thus not be deleted
    });
  });

  describe('with a non-empty draft basket', () => {
    beforeEach(async () => {
      tester.componentInstance.basket.set({
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
                accession: itemRosa.accession,
                quantity: null,
                unit: null
              }
            ]
          }
        ]
      });
    });

    test('should display a filled form', async () => {
      await expect.element(tester.customerName).toHaveValue('John');
      await expect.element(tester.customerOrganization).toHaveValue('Wheat SA');
      await expect.element(tester.customerEmail).toHaveValue('john@mail.com');
      await expect.element(tester.customerDeliveryAddress).toHaveValue('21 Jump Street');
      await expect.element(tester.customerBillingAddress).toHaveValue('21 Jump Street - billing service');
      await expect.element(tester.useDeliveryAddress).not.toBeChecked();
      await expect.element(tester.customerType).toHaveDisplayValue('Citoyen');
      await expect.element(tester.rationale).toHaveValue('Because');
    });
  });
});
