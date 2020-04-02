import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditBasketComponent } from './edit-basket/edit-basket.component';
import { BasketComponent } from './basket/basket.component';
import { RouterModule } from '@angular/router';
import { BASKET_ROUTES } from './basket.routes';
import { ReactiveFormsModule } from '@angular/forms';
import { ValdemortModule } from 'ngx-valdemort';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RbNgbModule } from '../rb-ngb/rb-ngb.module';
import { BasketConfirmationComponent } from './basket-confirmation/basket-confirmation.component';
import { EditConfirmationComponent } from './edit-confirmation/edit-confirmation.component';
import { ConfirmedComponent } from './confirmed/confirmed.component';
import { BasketContentComponent } from './basket-content/basket-content.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    BasketComponent,
    EditBasketComponent,
    BasketConfirmationComponent,
    EditConfirmationComponent,
    ConfirmedComponent,
    BasketContentComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(BASKET_ROUTES),
    ReactiveFormsModule,
    ValdemortModule,
    SharedModule,
    FontAwesomeModule,
    RbNgbModule
  ]
})
export class BasketModule {}
