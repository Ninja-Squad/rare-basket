import { Routes } from '@angular/router';
import { BasketComponent } from './basket/basket.component';
import { BasketConfirmationComponent } from './basket-confirmation/basket-confirmation.component';

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
