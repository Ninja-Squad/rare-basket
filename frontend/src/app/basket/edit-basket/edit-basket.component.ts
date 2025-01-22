import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  linkedSignal,
  LOCALE_ID,
  OnInit,
  output,
  signal
} from '@angular/core';
import {
  AccessionHolderBasket,
  ALL_CUSTOMER_TYPES,
  Basket,
  BasketCommand,
  BasketItemCommand,
  CustomerType,
  Language
} from '../basket.model';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationService } from '../../shared/confirmation.service';
import { environment } from '../../../environments/environment';
import { startWith, timer } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { DecimalPipe } from '@angular/common';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { ValidationErrorDirective, ValidationErrorsComponent } from 'ngx-valdemort';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';

@Component({
  selector: 'rb-edit-basket',
  templateUrl: './edit-basket.component.html',
  styleUrl: './edit-basket.component.scss',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    ValidationErrorsComponent,
    NgbCollapse,
    AccessionComponent,
    FaIconComponent,
    ValidationErrorDirective,
    DecimalPipe,
    FormControlValidationDirective,
    CustomerTypeEnumPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditBasketComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmationService = inject(ConfirmationService);

  readonly basket = input.required<Basket>();
  readonly accessionHolderBaskets = linkedSignal<Array<AccessionHolderBasket>>(() => this.basket().accessionHolderBaskets);

  readonly basketSaved = output<BasketCommand>();

  readonly gdprDetailsUrl = environment.gdprDetailsUrl;
  readonly customerTypes = ALL_CUSTOMER_TYPES;

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly language: Language = inject(LOCALE_ID) as Language;
  readonly form = this.fb.group({
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
  readonly useDeliveryAddressControl = this.fb.control(false);

  readonly deleteIcon = faTrash;
  readonly saveIcon = faCheck;

  readonly quantityDisplayed = computed(() =>
    this.accessionHolderBaskets().some(accessionHolderBasket => accessionHolderBasket.items.some(item => !!item.quantity))
  );
  readonly deleteItemDisabled = computed(
    () => this.accessionHolderBaskets().length === 1 && this.accessionHolderBaskets()[0].items.length === 1
  );
  readonly saveForbidden = signal(false);

  constructor() {
    this.useDeliveryAddressControl.valueChanges
      .pipe(startWith(this.useDeliveryAddressControl.value), takeUntilDestroyed())
      .subscribe(useDeliveryAddress => {
        const billingAddressControl = this.form.controls.customer.controls.billingAddress;
        if (useDeliveryAddress) {
          billingAddressControl.disable();
        } else {
          billingAddressControl.enable();
        }
      });
  }

  ngOnInit() {
    const customer = this.basket().customer;
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
      rationale: this.basket().rationale ?? null,
      gdprAgreement: false
    });
    this.useDeliveryAddressControl.setValue(!!customer?.deliveryAddress && customer?.deliveryAddress === customer?.billingAddress);
  }

  deleteItemAt(accessionHolderBasketIndex: number, itemIndex: number) {
    this.confirmationService
      .confirm({ messageKey: 'basket.edit-basket.confirm-accession-deletion' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
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

  save() {
    if (!this.form.valid) {
      this.saveForbidden.set(true);
      timer(350)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.saveForbidden.set(false));
      return;
    }

    const itemCommands: Array<BasketItemCommand> = this.accessionHolderBaskets().flatMap(ahb =>
      ahb.items.map(item => ({
        accession: item.accession,
        quantity: item.quantity,
        unit: item.unit
      }))
    );

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
}
