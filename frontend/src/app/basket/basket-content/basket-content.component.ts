import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { TranslateDirective } from '@ngx-translate/core';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { CustomerInformationComponent } from '../../shared/customer-information/customer-information.component';
import { Basket } from '../basket.model';

/**
 * Component used to remind the customer of his basket
 */
@Component({
  selector: 'rb-basket-content',
  templateUrl: './basket-content.component.html',
  styleUrl: './basket-content.component.scss',
  imports: [TranslateDirective, CustomerInformationComponent, AccessionComponent, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasketContentComponent {
  readonly basket = input.required<Basket>();

  readonly quantityDisplayed = computed(() =>
    this.basket().accessionHolderBaskets.some(accessionHolderBasket => accessionHolderBasket.items.some(item => !!item.quantity))
  );

  readonly accessionNumberDisplayed = computed(() =>
    this.basket().accessionHolderBaskets.some(accessionHolderBasket =>
      accessionHolderBasket.items.some(item => !!item.accession.accessionNumber)
    )
  );
}
