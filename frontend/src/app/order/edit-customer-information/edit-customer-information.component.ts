import { Component, inject, OnInit, output, input, ChangeDetectionStrategy } from '@angular/core';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES, CustomerCommand, CustomerType } from '../../basket/basket.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerInformationCommand } from '../order.model';
import { LanguageEnumPipe } from '../../shared/language-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';

import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';
import { startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'rb-edit-customer-information',
  templateUrl: './edit-customer-information.component.html',
  styleUrl: './edit-customer-information.component.scss',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    FormControlValidationDirective,
    ValidationErrorsComponent,
    NgbCollapse,
    CustomerTypeEnumPipe,
    LanguageEnumPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditCustomerInformationComponent implements OnInit {
  readonly customerInformation = input.required<CustomerInformationCommand>();

  readonly saved = output<CustomerInformationCommand>();
  readonly cancelled = output<void>();

  private fb = inject(NonNullableFormBuilder);
  readonly form = this.fb.group({
    customer: this.fb.group({
      name: [null as string | null, Validators.required],
      organization: null as string | null,
      email: [null as string | null, [Validators.required, Validators.email]],
      deliveryAddress: [null as string | null, Validators.required],
      billingAddress: [null as string | null, Validators.required],
      type: [null as CustomerType | null, Validators.required],
      language: [null as string | null, Validators.required]
    }),
    rationale: null as string | null
  });
  readonly useDeliveryAddressControl = this.fb.control(false);
  readonly customerTypes = ALL_CUSTOMER_TYPES;
  readonly languages = ALL_LANGUAGES;

  constructor() {
    // if we use the delivery address as the billing address
    // then disable the billing address field
    this.useDeliveryAddressControl.valueChanges
      .pipe(startWith(this.useDeliveryAddressControl.value), takeUntilDestroyed())
      .subscribe(useDeliveryAddress => {
        const billingAddressControl = this.form.controls.customer.controls.billingAddress;
        if (useDeliveryAddress) {
          billingAddressControl.disable();
        } else {
          billingAddressControl.enable();
        }
      });
  }

  ngOnInit(): void {
    const customer = this.customerInformation().customer;
    const customerCommand: CustomerCommand = {
      name: customer.name,
      organization: customer.organization,
      email: customer.email,
      deliveryAddress: customer.deliveryAddress,
      billingAddress: customer.billingAddress,
      type: customer.type,
      language: customer.language
    };
    const formValue: CustomerInformationCommand = {
      customer: customerCommand,
      rationale: this.customerInformation().rationale
    };
    this.form.setValue(formValue);
    this.useDeliveryAddressControl.setValue(!!customer.billingAddress && customer.billingAddress === customer.deliveryAddress);
  }

  save() {
    if (!this.form.valid) {
      return;
    }
    const customerInformationCommand = this.form.value as CustomerInformationCommand;
    const customer = customerInformationCommand.customer as CustomerCommand;
    customer.billingAddress = this.useDeliveryAddressControl.value ? customer.deliveryAddress : customer.billingAddress;
    this.saved.emit(customerInformationCommand);
  }

  cancel() {
    this.cancelled.emit(undefined);
  }
}
