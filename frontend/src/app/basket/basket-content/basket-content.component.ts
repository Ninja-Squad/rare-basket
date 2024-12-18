import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { Basket } from '../basket.model';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { DecimalPipe } from '@angular/common';
import { CustomerInformationComponent } from '../../shared/customer-information/customer-information.component';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Component used to remind the customer of his basket
 */
@Component({
  selector: 'rb-basket-content',
  templateUrl: './basket-content.component.html',
  styleUrl: './basket-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, CustomerInformationComponent, AccessionComponent, DecimalPipe]
})
export class BasketContentComponent implements OnChanges {
  @Input({ required: true }) basket!: Basket;

  quantityDisplayed = false;

  ngOnChanges() {
    this.quantityDisplayed = this.basket.accessionHolderBaskets.some(accessionHolderBasket =>
      accessionHolderBasket.items.some(item => !!item.quantity)
    );
  }
}
