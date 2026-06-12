import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Basket } from '../basket.model';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { BasketContentComponent } from '../basket-content/basket-content.component';
import { TranslateDirective } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/**
 * Component displayed when the basket is confirmed
 */
@Component({
  selector: 'rb-confirmed',
  templateUrl: './confirmed.component.html',
  styleUrl: './confirmed.component.scss',
  imports: [FaIconComponent, TranslateDirective, BasketContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmedComponent {
  readonly basket = input.required<Basket>();

  readonly confirmedIcon = faCheckCircle;
}
