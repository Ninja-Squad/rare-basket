import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Basket } from '../basket.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { BasketContentComponent } from '../basket-content/basket-content.component';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * Component displayed once the user has saved the basket, informing the customer about the
 * email that has been sent for confirmation, and asking for the confirmation code.
 */
@Component({
  selector: 'rb-edit-confirmation',
  templateUrl: './edit-confirmation.component.html',
  styleUrl: './edit-confirmation.component.scss',
  standalone: true,
  imports: [FontAwesomeModule, TranslateModule, ReactiveFormsModule, FormControlValidationDirective, BasketContentComponent]
})
export class EditConfirmationComponent {
  @Input() basket: Basket;

  @Output() readonly basketConfirmed = new EventEmitter<string>();
  @Output() readonly refreshRequested = new EventEmitter<void>();

  form = inject(NonNullableFormBuilder).group({
    confirmationCode: ['', Validators.required]
  });
  infoIcon = faInfoCircle;
  confirmIcon = faCheckCircle;

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
