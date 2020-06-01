import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES, Customer } from '../../basket/basket.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderCustomerCommand } from '../order.model';

@Component({
  selector: 'rb-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss']
})
export class EditCustomerComponent implements OnInit {
  @Input()
  customer: Customer;

  @Output()
  readonly saved = new EventEmitter<OrderCustomerCommand>();

  @Output()
  readonly cancelled = new EventEmitter<void>();

  form: FormGroup;
  customerTypes = ALL_CUSTOMER_TYPES;
  languages = ALL_LANGUAGES;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      name: [null, Validators.required],
      organization: null,
      email: [null, [Validators.required, Validators.email]],
      address: [null, Validators.required],
      type: [null, Validators.required],
      language: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.form.setValue(this.customer as OrderCustomerCommand);
  }

  save() {
    if (this.form.invalid) {
      return;
    }
    this.saved.emit(this.form.value as OrderCustomerCommand);
  }

  cancel() {
    this.cancelled.emit(undefined);
  }
}
