import { Component } from '@angular/core';
import { OrderCreationCommand } from '../order.model';
import { OrderService } from '../order.service';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/toast.service';
import { TranslateModule } from '@ngx-translate/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES, CustomerCommand, CustomerType } from '../../basket/basket.model';
import { AccessionHolder } from '../../shared/user.model';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { FormControlValidationDirective } from '../../shared/form-control-validation.directive';
import { LanguageEnumPipe } from '../../shared/language-enum.pipe';
import { ValidationErrorsComponent } from 'ngx-valdemort';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { AuthenticationService } from '../../shared/authentication.service';
import { first, map, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

@Component({
  selector: 'rb-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    CustomerTypeEnumPipe,
    FormControlValidationDirective,
    LanguageEnumPipe,
    NgFor,
    ValidationErrorsComponent,
    NgbCollapse,
    NgIf,
    AsyncPipe
  ]
})
export class CreateOrderComponent {
  form = this.fb.group({
    accessionHolder: [null as AccessionHolder | null, Validators.required],
    customer: this.fb.group({
      name: [null as string, Validators.required],
      organization: null as string,
      email: [null as string, [Validators.required, Validators.email]],
      deliveryAddress: [null as string, Validators.required],
      billingAddress: [null as string, Validators.required],
      type: [null as CustomerType, Validators.required],
      language: [null as string, Validators.required]
    }),
    rationale: null as string
  });
  useDeliveryAddressControl = this.fb.control(false);
  customerTypes = ALL_CUSTOMER_TYPES;
  languages = ALL_LANGUAGES;
  accessionHolders$: Observable<Array<AccessionHolder>>;

  constructor(
    authenticationService: AuthenticationService,
    private fb: NonNullableFormBuilder,
    private orderService: OrderService,
    private router: Router,
    private toastService: ToastService
  ) {
    // if we use the delivery address as the billing address
    // then disable the billing address field
    this.useDeliveryAddressControl.valueChanges.subscribe(useDeliveryAddress => {
      const billingAddressControl = this.form.controls.customer.controls.billingAddress;
      if (useDeliveryAddress) {
        billingAddressControl.disable();
      } else {
        billingAddressControl.enable();
      }
    });

    this.accessionHolders$ = authenticationService.getCurrentUser().pipe(
      first(),
      map(u => u.accessionHolders),
      tap(accessionHolders => {
        if (accessionHolders.length === 1) {
          this.form.controls.accessionHolder.setValue(accessionHolders[0]);
        }
      }),
      takeUntilDestroyed()
    );
  }

  save() {
    if (!this.form.valid) {
      return;
    }
    const formValue = this.form.value;
    const command: OrderCreationCommand = {
      accessionHolderId: formValue.accessionHolder.id,
      customer: formValue.customer as CustomerCommand,
      rationale: formValue.rationale
    };
    command.customer.billingAddress = this.useDeliveryAddressControl.value
      ? command.customer.deliveryAddress
      : command.customer.billingAddress;

    this.orderService.createOrder(command).subscribe(order => {
      this.router.navigate(['/orders', order.id], { replaceUrl: true });
      this.toastService.success('order.create-order.created');
    });
  }

  cancel() {
    this.router.navigate(['/orders', 'in-progress']);
  }
}
