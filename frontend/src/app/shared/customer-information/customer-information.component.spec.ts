import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentTester } from 'ngx-speculoos';
import { Customer } from '../../basket/basket.model';
import { CustomerInformationComponent } from './customer-information.component';
import { provideI18nTesting } from '../../i18n/mock-18n';

@Component({
  template: '<rb-customer-information [customer]="customer()" [rationale]="rationale()" [withLanguage]="withLanguage()" />',
  imports: [CustomerInformationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  readonly customer = signal<Customer>({
    name: 'John Doe',
    organization: 'Boom Inc.',
    email: 'john@mail.com',
    deliveryAddress: 'Av. du Centre\n75000 Paris',
    billingAddress: 'Av. du Centre - billing service\n75000 Paris',
    type: 'CITIZEN',
    language: 'fr'
  });

  readonly rationale = signal('Why not?');
  readonly withLanguage = signal(false);
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

  it('should display customer information', async () => {
    await tester.stable();

    expect(tester.testElement).toContainText('John');
    expect(tester.testElement).toContainText('Entreprise ou organisation');
    expect(tester.testElement).toContainText('Boom Inc.');
    expect(tester.testElement).toContainText('john@mail.com');
    expect(tester.testElement).toContainText('Av. du Centre\n75000 Paris');
    expect(tester.testElement).toContainText('Av. du Centre - billing service\n75000 Paris');
    expect(tester.testElement).toContainText('Citoyen');
    expect(tester.testElement).toContainText('Why not?');
    expect(tester.testElement).not.toContainText('Français');

    tester.componentInstance.withLanguage.set(true);
    tester.componentInstance.customer.update(customer => ({ ...customer, organization: '' }));
    await tester.stable();

    expect(tester.testElement).toContainText('Français');
    expect(tester.testElement).not.toContainText('Entreprise ou organisation');
  });
});
