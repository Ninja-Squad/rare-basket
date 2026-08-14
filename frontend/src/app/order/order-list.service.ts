import { inject, linkedSignal, Service } from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { form } from '@angular/forms/signals';
import { Observable } from 'rxjs';
import { Page } from '../shared/page.model';
import { User } from '../shared/user.model';
import { Order } from './order.model';
import { OrderService } from './order.service';

/**
 * Service used by the two components listing orders (in progress and done), in order to avoid duplicating their code,
 * which is almost identical.
 * It allows creating a signal form and resources from the component query param inputs. The resources, when loaded,
 * - use the query params to load the appropriate page of orders
 * - use the currently authenticated user, necessary to know which accession holders they can access
 * - keep the form value in sync with the acceptable accession holder ID from the query params
 */
@Service()
export class OrderListService {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  createForm(accessionHolderIdParam: () => string | undefined, user: () => User | null | undefined) {
    const accessionHolderId = linkedSignal(() => this.findAcceptableAccessionHolderId(accessionHolderIdParam(), user()));
    return form(accessionHolderId);
  }

  inProgressOrders(page: () => number, accessionHolderIdParam: () => string | undefined, user: () => User | null | undefined) {
    return this.orders(page, accessionHolderIdParam, user, (page, accessionHolderId) =>
      this.orderService.listInProgress(page, accessionHolderId)
    );
  }

  doneOrders(page: () => number, accessionHolderIdParam: () => string | undefined, user: () => User | null | undefined) {
    return this.orders(page, accessionHolderIdParam, user, (page, accessionHolderId) =>
      this.orderService.listDone(page, accessionHolderId)
    );
  }

  filterByAccessionHolder(accessionHolderId: () => string): void {
    const selectedAccessionHolderId = accessionHolderId();
    const parsedAccessionHolderId = selectedAccessionHolderId ? parseInt(selectedAccessionHolderId) : null;
    this.router.navigate([], { queryParams: { page: 0, h: parsedAccessionHolderId ?? undefined } });
  }

  private orders(
    page: () => number,
    accessionHolderIdParam: () => string | undefined,
    user: () => User | null | undefined,
    pageLoader: (page: number, accessionHolderId: number | null) => Observable<Page<Order>>
  ) {
    return rxResource({
      params: () => {
        if (user() === undefined) {
          return undefined;
        }

        const accessionHolderId = this.findAcceptableAccessionHolderId(accessionHolderIdParam(), user());
        return { page: page(), accessionHolderId: accessionHolderId ? parseInt(accessionHolderId) : null };
      },
      stream: ({ params }) => pageLoader(params.page, params.accessionHolderId)
    });
  }

  private findAcceptableAccessionHolderId(accessionHolderIdAsString: string | undefined, user: User | null | undefined): string {
    if (accessionHolderIdAsString && user) {
      const requestedAccessionHolderId = parseInt(accessionHolderIdAsString);
      const accessionHolder = user.accessionHolders.find(ah => ah.id === requestedAccessionHolderId);
      return accessionHolder?.id.toString() ?? '';
    } else {
      return '';
    }
  }
}
