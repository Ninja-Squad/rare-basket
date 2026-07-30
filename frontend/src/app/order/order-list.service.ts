import { User } from '../shared/user.model';
import { Page } from '../shared/page.model';
import { Order } from './order.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthenticationService } from '../shared/authentication.service';
import { combineLatest, map, Observable, switchMap, tap } from 'rxjs';
import { Service, WritableSignal, inject } from '@angular/core';
import { OrderService } from './order.service';

export interface OrderListViewModel {
  user: User | null;
  orders: Page<Order>;
}

/**
 * Service used by the two components listing orders (in progress and done), in order to avoid duplicating their code,
 * which is almost identical.
 * It allows creating an observable, which is supposed to be subscribed once and only once, which, when subscribed
 * - listens to the activated route query params in order to load the appropriate page of orders and emit it
 * - gets the currently authenticated user, necessary to know which accession holders they can access
 * - populates a signal with the appropriate accession holder ID, retrieved (if present) from the query params
 */
@Service()
export class OrderListService {
  private route = inject(ActivatedRoute);
  private authenticationService = inject(AuthenticationService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  /**
   * Creates the observable for the "in progress" orders
   */
  setupInProgress(accessionHolderId: WritableSignal<string>): Observable<OrderListViewModel> {
    return this.setup(accessionHolderId, (page, selectedAccessionHolderId) =>
      this.orderService.listInProgress(page, selectedAccessionHolderId)
    );
  }

  /**
   * Creates the observable for the "done" orders
   */
  setupDone(accessionHolderId: WritableSignal<string>): Observable<OrderListViewModel> {
    return this.setup(accessionHolderId, (page, selectedAccessionHolderId) => this.orderService.listDone(page, selectedAccessionHolderId));
  }

  filterByAccessionHolder(accessionHolderId: () => string): void {
    const selectedAccessionHolderId = accessionHolderId();
    const parsedAccessionHolderId = selectedAccessionHolderId ? parseInt(selectedAccessionHolderId) : null;
    this.router.navigate([], { queryParams: { page: 0, h: parsedAccessionHolderId ?? undefined } });
  }

  private setup(
    accessionHolderId: WritableSignal<string>,
    pageLoader: (page: number, accessionHolderId: number | null) => Observable<Page<Order>>
  ): Observable<OrderListViewModel> {
    return combineLatest([this.route.queryParamMap, this.authenticationService.getCurrentUser()]).pipe(
      // when the query params change, set the value of the accession holder field
      tap(([params, user]) => this.populateAccessionHolder(accessionHolderId, params, user)),
      // when the query params change, load the page of orders and combine it with the current user
      switchMap(([params, user]) => {
        const accessionHolderIdAsString = params.get('h');
        const selectedAccessionHolderId = accessionHolderIdAsString ? parseInt(accessionHolderIdAsString) : null;
        const page = parseInt(params.get('page') ?? '0');
        return pageLoader(page, selectedAccessionHolderId).pipe(map(orders => ({ orders, user })));
      })
    );
  }

  private populateAccessionHolder(accessionHolderIdSignal: WritableSignal<string>, params: ParamMap, user: User | null): void {
    const accessionHolderId = this.findAcceptableAccessionHolderId(params, user);
    const accessionHolderIdAsString = accessionHolderId?.toString() ?? '';
    accessionHolderIdSignal.set(accessionHolderIdAsString);
  }

  private findAcceptableAccessionHolderId(params: ParamMap, user: User | null): number | null {
    const accessionHolderIdAsString = params.get('h');
    if (accessionHolderIdAsString && user) {
      const requestedAccessionHolderId = parseInt(accessionHolderIdAsString);
      const accessionHolder = user.accessionHolders.find(ah => ah.id === requestedAccessionHolderId);
      return accessionHolder?.id ?? null;
    } else {
      return null;
    }
  }
}
