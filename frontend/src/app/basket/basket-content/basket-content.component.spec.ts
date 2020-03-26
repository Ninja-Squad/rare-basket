import { TestBed } from '@angular/core/testing';

import { BasketContentComponent } from './basket-content.component';
import { Component, LOCALE_ID } from '@angular/core';
import { Basket } from '../basket.model';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { SharedModule } from '../../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';

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
    items: [
      {
        id: 1,
        accession: 'rosa',
        quantity: 1234
      },
      {
        id: 2,
        accession: 'violetta',
        quantity: 5
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
}

describe('BasketContentComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BasketContentComponent, TestComponent],
      imports: [SharedModule, FontAwesomeModule],
      providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
    });

    tester = new TestComponentTester();
    tester.detectChanges();
    jasmine.addMatchers(speculoosMatchers);
  });

  it('should display customer information', () => {
    expect(tester.testElement).toContainText('John');
    expect(tester.testElement).toContainText('john@mail.com');
    expect(tester.testElement).toContainText('Av. du Centre\n75000 Paris');
    expect(tester.testElement).toContainText('Biologiste');
    expect(tester.testElement).toContainText('Why not?');
  });

  it('should display basket items', () => {
    expect(tester.items.length).toBe(2);
    expect(tester.items[0]).toContainText('rosa');
    expect(tester.items[0]).toContainText('1 234');
    expect(tester.items[1]).toContainText('violetta');
  });
});
