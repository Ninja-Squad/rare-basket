import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from '@angular/core';
import { ALL_CUSTOMER_TYPES, Basket, BasketCommand, BasketItemCommand, CustomerType, Language } from '../basket.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService } from '../../shared/confirmation.service';
import { environment } from '../../../environments/environment';
import { timer } from 'rxjs';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { ValidationErrorDirective, ValidationErrorsComponent } from 'ngx-valdemort';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-edit-basket',
  templateUrl: './edit-basket.component.html',
  styleUrl: './edit-basket.component.scss',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    FormControlValidationDirective,
    ValidationErrorsComponent,
    NgbCollapse,
    NgFor,
    NgIf,
    AccessionComponent,
    FontAwesomeModule,
    ValidationErrorDirective,
    DecimalPipe,
    CustomerTypeEnumPipe
  ]
})
export class EditBasketComponent implements OnInit {
  @Input() basket: Basket;

  @Output() readonly basketSaved = new EventEmitter<BasketCommand>();

  gdprDetailsUrl = environment.gdprDetailsUrl;
  customerTypes = ALL_CUSTOMER_TYPES;
  form = this.fb.group({
    customer: this.fb.group({
      name: [null as string, Validators.required],
      organization: [null as string],
      email: [null as string, [Validators.required, Validators.email]],
      deliveryAddress: [null as string, Validators.required],
      billingAddress: [null as string, Validators.required],
      type: [null as CustomerType, Validators.required],
      language: this.language
    }),
    rationale: null as string,
    gdprAgreement: [false, Validators.requiredTrue]
  });
  useDeliveryAddressControl = this.fb.control(false);

  deleteIcon = faTrash;
  saveIcon = faCheck;

  quantityDisplayed = false;
  deleteItemDisabled = false;
  saveForbidden = false;

  constructor(
    private fb: NonNullableFormBuilder,
    private confirmationService: ConfirmationService,
    @Inject(LOCALE_ID) private language: Language
  ) {}

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
    this.useDeliveryAddressControl.setValue(customer?.deliveryAddress && customer?.deliveryAddress === customer?.billingAddress);
    this.useDeliveryAddressControl.valueChanges.subscribe(useDeliveryAddress => {
      const billingAddressControl = this.form.get('customer.billingAddress');
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

    const value = this.form.value;
    // use the delivery address for the billing address if necessary
    const customer = value.customer;
    customer.billingAddress = this.useDeliveryAddressControl.value ? customer.deliveryAddress : customer.billingAddress;
    const command: BasketCommand = {
      customer: {
        name: customer.name,
        type: customer.type,
        email: customer.email,
        billingAddress: customer.billingAddress,
        deliveryAddress: customer.deliveryAddress,
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
