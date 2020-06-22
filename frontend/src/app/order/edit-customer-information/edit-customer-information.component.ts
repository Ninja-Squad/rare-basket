import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES, CustomerCommand } from '../../basket/basket.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomerInformationCommand } from '../order.model';

@Component({
  selector: 'rb-edit-customer-information',
  templateUrl: './edit-customer-information.component.html',
  styleUrls: ['./edit-customer-information.component.scss']
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

  form: FormGroup;
  useDeliveryAddressControl: FormControl;
  customerTypes = ALL_CUSTOMER_TYPES;
  languages = ALL_LANGUAGES;

  constructor(fb: FormBuilder) {
    this.useDeliveryAddressControl = fb.control(false);
    this.form = fb.group({
      customer: fb.group({
        name: [null, Validators.required],
        organization: null,
        email: [null, [Validators.required, Validators.email]],
        deliveryAddress: [null, Validators.required],
        billingAddress: [null, Validators.required],
        type: [null, Validators.required],
        language: [null, Validators.required]
      }),
      rationale: null
    });
  }

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
