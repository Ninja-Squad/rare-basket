import { TestBed } from '@angular/core/testing';

import { BasketContentComponent } from './basket-content.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Basket } from '../basket.model';
import { ComponentTester } from 'ngx-speculoos';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

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

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get items() {
    return this.elements('.basket-item');
  }

  get accessionHolderTitles() {
    return this.elements('h3');
  }

  get itemTables() {
    return this.elements('table');
  }

  itemTableHeadings(index: number) {
    return this.itemTables[index].elements('th');
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

  it('should display customer information', async () => {
    await tester.stable();

    expect(tester.testElement).toContainText('John');
    expect(tester.testElement).toContainText('Boom Inc.');
    expect(tester.testElement).toContainText('john@mail.com');
    expect(tester.testElement).toContainText('Av. du Centre\n75000 Paris');
    expect(tester.testElement).toContainText('Av. du Centre - billing service\n75000 Paris');
    expect(tester.testElement).toContainText('Citoyen');
    expect(tester.testElement).toContainText('Why not?');
    expect(tester.testElement).not.toContainText('Français');
  });

  it('should display one section per accession holder basket', async () => {
    await tester.stable();

    expect(tester.accessionHolderTitles.length).toBe(2);
    expect(tester.accessionHolderTitles[0]).toHaveText('GRC1 - Contact1');
    expect(tester.accessionHolderTitles[1]).toHaveText('GRC2 - Contact2');
    expect(tester.itemTables.length).toBe(2);
  });

  it('should display basket items', async () => {
    await tester.stable();

    expect(tester.itemTableHeadings(0).length).toBe(4);
    expect(tester.items.length).toBe(3);
    expect(tester.items[0]).toContainText('Rosa');
    expect(tester.items[0]).toContainText('rosaTaxon');
    expect(tester.items[0]).toContainText('1 234 bags');
    expect(tester.items[1]).toContainText('Violetta');
    expect(tester.items[1]).toContainText('violettaNumber');
    expect(tester.items[1]).toContainText('violettaTaxon');

    expect(tester.itemTableHeadings(0).length).toBe(4);
  });

  it('should display basket items without quantity if no item has a quantity', async () => {
    tester.componentInstance.basket.accessionHolderBaskets.forEach(accessionHolderBasket => {
      accessionHolderBasket.items.forEach(item => (item.quantity = null));
    });
    await tester.stable();

    expect(tester.itemTableHeadings(0).length).toBe(3);
    expect(tester.itemTableHeadings(1).length).toBe(3);
  });

  it('should display basket items without accession number if no item has one', async () => {
    tester.componentInstance.basket.accessionHolderBaskets.forEach(accessionHolderBasket => {
      accessionHolderBasket.items.forEach(item => (item.accession.accessionNumber = null));
    });
    await tester.stable();

    expect(tester.itemTableHeadings(0).length).toBe(3);
    expect(tester.itemTableHeadings(1).length).toBe(3);
  });
});
