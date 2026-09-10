import { Component, output, input, ChangeDetectionStrategy, signal } from '@angular/core';
import { Basket } from '../basket.model';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { faCheckCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { BasketContentComponent } from '../basket-content/basket-content.component';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/**
 * Component displayed once the user has saved the basket, informing the customer about the
 * email that has been sent for confirmation, and asking for the confirmation code.
 */
@Component({
  selector: 'rb-edit-confirmation',
  templateUrl: './edit-confirmation.component.html',
  styleUrl: './edit-confirmation.component.scss',
  imports: [FaIconComponent, TranslateDirective, TranslatePipe, FormRoot, FormField, BasketContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditConfirmationComponent {
  readonly basket = input.required<Basket>();

  readonly basketConfirmed = output<string>();
  readonly refreshRequested = output<void>();

  private readonly formValue = signal({ confirmationCode: '' });
  readonly form = form(
    this.formValue,
    f => {
      required(f.confirmationCode);
    },
    {
      submission: {
        action: async () => {
          await this.confirm();
          return undefined;
        }
      }
    }
  );
  readonly infoIcon = faInfoCircle;
  readonly confirmIcon = faCheckCircle;

  async confirm(): Promise<void> {
    this.basketConfirmed.emit(this.formValue().confirmationCode.trim());
  }

  refresh() {
    this.refreshRequested.emit(undefined);
  }
}
