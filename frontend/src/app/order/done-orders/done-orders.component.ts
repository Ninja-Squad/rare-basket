import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { OrdersComponent } from '../orders/orders.component';
import { FormField } from '@angular/forms/signals';
import { TranslateDirective } from '@ngx-translate/core';
import { OrderListService } from '../order-list.service';
import { AuthenticationService } from '../../shared/authentication.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'rb-done-orders',
  templateUrl: './done-orders.component.html',
  styleUrl: './done-orders.component.scss',
  imports: [OrdersComponent, FormField, TranslateDirective, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoneOrdersComponent {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly orderListService = inject(OrderListService);

  readonly loadingIcon = faSpinner;
  readonly errorIcon = faExclamationCircle;

  readonly page = input(0, { transform: (value: string | undefined) => parseInt(value ?? '0') });
  // eslint-disable-next-line @angular-eslint/no-input-rename -- the query parameter is named h
  readonly holder = input<string>(undefined, { alias: 'h' });
  readonly user = toSignal(this.authenticationService.getCurrentUser());
  readonly form = this.orderListService.createForm(this.holder, this.user);
  readonly orders = this.orderListService.doneOrders(this.page, this.holder, this.user);

  filterByAccessionHolder() {
    this.orderListService.filterByAccessionHolder(this.form().value);
  }
}
