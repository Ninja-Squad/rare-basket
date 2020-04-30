import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RbNgbModule } from '../rb-ngb/rb-ngb.module';
import { OrderComponent } from './order/order.component';
import { ORDER_ROUTES } from './order.routes';
import { OrdersContainerComponent } from './orders-container/orders-container.component';
import { InProgressOrdersComponent } from './in-progress-orders/in-progress-orders.component';
import { DoneOrdersComponent } from './done-orders/done-orders.component';
import { OrdersComponent } from './orders/orders.component';
import { TranslateModule } from '@ngx-translate/core';
import { OrderStatusEnumPipe } from './order-status-enum.pipe';
import { LanguageEnumPipe } from './language-enum.pipe';
import { EditOrderComponent } from './edit-order/edit-order.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ValdemortModule } from 'ngx-valdemort';
import { EditDocumentComponent } from './edit-document/edit-document.component';
import { DocumentTypeEnumPipe } from './document-type-enum.pipe';
import { ExportOrdersComponent } from './export-orders/export-orders.component';
import { ChartModule } from '../chart/chart.module';
import { FIRST_YEAR, StatisticsComponent } from './statistics/statistics.component';

@NgModule({
  declarations: [
    OrderComponent,
    OrdersContainerComponent,
    InProgressOrdersComponent,
    DoneOrdersComponent,
    OrdersComponent,
    OrderStatusEnumPipe,
    LanguageEnumPipe,
    EditOrderComponent,
    EditDocumentComponent,
    DocumentTypeEnumPipe,
    ExportOrdersComponent,
    StatisticsComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(ORDER_ROUTES),
    SharedModule,
    FontAwesomeModule,
    RbNgbModule,
    ReactiveFormsModule,
    ValdemortModule,
    ChartModule
  ],
  providers: [{ provide: FIRST_YEAR, useValue: 2019 }]
})
export class OrderModule {}
