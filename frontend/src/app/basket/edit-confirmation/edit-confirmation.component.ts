import { Component, inject, Input, output } from '@angular/core';
import { Basket } from '../basket.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { BasketContentComponent } from '../basket-content/basket-content.component';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/**
 * Component displayed once the user has saved the basket, informing the customer about the
 * email that has been sent for confirmation, and asking for the confirmation code.
 */
@Component({
  selector: 'rb-edit-confirmation',
  templateUrl: './edit-confirmation.component.html',
  styleUrl: './edit-confirmation.component.scss',
  imports: [FaIconComponent, TranslateModule, ReactiveFormsModule, FormControlValidationDirective, BasketContentComponent]
})
export class EditConfirmationComponent {
  @Input({ required: true }) basket!: Basket;

  readonly basketConfirmed = output<string>();
  readonly refreshRequested = output<void>();

  form = inject(NonNullableFormBuilder).group({
    confirmationCode: ['', Validators.required]
  });
  infoIcon = faInfoCircle;
  confirmIcon = faCheckCircle;

  confirm() {
    if (this.form.invalid) {
      return;
    }

    this.basketConfirmed.emit(this.form.controls.confirmationCode.value.trim());
  }

  refresh() {
    this.refreshRequested.emit(undefined);
  }
}
