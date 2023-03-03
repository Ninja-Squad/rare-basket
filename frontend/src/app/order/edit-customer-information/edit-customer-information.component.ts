import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES, CustomerCommand, CustomerType } from '../../basket/basket.model';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomerInformationCommand } from '../order.model';
import { LanguageEnumPipe } from '../../shared/language-enum.pipe';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { NgFor } from '@angular/common';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-edit-customer-information',
  templateUrl: './edit-customer-information.component.html',
  styleUrls: ['./edit-customer-information.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    FormControlValidationDirective,
    ValidationErrorsComponent,
    NgbCollapse,
    NgFor,
    CustomerTypeEnumPipe,
    LanguageEnumPipe
  ]
})
export class EditCustomerInformationComponent implements OnInit {
  @Input()
  customerInformation: CustomerInformationCommand;

  @Input()
  smallButtons = false;

  @Output()
  readonly saved = new EventEmitter<CustomerInformationCommand>();

  @Output()
  readonly cancelled = new EventEmitter<void>();

  form = this.fb.group({
    customer: this.fb.group({
      name: [null as string, Validators.required],
      organization: null as string,
      email: [null as string, [Validators.required, Validators.email]],
      deliveryAddress: [null as string, Validators.required],
      billingAddress: [null as string, Validators.required],
      type: [null as CustomerType, Validators.required],
      language: [null as string, Validators.required]
    }),
    rationale: null as string
  });
  useDeliveryAddressControl = this.fb.control(false);
  customerTypes = ALL_CUSTOMER_TYPES;
  languages = ALL_LANGUAGES;

  constructor(private fb: NonNullableFormBuilder) {}

  ngOnInit(): void {
    // if we use the delivery address as the billing address
    // then disable the billing address field
    this.useDeliveryAddressControl.valueChanges.subscribe(useDeliveryAddress => {
      const billingAddressControl = this.form.get('customer.billingAddress');
      if (useDeliveryAddress) {
        billingAddressControl.disable();
      } else {
        billingAddressControl.enable();
      }
    });
    if (this.customerInformation) {
      const customer = this.customerInformation.customer;
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
        rationale: this.customerInformation.rationale
      };
      this.form.setValue(formValue);
      this.useDeliveryAddressControl.setValue(customer.billingAddress && customer.billingAddress === customer.deliveryAddress);
    }
  }

  save() {
    if (this.form.invalid) {
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
