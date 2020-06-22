import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { ALL_CUSTOMER_TYPES, Basket, BasketCommand, BasketItemCommand, CustomerType, Language } from '../basket.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService } from '../../shared/confirmation.service';
import { environment } from '../../../environments/environment';
import { timer } from 'rxjs';

interface FormValue {
  customer: {
    name: string;
    organization: string;
    email: string;
    deliveryAddress: string;
    billingAddress: string;
    useDeliveryAddress: boolean;
    type: CustomerType;
    language: Language;
  };
  rationale: string;
  rgpdAgreement: boolean;
}

@Component({
  selector: 'rb-edit-basket',
  templateUrl: './edit-basket.component.html',
  styleUrls: ['./edit-basket.component.scss']
})
export class EditBasketComponent implements OnInit {
  @Input() basket: Basket;

  @Output() readonly basketSaved = new EventEmitter<BasketCommand>();

  gdprDetailsUrl = environment.gdprDetailsUrl;
  customerTypes = ALL_CUSTOMER_TYPES;
  form: FormGroup;
  useDeliveryAddressControl: FormControl;

  deleteIcon = faTrash;
  saveIcon = faCheck;

  quantityDisplayed = false;
  deleteItemDisabled = false;
  saveForbidden = false;

  constructor(private fb: FormBuilder, private confirmationService: ConfirmationService, @Inject(LOCALE_ID) private language: Language) {}

  ngOnInit(): void {
    const customer = this.basket.customer;
    const customerGroup = this.fb.group({
      name: [customer?.name ?? null, Validators.required],
      organization: [customer?.organization ?? null],
      email: [customer?.email ?? null, [Validators.required, Validators.email]],
      deliveryAddress: [customer?.deliveryAddress ?? null, Validators.required],
      billingAddress: [customer?.billingAddress ?? null, Validators.required],
      type: [customer?.type ?? null, Validators.required],
      language: this.language
    });
    this.form = this.fb.group({
      customer: customerGroup,
      rationale: [this.basket.rationale],
      gdprAgreement: [false, Validators.requiredTrue]
    });
    this.useDeliveryAddressControl = this.fb.control(customer?.deliveryAddress && customer?.deliveryAddress === customer?.billingAddress);
    this.useDeliveryAddressControl.valueChanges.subscribe(useDeliveryAddress => {
      const billingAddressControl = customerGroup.get('billingAddress');
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

    const value: FormValue = this.form.value as FormValue;
    // use the delivery address for the billing address if necessary
    const customer = value.customer;
    customer.billingAddress = this.useDeliveryAddressControl.value ? customer.deliveryAddress : customer.billingAddress;
    const command: BasketCommand = {
      customer,
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
