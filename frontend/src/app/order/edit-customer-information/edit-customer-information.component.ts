import { Component, output, input, ChangeDetectionStrategy, linkedSignal } from '@angular/core';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES, CustomerCommand, CustomerType, Language } from '../../basket/basket.model';
import { disabled, email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { CustomerInformationCommand } from '../order.model';
import { LanguageEnumPipe } from '../../shared/language-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';

import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { ValidationSignalErrorsComponent } from 'ngx-valdemort';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'rb-edit-customer-information',
  templateUrl: './edit-customer-information.component.html',
  styleUrl: './edit-customer-information.component.scss',
  imports: [
    FormRoot,
    FormField,
    TranslateDirective,
    TranslatePipe,
    ValidationSignalErrorsComponent,
    NgbCollapse,
    CustomerTypeEnumPipe,
    LanguageEnumPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditCustomerInformationComponent {
  readonly customerInformation = input.required<CustomerInformationCommand>();

  readonly saved = output<CustomerInformationCommand>();
  readonly cancelled = output<void>();

  private readonly formValue = linkedSignal(() => {
    const customer = this.customerInformation().customer;
    return {
      customer: {
        name: customer.name,
        organization: customer.organization ?? '',
        email: customer.email,
        deliveryAddress: customer.deliveryAddress,
        billingAddress: customer.billingAddress,
        type: customer.type as CustomerType | '',
        language: customer.language as Language | ''
      },
      rationale: this.customerInformation().rationale ?? '',
      useDeliveryAddress: !!customer.billingAddress && customer.billingAddress === customer.deliveryAddress
    };
  });
  readonly form = form(
    this.formValue,
    f => {
      required(f.customer.name);
      required(f.customer.email);
      email(f.customer.email);
      required(f.customer.deliveryAddress);
      required(f.customer.billingAddress);
      disabled(f.customer.billingAddress, { when: ({ valueOf }) => valueOf(f.useDeliveryAddress) });
      required(f.customer.type);
      required(f.customer.language);
    },
    {
      submission: {
        action: async () => {
          await this.save();
          return undefined;
        }
      }
    }
  );
  readonly customerTypes = ALL_CUSTOMER_TYPES;
  readonly languages = ALL_LANGUAGES;

  async save(): Promise<void> {
    const formValue = this.formValue();
    const customer: CustomerCommand = {
      name: formValue.customer.name,
      organization: formValue.customer.organization || null,
      email: formValue.customer.email,
      deliveryAddress: formValue.customer.deliveryAddress,
      billingAddress: formValue.useDeliveryAddress ? formValue.customer.deliveryAddress : formValue.customer.billingAddress,
      type: formValue.customer.type as CustomerType,
      language: formValue.customer.language as Language
    };
    const customerInformationCommand: CustomerInformationCommand = {
      customer,
      rationale: formValue.rationale || null
    };
    this.saved.emit(customerInformationCommand);
  }

  cancel() {
    this.cancelled.emit(undefined);
  }
}
