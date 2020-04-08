import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthenticationGuard } from './shared/authentication.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'baskets',
    loadChildren: () => import('./basket/basket.module').then(m => m.BasketModule)
  },
  {
    path: '',
    canActivateChild: [AuthenticationGuard],
    children: [
      {
        path: 'orders',
        loadChildren: () => import('./order/order.module').then(m => m.OrderModule)
      }
    ]
  }
];
