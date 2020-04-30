import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { DetailedOrder, Document, DocumentCommand, Order, OrderCommand, OrderStatus } from './order.model';
import { Observable } from 'rxjs';
import { Page } from '../shared/page.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient) {}

  get(orderId: number): Observable<DetailedOrder> {
    return this.http.get<DetailedOrder>(`/api/orders/${orderId}`);
  }

  listInProgress(page: number): Observable<Page<Order>> {
    const statuses: Array<OrderStatus> = ['DRAFT'];
    return this.http.get<Page<Order>>('/api/orders', { params: { status: statuses, page: `${page}` } });
  }

  listDone(page: number): Observable<Page<Order>> {
    const statuses: Array<OrderStatus> = ['FINALIZED', 'CANCELLED'];
    return this.http.get<Page<Order>>('/api/orders', { params: { status: statuses, page: `${page}` } });
  }

  update(orderId: number, command: OrderCommand): Observable<void> {
    return this.http.put<void>(`/api/orders/${orderId}`, command);
  }

  cancel(orderId: number): Observable<void> {
    return this.http.delete<void>(`/api/orders/${orderId}`);
  }

  addDocument(orderId: number, command: DocumentCommand): Observable<HttpEvent<Document>> {
    const formData = new FormData();
    formData.append('file', command.file);
    formData.append('document', new Blob([JSON.stringify(command.document)], { type: 'application/json' }));

    return this.http.post<Document>(`/api/orders/${orderId}/documents`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  deleteDocument(orderId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`/api/orders/${orderId}/documents/${documentId}`);
  }

  downloadDocument(orderId: number, documentId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`/api/orders/${orderId}/documents/${documentId}/file`, { observe: 'response', responseType: 'blob' });
  }

  downloadDeliveryForm(orderId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`/api/orders/${orderId}/delivery-form`, { observe: 'response', responseType: 'blob' });
  }

  finalize(orderId: number): Observable<void> {
    return this.http.put<void>(`/api/orders/${orderId}/finalization`, null);
  }

  exportReport(from: string, to: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`/api/orders/report`, { observe: 'response', responseType: 'blob', params: { from, to } });
  }
}
