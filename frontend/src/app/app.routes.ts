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
    loadChildren: () => import('./basket/basket.module').then(m => m.BasketModule)
  },
  {
    path: '',
    canActivate: [authenticationGuard],
    children: [
      {
        path: 'orders',
        loadChildren: () => import('./order/order.module').then(m => m.OrderModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./user/user.module').then(m => m.UserModule)
      },
      {
        path: 'accession-holders',
        loadChildren: () => import('./accession-holder/accession-holder.module').then(m => m.AccessionHolderModule)
      },
      {
        path: 'grcs',
        loadChildren: () => import('./grc/grc.module').then(m => m.GrcModule)
      }
    ]
  }
];
