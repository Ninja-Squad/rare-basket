import { TestBed } from '@angular/core/testing';

import { BasketContentComponent } from './basket-content.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Basket } from '../basket.model';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

@Component({
  template: '<rb-basket-content [basket]="basket" />',
  imports: [BasketContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  basket = {
    customer: {
      name: 'John Doe',
      organization: 'Boom Inc.',
      email: 'john@mail.com',
      deliveryAddress: 'Av. du Centre\n75000 Paris',
      billingAddress: 'Av. du Centre - billing service\n75000 Paris',
      type: 'CITIZEN',
      language: 'fr'
    },
    rationale: 'Why not?',
    accessionHolderBaskets: [
      {
        grcName: 'GRC1',
        accessionHolderName: 'Contact1',
        items: [
          {
            id: 1,
            accession: {
              name: 'Rosa',
              identifier: 'rosa1',
              accessionNumber: null,
              taxon: 'rosaTaxon',
              url: 'https://rosa.com'
            },
            quantity: 1234,
            unit: 'bags'
          },
          {
            id: 2,
            accession: {
              name: 'Violetta',
              identifier: 'violetta1',
              accessionNumber: 'violettaNumber',
              taxon: 'violettaTaxon',
              url: 'https://violetta.com'
            },
            quantity: 5,
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
              identifier: 'bacteria1',
              accessionNumber: null,
              taxon: 'bacteriaTaxon',
              url: 'https://bacteria.com'
            },
            quantity: null,
            unit: null
          }
        ]
      }
    ]
  } as Basket;
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly items = this.root.getByCss('.basket-item');
  readonly accessionHolderTitles = this.root.getByCss('h3');
  readonly itemTables = this.root.getByCss('table');
  readonly componentInstance = this.fixture.componentInstance;

  itemTableHeadings(index: number) {
    return this.itemTables.nth(index).getByCss('th');
  }
}

describe('BasketContentComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    tester = new TestComponentTester();
  });

  test('should display customer information', async () => {
    await expect.element(tester.root).toHaveTextContent('John');
    await expect.element(tester.root).toHaveTextContent('Boom Inc.');
    await expect.element(tester.root).toHaveTextContent('john@mail.com');
    await expect.element(tester.root).toHaveTextContent(/Av\. du Centre\s*75000 Paris/);
    await expect.element(tester.root).toHaveTextContent(/Av\. du Centre - billing service\s*75000 Paris/);
    await expect.element(tester.root).toHaveTextContent('Citoyen');
    await expect.element(tester.root).toHaveTextContent('Why not?');
    await expect.element(tester.root).not.toHaveTextContent('Français');
  });

  test('should display one section per accession holder basket', async () => {
    await expect.element(tester.accessionHolderTitles).toHaveLength(2);
    await expect.element(tester.accessionHolderTitles.nth(0)).toHaveTextContent('GRC1 - Contact1');
    await expect.element(tester.accessionHolderTitles.nth(1)).toHaveTextContent('GRC2 - Contact2');
    await expect.element(tester.itemTables).toHaveLength(2);
  });

  test('should display basket items', async () => {
    await expect.element(tester.itemTableHeadings(0)).toHaveLength(4);
    await expect.element(tester.items).toHaveLength(3);
    await expect.element(tester.items.nth(0)).toHaveTextContent('Rosa');
    await expect.element(tester.items.nth(0)).toHaveTextContent('rosaTaxon');
    await expect.element(tester.items.nth(0)).toHaveTextContent(/1\s*234 bags/);
    await expect.element(tester.items.nth(1)).toHaveTextContent('Violetta');
    await expect.element(tester.items.nth(1)).toHaveTextContent('violettaNumber');
    await expect.element(tester.items.nth(1)).toHaveTextContent('violettaTaxon');
    await expect.element(tester.itemTableHeadings(0)).toHaveLength(4);
  });

  test('should display basket items without quantity if no item has a quantity', async () => {
    tester.componentInstance.basket.accessionHolderBaskets.forEach(accessionHolderBasket => {
      accessionHolderBasket.items.forEach(item => (item.quantity = null));
    });

    await expect.element(tester.itemTableHeadings(0)).toHaveLength(3);
    await expect.element(tester.itemTableHeadings(1)).toHaveLength(3);
  });

  test('should display basket items without accession number if no item has one', async () => {
    tester.componentInstance.basket.accessionHolderBaskets.forEach(accessionHolderBasket => {
      accessionHolderBasket.items.forEach(item => (item.accession.accessionNumber = null));
    });

    await expect.element(tester.itemTableHeadings(0)).toHaveLength(3);
    await expect.element(tester.itemTableHeadings(1)).toHaveLength(3);
  });
});
