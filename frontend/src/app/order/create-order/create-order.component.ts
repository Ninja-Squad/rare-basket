import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { OrderCreationCommand } from '../order.model';
import { OrderService } from '../order.service';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/toast.service';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { disabled, email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ALL_CUSTOMER_TYPES, ALL_LANGUAGES, CustomerCommand, CustomerType, Language } from '../../basket/basket.model';
import { CustomerTypeEnumPipe } from '../../shared/customer-type-enum.pipe';
import { LanguageEnumPipe } from '../../shared/language-enum.pipe';
import { ValidationSignalErrorsComponent } from 'ngx-valdemort';
import { NgbCollapse } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../shared/authentication.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { first, firstValueFrom, map, tap } from 'rxjs';

@Component({
  selector: 'rb-create-order',
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.scss',
  imports: [
    TranslateDirective,
    TranslatePipe,
    FormRoot,
    FormField,
    CustomerTypeEnumPipe,
    LanguageEnumPipe,
    ValidationSignalErrorsComponent,
    NgbCollapse
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateOrderComponent {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly formValue = signal({
    // Native select values are strings; parse back to a number on submit.
    accessionHolderId: '',
    customer: {
      name: '',
      organization: '',
      email: '',
      deliveryAddress: '',
      billingAddress: '',
      type: '' as CustomerType | '',
      language: '' as Language | ''
    },
    rationale: '',
    useDeliveryAddress: false
  });
  readonly form = form(
    this.formValue,
    f => {
      required(f.accessionHolderId);
      required(f.customer.name);
      required(f.customer.email);
      email(f.customer.email);
      required(f.customer.deliveryAddress);
      required(f.customer.billingAddress);
      disabled(f.customer.billingAddress, { when: ({ valueOf }) => valueOf(f.useDeliveryAddress) });
      required(f.customer.type);
      required(f.customer.language);
    },
    {
      submission: {
        action: async () => {
          await this.save();
          return undefined;
        }
      }
    }
  );
  readonly customerTypes = ALL_CUSTOMER_TYPES;
  readonly languages = ALL_LANGUAGES;
  readonly accessionHolders = toSignal(
    inject(AuthenticationService)
      .getCurrentUser()
      .pipe(
        first(),
        map(u => u?.accessionHolders ?? []),
        tap(accessionHolders => {
          if (accessionHolders.length === 1) {
            this.formValue.update(value => ({ ...value, accessionHolderId: accessionHolders[0].id.toString() }));
          }
        })
      )
  );

  async save(): Promise<void> {
    const formValue = this.formValue();
    const customer: CustomerCommand = {
      name: formValue.customer.name,
      organization: formValue.customer.organization || null,
      email: formValue.customer.email,
      deliveryAddress: formValue.customer.deliveryAddress,
      billingAddress: formValue.useDeliveryAddress ? formValue.customer.deliveryAddress : formValue.customer.billingAddress,
      type: formValue.customer.type as CustomerType,
      language: formValue.customer.language as Language
    };
    const command: OrderCreationCommand = {
      accessionHolderId: parseInt(formValue.accessionHolderId),
      customer,
      rationale: formValue.rationale || null
    };

    const order = await firstValueFrom(this.orderService.createOrder(command));
    await this.router.navigate(['/orders', order.id], { replaceUrl: true });
    this.toastService.success('order.create-order.created');
  }

  cancel() {
    this.router.navigate(['/orders', 'in-progress']);
  }
}
