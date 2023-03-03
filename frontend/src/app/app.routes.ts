import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { authenticationGuard } from './shared/authentication.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'baskets',
    loadChildren: () => import('./basket/basket.routes').then(m => m.BASKET_ROUTES)
  },
  {
    path: '',
    canActivate: [authenticationGuard],
    children: [
      {
        path: 'orders',
        loadChildren: () => import('./order/order.routes').then(m => m.ORDER_ROUTES)
      },
      {
        path: 'users',
        loadChildren: () => import('./user/user.route').then(m => m.USER_ROUTES)
      },
      {
        path: 'accession-holders',
        loadChildren: () => import('./accession-holder/accession-holder.routes').then(m => m.ACCESSION_HOLDER_ROUTES)
      },
      {
        path: 'grcs',
        loadChildren: () => import('./grc/grc.routes').then(m => m.GRC_ROUTES)
      }
    ]
  }
];
