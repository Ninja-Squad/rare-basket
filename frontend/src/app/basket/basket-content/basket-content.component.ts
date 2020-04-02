import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Basket } from '../basket.model';
import { faAt, faCommentDots, faHome, faIndustry, faUser } from '@fortawesome/free-solid-svg-icons';

/**
 * Component used to remind the customer of his basket
 */
@Component({
  selector: 'rb-basket-content',
  templateUrl: './basket-content.component.html',
  styleUrls: ['./basket-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasketContentComponent implements OnChanges {
  @Input() basket: Basket;

  nameIcon = faUser;
  emailIcon = faAt;
  addressIcon = faHome;
  customerTypeIcon = faIndustry;
  rationaleIcon = faCommentDots;

  quantityDisplayed = false;

  ngOnChanges() {
    this.quantityDisplayed = this.basket.items.some(item => item.quantity);
  }
}
