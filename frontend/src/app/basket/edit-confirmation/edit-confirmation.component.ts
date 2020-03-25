import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Basket } from '../basket.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faCheckCircle, faExclamationCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

/**
 * Component displayed once the user has saved the basket, informing the customer about the
 * email that has been sent for confirmation, and asking for the confirmation code.
 */
@Component({
  selector: 'rb-edit-confirmation',
  templateUrl: './edit-confirmation.component.html',
  styleUrls: ['./edit-confirmation.component.scss']
})
export class EditConfirmationComponent implements OnInit {
  @Input() basket: Basket;
  @Input() confirmationFailed: boolean;

  @Output() readonly basketConfirmed = new EventEmitter<string>();
  @Output() readonly refreshRequested = new EventEmitter<void>();

  form: FormGroup;
  infoIcon = faInfoCircle;
  confirmIcon = faCheckCircle;
  errorIcon = faExclamationCircle;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      confirmationCode: ['', Validators.required]
    });
  }

  confirm() {
    if (this.form.invalid) {
      return;
    }

    this.basketConfirmed.emit(this.form.value.confirmationCode.trim());
  }

  refresh() {
    this.refreshRequested.emit(undefined);
  }
}
