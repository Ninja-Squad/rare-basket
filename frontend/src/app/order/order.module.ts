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
import { EditOrderComponent } from './edit-order/edit-order.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ValdemortModule } from 'ngx-valdemort';
import { EditDocumentComponent } from './edit-document/edit-document.component';
import { DocumentTypeEnumPipe } from './document-type-enum.pipe';
import { ExportOrdersComponent } from './export-orders/export-orders.component';
import { ChartModule } from '../chart/chart.module';
import { StatisticsComponent } from './statistics/statistics.component';
import { FinalizationWarningsModalComponent } from './finalization-warnings-modal/finalization-warnings-modal.component';
import { EditCustomerInformationComponent } from './edit-customer-information/edit-customer-information.component';
import { CreateOrderComponent } from './create-order/create-order.component';
import { CsvModalComponent } from './csv-modal/csv-modal.component';

@NgModule({
  declarations: [
    OrderComponent,
    OrdersContainerComponent,
    InProgressOrdersComponent,
    DoneOrdersComponent,
    OrdersComponent,
    OrderStatusEnumPipe,
    EditOrderComponent,
    EditDocumentComponent,
    DocumentTypeEnumPipe,
    ExportOrdersComponent,
    StatisticsComponent,
    FinalizationWarningsModalComponent,
    EditCustomerInformationComponent,
    CreateOrderComponent,
    CsvModalComponent
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
  ]
})
export class OrderModule {}
