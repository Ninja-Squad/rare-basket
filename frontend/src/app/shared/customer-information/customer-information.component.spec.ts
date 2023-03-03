import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ComponentTester } from 'ngx-speculoos';
import { Customer } from '../../basket/basket.model';
import { CustomerInformationComponent } from './customer-information.component';
import { provideI18nTesting } from '../../i18n/mock-18n.spec';

@Component({
  template:
    '<rb-customer-information [customer]="customer" [rationale]="rationale" [withLanguage]="withLanguage"></rb-customer-information>',
  standalone: true,
  imports: [CustomerInformationComponent]
})
class TestComponent {
  customer: Customer = {
    name: 'John Doe',
    organization: 'Boom Inc.',
    email: 'john@mail.com',
    deliveryAddress: 'Av. du Centre\n75000 Paris',
    billingAddress: 'Av. du Centre - billing service\n75000 Paris',
    type: 'CITIZEN',
    language: 'fr'
  };

  rationale = 'Why not?';
  withLanguage = false;
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }
}

describe('CustomerInformationComponent', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideI18nTesting()]
    });

    tester = new TestComponentTester();
  });

  it('should display customer information', () => {
    tester.detectChanges();

    expect(tester.testElement).toContainText('John');
    expect(tester.testElement).toContainText('Entreprise ou organisation');
    expect(tester.testElement).toContainText('Boom Inc.');
    expect(tester.testElement).toContainText('john@mail.com');
    expect(tester.testElement).toContainText('Av. du Centre\n75000 Paris');
    expect(tester.testElement).toContainText('Av. du Centre - billing service\n75000 Paris');
    expect(tester.testElement).toContainText('Citoyen');
    expect(tester.testElement).toContainText('Why not?');
    expect(tester.testElement).not.toContainText('Français');

    tester.componentInstance.withLanguage = true;
    tester.componentInstance.customer.organization = '';
    tester.detectChanges();

    expect(tester.testElement).toContainText('Français');
    expect(tester.testElement).not.toContainText('Entreprise ou organisation');
  });
});
