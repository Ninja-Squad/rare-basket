import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES } from '../../basket/basket.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  customerTypes = ALL_CUSTOMER_TYPES;
  languages = ALL_LANGUAGES;

  constructor(fb: FormBuilder) {
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
    if (this.customerInformation) {
      const customer = this.customerInformation.customer;
      const formValue: CustomerInformationCommand = {
        customer: {
          name: customer.name,
          organization: customer.organization,
          email: customer.email,
          deliveryAddress: customer.deliveryAddress,
          billingAddress: customer.billingAddress,
          type: customer.type,
          language: customer.language
        },
        rationale: this.customerInformation.rationale
      };
      this.form.setValue(formValue);
    }
  }

  save() {
    if (this.form.invalid) {
      return;
    }
    this.saved.emit(this.form.value as CustomerInformationCommand);
  }

  cancel() {
    this.cancelled.emit(undefined);
  }
}
