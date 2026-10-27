import { Routes } from '@angular/router';
import { BasketConfirmationComponent } from './basket-confirmation/basket-confirmation.component';
import { BasketComponent } from './basket/basket.component';

export const BASKET_ROUTES: Routes = [
  {
    path: ':reference',
    component: BasketComponent
  },
  {
    path: ':reference/confirmation',
    component: BasketConfirmationComponent
  }
];
