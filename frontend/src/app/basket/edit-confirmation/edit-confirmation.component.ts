import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Basket } from '../basket.model';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

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

  @Output() readonly basketConfirmed = new EventEmitter<string>();
  @Output() readonly refreshRequested = new EventEmitter<void>();

  form: UntypedFormGroup;
  infoIcon = faInfoCircle;
  confirmIcon = faCheckCircle;

  constructor(private fb: UntypedFormBuilder) {}

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
