import { Component, Input } from '@angular/core';
import { Basket } from '../basket.model';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

/**
 * Component displayed when the basket is confirmed
 */
@Component({
  selector: 'rb-confirmed',
  templateUrl: './confirmed.component.html',
  styleUrls: ['./confirmed.component.scss']
})
export class ConfirmedComponent {
  @Input() basket: Basket;

  confirmedIcon = faCheckCircle;
}
