import { User } from '../shared/user.model';
import { Page } from '../shared/page.model';
import { Order } from './order.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
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
 * - populates a signal form field with the appropriate accession holder ID, retrieved (if present) from the query params
 */
@Service()
export class OrderListService {
  private authenticationService = inject(AuthenticationService);
  private orderService = inject(OrderService);

  /**
   * Creates the observable for the "in progress" orders
   */
  setupInProgress(route: ActivatedRoute, accessionHolderId: WritableSignal<string>): Observable<OrderListViewModel> {
    return this.setupSignal(route, accessionHolderId, (page, selectedAccessionHolderId) =>
      this.orderService.listInProgress(page, selectedAccessionHolderId)
    );
  }

  /**
   * Creates the observable for the "done" orders
   */
  setupDone(route: ActivatedRoute, accessionHolderId: WritableSignal<string>): Observable<OrderListViewModel> {
    return this.setupSignal(route, accessionHolderId, (page, selectedAccessionHolderId) =>
      this.orderService.listDone(page, selectedAccessionHolderId)
    );
  }

  private setupSignal(
    route: ActivatedRoute,
    accessionHolderId: WritableSignal<string>,
    pageLoader: (page: number, accessionHolderId: number | null) => Observable<Page<Order>>
  ): Observable<OrderListViewModel> {
    return combineLatest([route.queryParamMap, this.authenticationService.getCurrentUser()])
      .pipe(
        // when the query params change, set the value of the accession holder field (only if the value is not already
        // the correct one)
        tap(([params, user]) => this.populateAccessionHolderSignal(accessionHolderId, params, user)),
        // when the query params change, load the page of orders and combine it with the current user
        switchMap(([params, user]) => {
          const accessionHolderIdAsString = params.get('h');
          const selectedAccessionHolderId = accessionHolderIdAsString ? parseInt(accessionHolderIdAsString) : null;
          const page = parseInt(params.get('page') ?? '0');
          return pageLoader(page, selectedAccessionHolderId).pipe(map(orders => ({ orders, user })));
        })
      )
      .pipe();
  }

  private populateAccessionHolderSignal(accessionHolderIdSignal: WritableSignal<string>, params: ParamMap, user: User | null): void {
    const accessionHolderId = this.findAcceptableAccessionHolderId(params, user);
    const accessionHolderIdAsString = accessionHolderId?.toString() ?? '';
    if (accessionHolderIdSignal() !== accessionHolderIdAsString) {
      accessionHolderIdSignal.set(accessionHolderIdAsString);
    }
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
