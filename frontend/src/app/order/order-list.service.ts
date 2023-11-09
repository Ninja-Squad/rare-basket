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

@Injectable({
  providedIn: 'root'
})
export class OrderListService {
  constructor(
    private authenticationService: AuthenticationService,
    private orderService: OrderService,
    private router: Router
  ) {}

  setupInProgress(route: ActivatedRoute, accessionHolderIdCtrl: FormControl<number | null>): Observable<OrderListViewModel> {
    return this.setup(route, accessionHolderIdCtrl, (page, accessionHolderId) => this.orderService.listInProgress(page, accessionHolderId));
  }

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
        tap(([params, user]) => this.populateAccessionHolder(accessionHolderIdCtrl, params, user)),
        switchMap(([params, user]) => {
          const accessionHolderIdAsString = params.get('h');
          const accessionHolderId = accessionHolderIdAsString ? parseInt(accessionHolderIdAsString) : null;
          const page = parseInt(params.get('page') ?? '0');
          return pageLoader(page, accessionHolderId).pipe(map(orders => ({ orders, user })));
        })
      )
      .pipe();

    return merge(
      vm$,
      accessionHolderIdCtrl.valueChanges.pipe(
        tap(accessionHolderId => {
          this.router.navigate(['.'], { relativeTo: route, queryParams: { page: 0, h: accessionHolderId ?? undefined } });
        }),
        ignoreElements()
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
