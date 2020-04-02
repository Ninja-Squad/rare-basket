import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order, OrderStatus } from './order.model';
import { Observable } from 'rxjs';
import { Page } from '../shared/page.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) {}

  get(orderId: number): Observable<Order> {
    return this.http.get<Order>(`/api/orders/${orderId}`);
  }

  listInProgress(page: number): Observable<Page<Order>> {
    const statuses: Array<OrderStatus> = ['DRAFT'];
    return this.http.get<Page<Order>>('/api/orders', { params: { status: statuses, page: `${page}` } });
  }

  listDone(page: number): Observable<Page<Order>> {
    const statuses: Array<OrderStatus> = ['FINALIZED', 'CANCELLED'];
    return this.http.get<Page<Order>>('/api/orders', { params: { status: statuses, page: `${page}` } });
  }
}
