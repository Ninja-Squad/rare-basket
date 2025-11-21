import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
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
  imports: [TranslateModule, CustomerInformationComponent, AccessionComponent, DecimalPipe],
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
