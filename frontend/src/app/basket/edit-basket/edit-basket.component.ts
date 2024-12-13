import { Component, inject, Input, LOCALE_ID, OnInit, output } from '@angular/core';
import { ALL_CUSTOMER_TYPES, Basket, BasketCommand, BasketItemCommand, CustomerType, Language } from '../basket.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService } from '../../shared/confirmation.service';
import { environment } from '../../../environments/environment';
import { timer } from 'rxjs';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { DecimalPipe } from '@angular/common';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { ValidationErrorDirective, ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-edit-basket',
  templateUrl: './edit-basket.component.html',
  styleUrl: './edit-basket.component.scss',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    FormControlValidationDirective,
    ValidationErrorsComponent,
    NgbCollapse,
    AccessionComponent,
    FaIconComponent,
    ValidationErrorDirective,
    DecimalPipe,
    CustomerTypeEnumPipe
  ]
})
export class EditBasketComponent implements OnInit {
  private confirmationService = inject(ConfirmationService);

  @Input({ required: true }) basket!: Basket;

  readonly basketSaved = output<BasketCommand>();

  gdprDetailsUrl = environment.gdprDetailsUrl;
  customerTypes = ALL_CUSTOMER_TYPES;

  private fb = inject(NonNullableFormBuilder);
  private language: Language = inject(LOCALE_ID) as Language;
  form = this.fb.group({
    customer: this.fb.group({
      name: [null as string | null, Validators.required],
      organization: [null as string | null],
      email: [null as string | null, [Validators.required, Validators.email]],
      deliveryAddress: [null as string | null, Validators.required],
      billingAddress: [null as string | null, Validators.required],
      type: [null as CustomerType | null, Validators.required],
      language: this.language
    }),
    rationale: null as string | null,
    gdprAgreement: [false, Validators.requiredTrue]
  });
  useDeliveryAddressControl = this.fb.control(false);

  deleteIcon = faTrash;
  saveIcon = faCheck;

  quantityDisplayed = false;
  deleteItemDisabled = false;
  saveForbidden = false;

  ngOnInit(): void {
    const customer = this.basket.customer;
    const customerGroup = {
      name: customer?.name ?? null,
      organization: customer?.organization ?? null,
      email: customer?.email ?? null,
      deliveryAddress: customer?.deliveryAddress ?? null,
      billingAddress: customer?.billingAddress ?? null,
      type: customer?.type ?? null,
      language: this.language
    };
    this.form.setValue({
      customer: customerGroup,
      rationale: this.basket.rationale ?? null,
      gdprAgreement: false
    });
    this.useDeliveryAddressControl.setValue(!!customer?.deliveryAddress && customer?.deliveryAddress === customer?.billingAddress);
    this.useDeliveryAddressControl.valueChanges.subscribe(useDeliveryAddress => {
      const billingAddressControl = this.form.controls.customer.controls.billingAddress;
      if (useDeliveryAddress) {
        billingAddressControl.disable();
      } else {
        billingAddressControl.enable();
      }
    });
    this.quantityDisplayed = this.shouldDisplayQuantity();
    this.deleteItemDisabled = this.shouldDisableDeleteItem();
  }

  deleteItemAt(accessionHolderBasketIndex: number, itemIndex: number) {
    this.confirmationService.confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' }).subscribe(() => {
      const accessionHolderBasket = this.basket.accessionHolderBaskets[accessionHolderBasketIndex];
      accessionHolderBasket.items.splice(itemIndex, 1);
      if (accessionHolderBasket.items.length === 0) {
        this.basket.accessionHolderBaskets.splice(accessionHolderBasketIndex, 1);
      }

      this.quantityDisplayed = this.shouldDisplayQuantity();
      this.deleteItemDisabled = this.shouldDisableDeleteItem();
    });
  }

  save() {
    if (this.form.invalid) {
      this.saveForbidden = true;
      timer(350).subscribe(() => (this.saveForbidden = false));
      return;
    }

    const itemCommands: Array<BasketItemCommand> = [];
    this.basket.accessionHolderBaskets.forEach(accessionHolderBasket => {
      accessionHolderBasket.items.forEach(item => {
        itemCommands.push({
          accession: item.accession,
          quantity: item.quantity,
          unit: item.unit
        });
      });
    });

    const value = this.form.getRawValue();
    // use the delivery address for the billing address if necessary
    const customer = value.customer;
    customer.billingAddress = this.useDeliveryAddressControl.value ? customer.deliveryAddress : customer.billingAddress;
    const command: BasketCommand = {
      customer: {
        name: customer.name!,
        type: customer.type!,
        email: customer.email!,
        billingAddress: customer.billingAddress!,
        deliveryAddress: customer.deliveryAddress!,
        language: customer.language,
        organization: customer.organization
      },
      rationale: value.rationale,
      complete: true,
      items: itemCommands
    };
    this.basketSaved.emit(command);
  }

  private shouldDisplayQuantity() {
    return this.basket.accessionHolderBaskets.some(accessionHolderBasket => accessionHolderBasket.items.some(item => !!item.quantity));
  }

  private shouldDisableDeleteItem() {
    return this.basket.accessionHolderBaskets.length === 1 && this.basket.accessionHolderBaskets[0].items.length === 1;
  }
}
