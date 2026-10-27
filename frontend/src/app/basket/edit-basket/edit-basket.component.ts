import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, LOCALE_ID, output, signal } from '@angular/core';
import { disabled, email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { ValidationErrorDirective, ValidationSignalErrorsComponent } from 'ngx-valdemort';
import { environment } from '../../../environments/environment';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { ConfirmationService } from '../../shared/confirmation.service';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import {
  AccessionHolderBasket,
  ALL_CUSTOMER_TYPES,
  Basket,
  BasketCommand,
  BasketItemCommand,
  CustomerCommand,
  CustomerType,
  Language
} from '../basket.model';

@Component({
  selector: 'rb-edit-basket',
  templateUrl: './edit-basket.component.html',
  styleUrl: './edit-basket.component.scss',
  imports: [
    TranslateDirective,
    TranslatePipe,
    FormRoot,
    FormField,
    ValidationSignalErrorsComponent,
    NgbCollapse,
    AccessionComponent,
    FaIconComponent,
    ValidationErrorDirective,
    DecimalPipe,
    CustomerTypeEnumPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditBasketComponent {
  private readonly confirmationService = inject(ConfirmationService);

  readonly basket = input.required<Basket>();
  readonly accessionHolderBaskets = linkedSignal<Array<AccessionHolderBasket>>(() => this.basket().accessionHolderBaskets);

  readonly basketSaved = output<BasketCommand>();

  readonly gdprDetailsUrl = environment.gdprDetailsUrl;
  readonly customerTypes = ALL_CUSTOMER_TYPES;

  private readonly language: Language = inject(LOCALE_ID) as Language;
  private readonly formValue = linkedSignal(() => {
    const customer = this.basket().customer;
    return {
      customer: {
        name: customer?.name ?? '',
        organization: customer?.organization ?? '',
        email: customer?.email ?? '',
        deliveryAddress: customer?.deliveryAddress ?? '',
        billingAddress: customer?.billingAddress ?? '',
        type: customer?.type ?? ('' as CustomerType | ''),
        language: this.language
      },
      rationale: this.basket().rationale ?? '',
      gdprAgreement: false,
      useDeliveryAddress: !!customer?.deliveryAddress && customer?.deliveryAddress === customer?.billingAddress
    };
  });
  readonly form = form(
    this.formValue,
    f => {
      required(f.customer.name);
      required(f.customer.email);
      email(f.customer.email);
      required(f.customer.deliveryAddress);
      required(f.customer.billingAddress);
      disabled(f.customer.billingAddress, { when: ({ valueOf }) => valueOf(f.useDeliveryAddress) });
      required(f.customer.type);
      required(f.gdprAgreement);
    },
    {
      submission: {
        action: async () => {
          await this.save();
          return undefined;
        },
        onInvalid: () => this.temporarilyForbidSave()
      }
    }
  );

  readonly deleteIcon = faTrash;
  readonly saveIcon = faCheck;

  readonly quantityDisplayed = computed(() =>
    this.accessionHolderBaskets().some(accessionHolderBasket => accessionHolderBasket.items.some(item => !!item.quantity))
  );
  readonly accessionNumberDisplayed = computed(() =>
    this.accessionHolderBaskets().some(accessionHolderBasket => accessionHolderBasket.items.some(item => !!item.accession.accessionNumber))
  );
  readonly deleteItemDisabled = computed(
    () => this.accessionHolderBaskets().length === 1 && this.accessionHolderBaskets()[0].items.length === 1
  );
  readonly saveForbidden = signal(false);

  deleteItemAt(accessionHolderBasketIndex: number, itemIndex: number) {
    this.confirmationService.confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' }).subscribe(() => {
      this.accessionHolderBaskets.update(accessionHolderBaskets =>
        accessionHolderBaskets
          .map((ahb, ahbIndex) =>
            ahbIndex === accessionHolderBasketIndex
              ? {
                  ...ahb,
                  items: ahb.items.filter((_, index) => index !== itemIndex)
                }
              : ahb
          )
          .filter(ahb => ahb.items.length > 0)
      );
    });
  }

  async save(): Promise<void> {
    const itemCommands: Array<BasketItemCommand> = this.accessionHolderBaskets().flatMap(ahb =>
      ahb.items.map(item => ({
        accession: item.accession,
        quantity: item.quantity,
        unit: item.unit
      }))
    );

    const value = this.formValue();
    // use the delivery address for the billing address if necessary
    const customer: CustomerCommand = {
      name: value.customer.name,
      type: value.customer.type as CustomerType,
      email: value.customer.email,
      billingAddress: value.useDeliveryAddress ? value.customer.deliveryAddress : value.customer.billingAddress,
      deliveryAddress: value.customer.deliveryAddress,
      language: value.customer.language,
      organization: value.customer.organization || null
    };
    const command: BasketCommand = {
      customer,
      rationale: value.rationale || null,
      complete: true,
      items: itemCommands
    };
    this.basketSaved.emit(command);
  }

  private temporarilyForbidSave() {
    this.saveForbidden.set(true);
    setTimeout(() => this.saveForbidden.set(false), 350);
  }
}
