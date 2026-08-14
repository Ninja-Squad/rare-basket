import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { faExclamationCircle, faPlus, faSpinner, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { OrdersComponent } from '../orders/orders.component';
import { TranslateDirective } from '@ngx-translate/core';
import { FormField } from '@angular/forms/signals';
import { DecimalPipe } from '@angular/common';
import { OrderListService } from '../order-list.service';
import { AuthenticationService } from '../../shared/authentication.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'rb-in-progress-orders',
  templateUrl: './in-progress-orders.component.html',
  styleUrl: './in-progress-orders.component.scss',
  imports: [TranslateDirective, OrdersComponent, FaIconComponent, RouterLink, DecimalPipe, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InProgressOrdersComponent {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly orderListService = inject(OrderListService);

  readonly noOrderIcon = faThumbsUp;
  readonly createOrderIcon = faPlus;
  readonly loadingIcon = faSpinner;
  readonly errorIcon = faExclamationCircle;

  readonly page = input(0, { transform: (value: string | undefined) => parseInt(value ?? '0') });
  // eslint-disable-next-line @angular-eslint/no-input-rename -- the query parameter is named h
  readonly holder = input<string>(undefined, { alias: 'h' });
  readonly user = toSignal(this.authenticationService.getCurrentUser());
  readonly form = this.orderListService.createForm(this.holder, this.user);
  readonly orders = this.orderListService.inProgressOrders(this.page, this.holder, this.user);

  filterByAccessionHolder() {
    this.orderListService.filterByAccessionHolder(this.form().value);
  }
}
