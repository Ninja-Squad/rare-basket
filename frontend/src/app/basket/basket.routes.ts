import { Routes } from '@angular/router';
import { BasketComponent } from './basket/basket.component';

export const BASKET_ROUTES: Routes = [
  {
    path: ':reference',
    component: BasketComponent
  }
];
