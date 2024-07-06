import { Component, Input } from '@angular/core';
import { Basket } from '../basket.model';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { BasketContentComponent } from '../basket-content/basket-content.component';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * Component displayed when the basket is confirmed
 */
@Component({
  selector: 'rb-confirmed',
  templateUrl: './confirmed.component.html',
  styleUrl: './confirmed.component.scss',
  standalone: true,
  imports: [FontAwesomeModule, TranslateModule, BasketContentComponent]
})
export class ConfirmedComponent {
  @Input({ required: true }) basket!: Basket;

  confirmedIcon = faCheckCircle;
}
