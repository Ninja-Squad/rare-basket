import { Routes } from '@angular/router';
import { CreateOrderComponent } from './create-order/create-order.component';
import { DoneOrdersComponent } from './done-orders/done-orders.component';
import { ExportOrdersComponent } from './export-orders/export-orders.component';
import { InProgressOrdersComponent } from './in-progress-orders/in-progress-orders.component';
import { OrderComponent } from './order/order.component';
import { OrdersContainerComponent } from './orders-container/orders-container.component';
import { ordersGuard } from './orders.guard';
import { StatisticsComponent } from './statistics/statistics.component';

export const ORDER_ROUTES: Routes = [
  {
    path: '',
    component: OrdersContainerComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [ordersGuard],
        children: [] // necessary for the router to be happy
      },
      {
        path: 'in-progress',
        component: InProgressOrdersComponent
      },
      {
        path: 'done',
        component: DoneOrdersComponent
      },
      {
        path: 'export',
        component: ExportOrdersComponent
      },
      {
        path: 'stats',
        component: StatisticsComponent
      }
    ]
  },
  {
    path: 'new',
    component: CreateOrderComponent
  },
  {
    path: ':orderId',
    component: OrderComponent
  }
];
