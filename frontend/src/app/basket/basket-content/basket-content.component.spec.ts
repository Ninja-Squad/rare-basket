import { TestBed } from '@angular/core/testing';

import { BasketContentComponent } from './basket-content.component';
import { Component, LOCALE_ID } from '@angular/core';
import { Basket } from '../basket.model';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { SharedModule } from '../../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';

registerLocaleData(localeFr);

@Component({
  template: '<rb-basket-content [basket]="basket"></rb-basket-content>'
})
class TestComponent {
  basket = {
    customer: {
      name: 'John Doe',
      email: 'john@mail.com',
      address: 'Av. du Centre\n75000 Paris',
      type: 'BIOLOGIST'
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
              identifier: 'rosa1'
            },
            quantity: 1234
          },
          {
            id: 2,
            accession: {
              name: 'Violetta',
              identifier: 'violetta1'
            },
            quantity: 5
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
            quantity: null
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
      declarations: [BasketContentComponent, TestComponent],
      imports: [I18nTestingModule, SharedModule, FontAwesomeModule],
      providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
    });

    tester = new TestComponentTester();
    jasmine.addMatchers(speculoosMatchers);
  });

  it('should display customer information', () => {
    tester.detectChanges();

    expect(tester.testElement).toContainText('John');
    expect(tester.testElement).toContainText('john@mail.com');
    expect(tester.testElement).toContainText('Av. du Centre\n75000 Paris');
    expect(tester.testElement).toContainText('Biologiste');
    expect(tester.testElement).toContainText('Why not?');
  });

  it('should display one section per accession holder basket', () => {
    tester.detectChanges();

    expect(tester.accessionHolderTitles.length).toBe(2);
    expect(tester.accessionHolderTitles[0]).toHaveText('GRC1 - Contact1');
    expect(tester.accessionHolderTitles[1]).toHaveText('GRC2 - Contact2');
    expect(tester.itemTables.length).toBe(2);
  });

  it('should display basket items', () => {
    tester.detectChanges();

    expect(tester.itemTableHeadings(0).length).toBe(2);
    expect(tester.items.length).toBe(3);
    expect(tester.items[0]).toContainText('Rosa');
    expect(tester.items[0]).toContainText('rosa1');
    expect(tester.items[0]).toContainText('1 234');
    expect(tester.items[1]).toContainText('Violetta');
    expect(tester.items[1]).toContainText('violetta1');

    expect(tester.itemTableHeadings(0).length).toBe(2);
  });

  it('should display basket items without quantity if no item has a quantity', () => {
    tester.componentInstance.basket.accessionHolderBaskets.forEach(accessionHolderBasket => {
      accessionHolderBasket.items.forEach(item => (item.quantity = null));
    });
    tester.detectChanges();

    expect(tester.itemTableHeadings(0).length).toBe(1);
    expect(tester.itemTableHeadings(1).length).toBe(1);
  });
});
