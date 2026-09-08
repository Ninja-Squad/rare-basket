import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Customer } from '../../basket/basket.model';
import { CustomerInformationComponent } from './customer-information.component';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

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

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);

  get componentInstance() {
    return this.fixture.componentInstance;
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

  test('should display customer information', async () => {
    await expect.element(tester.root).toMatchTextContent('John');
    await expect.element(tester.root).toMatchTextContent('Entreprise ou organisation');
    await expect.element(tester.root).toMatchTextContent('Boom Inc.');
    await expect.element(tester.root).toMatchTextContent('john@mail.com');
    await expect.element(tester.root).toMatchTextContent(/Av\. du Centre\s*75000 Paris/);
    await expect.element(tester.root).toMatchTextContent(/Av\. du Centre - billing service\s*75000 Paris/);
    await expect.element(tester.root).toMatchTextContent('Citoyen');
    await expect.element(tester.root).toMatchTextContent('Why not?');
    await expect.element(tester.root).not.toMatchTextContent('Français');

    tester.componentInstance.withLanguage.set(true);
    tester.componentInstance.customer.update(customer => ({ ...customer, organization: '' }));
    await tester.fixture.whenStable();

    await expect.element(tester.root).toMatchTextContent('Français');
    await expect.element(tester.root).not.toMatchTextContent('Entreprise ou organisation');
  });
});
