import { User } from '../shared/user.model';
import { Page } from '../shared/page.model';
import { Order } from './order.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthenticationService } from '../shared/authentication.service';
import { combineLatest, ignoreElements, merge, Observable, tap } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';
import { OrderService } from './order.service';

export interface OrderListViewModel {
  user: User;
  orders: Page<Order>;
}

/**
 * Service used by the two components listing orders (in progress and done), in order to avoid duplicating their code,
 * which is almost identical.
 * It allows creating an observable, which is supposed to be subscribed once and only once, which, when subscribed
 * - listens to the activated route query params in order to load the appropriate page of orders and emit it
 * - gets the currently authenticated user, necessary to know which accession holders they can access
 * - populates a form control with the appropriate accession holder ID, retrieved (if present) from the query params
 * - navigates to the current route with the page set to 0 and the selected accession holder ID in the query params
 *   whenever the accession holder form control changes its value
 */
@Injectable({
  providedIn: 'root'
})
export class OrderListService {
  constructor(
    private authenticationService: AuthenticationService,
    private orderService: OrderService,
    private router: Router
  ) {}

  /**
   * Creates the observable for the "in progress" orders
   */
  setupInProgress(route: ActivatedRoute, accessionHolderIdCtrl: FormControl<number | null>): Observable<OrderListViewModel> {
    return this.setup(route, accessionHolderIdCtrl, (page, accessionHolderId) => this.orderService.listInProgress(page, accessionHolderId));
  }

  /**
   * Creates the observable for the "done" orders
   */
  setupDone(route: ActivatedRoute, accessionHolderIdCtrl: FormControl<number | null>): Observable<OrderListViewModel> {
    return this.setup(route, accessionHolderIdCtrl, (page, accessionHolderId) => this.orderService.listDone(page, accessionHolderId));
  }

  private setup(
    route: ActivatedRoute,
    accessionHolderIdCtrl: FormControl<number | null>,
    pageLoader: (page: number, accessionHolderId: number | null) => Observable<Page<Order>>
  ): Observable<OrderListViewModel> {
    const vm$: Observable<OrderListViewModel> = combineLatest([route.queryParamMap, this.authenticationService.getCurrentUser()])
      .pipe(
        // when the query params change, set the value of the accession holder form control (only if the value is not already
        // the correct one)
        tap(([params, user]) => this.populateAccessionHolder(accessionHolderIdCtrl, params, user)),
        // when the query params change, load the page of orders and combine it with the current user
        switchMap(([params, user]) => {
          const accessionHolderIdAsString = params.get('h');
          const accessionHolderId = accessionHolderIdAsString ? parseInt(accessionHolderIdAsString) : null;
          const page = parseInt(params.get('page') ?? '0');
          return pageLoader(page, accessionHolderId).pipe(map(orders => ({ orders, user })));
        })
      )
      .pipe();

    // create an observable which emits exactly the same events as vm$, but which, when subscribed,
    // also subscribes to the value changes of the form control, in order to navigate when it changes
    return merge(
      vm$,
      accessionHolderIdCtrl.valueChanges.pipe(
        tap(accessionHolderId => {
          this.router.navigate(['.'], { relativeTo: route, queryParams: { page: 0, h: accessionHolderId ?? undefined } });
        }),
        ignoreElements() // to avoid actually merging any elements to the vm$ observable
      )
    );
  }

  private populateAccessionHolder(accessionHolderIdCtrl: FormControl<number | null>, params: ParamMap, user: User): void {
    const accessionHolderId = this.findAcceptableAccessionHolderId(params, user);
    if (accessionHolderIdCtrl.value !== accessionHolderId) {
      accessionHolderIdCtrl.setValue(accessionHolderId);
    }
  }

  private findAcceptableAccessionHolderId(params: ParamMap, user: User): number | null {
    const accessionHolderIdAsString = params.get('h');
    if (accessionHolderIdAsString) {
      const requestedAccessionHolderId = parseInt(accessionHolderIdAsString);
      const accessionHolder = user.accessionHolders.find(ah => ah.id === requestedAccessionHolderId);
      return accessionHolder?.id ?? null;
    } else {
      return null;
    }
  }
}
