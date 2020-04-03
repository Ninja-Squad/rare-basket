import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Basket } from '../basket.model';
import { faAddressCard, faAt, faCommentDots, faHome, faUser } from '@fortawesome/free-solid-svg-icons';

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
  customerTypeIcon = faAddressCard;
  rationaleIcon = faCommentDots;

  quantityDisplayed = false;

  ngOnChanges() {
    this.quantityDisplayed = this.basket.accessionHolderBaskets.some(accessionHolderBasket =>
      accessionHolderBasket.items.some(item => !!item.quantity)
    );
  }
}
