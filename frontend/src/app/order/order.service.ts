import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import {
  CustomerInformationCommand,
  DetailedOrder,
  Document,
  DocumentCommand,
  Order,
  OrderCommand,
  OrderCreationCommand,
  OrderStatistics,
  OrderStatus
} from './order.model';
import { Observable } from 'rxjs';
import { Page } from '../shared/page.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);

  get(orderId: number): Observable<DetailedOrder> {
    return this.http.get<DetailedOrder>(`api/orders/${orderId}`);
  }

  listInProgress(page: number, accessionHolderId: number | null): Observable<Page<Order>> {
    return this.listOrders(page, accessionHolderId, ['DRAFT']);
  }

  listDone(page: number, accessionHolderId: number | null): Observable<Page<Order>> {
    return this.listOrders(page, accessionHolderId, ['FINALIZED', 'CANCELLED']);
  }

  private listOrders(page: number, accessionHolderId: number | null, statuses: Array<OrderStatus>) {
    const params: Record<string, string | number | Array<string>> = { status: statuses, page };
    if (accessionHolderId != null) {
      params['accessionHolderId'] = accessionHolderId;
    }
    return this.http.get<Page<Order>>('api/orders', { params });
  }

  update(orderId: number, command: OrderCommand): Observable<void> {
    return this.http.put<void>(`api/orders/${orderId}`, command);
  }

  cancel(orderId: number): Observable<void> {
    return this.http.delete<void>(`api/orders/${orderId}`);
  }

  addDocument(orderId: number, command: DocumentCommand): Observable<HttpEvent<Document>> {
    const formData = new FormData();
    formData.append('file', command.file);
    formData.append('document', new Blob([JSON.stringify(command.document)], { type: 'application/json' }));

    return this.http.post<Document>(`api/orders/${orderId}/documents`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  deleteDocument(orderId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`api/orders/${orderId}/documents/${documentId}`);
  }

  downloadDocument(orderId: number, documentId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`api/orders/${orderId}/documents/${documentId}/file`, { observe: 'response', responseType: 'blob' });
  }

  downloadDeliveryForm(orderId: number, options = { withDocuments: false }): Observable<HttpResponse<Blob>> {
    return this.http.get(`api/orders/${orderId}/${options.withDocuments ? 'complete-' : ''}delivery-form`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  finalize(orderId: number): Observable<void> {
    return this.http.put<void>(`api/orders/${orderId}/finalization`, null);
  }

  exportReport(from: string, to: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`api/orders/report`, { observe: 'response', responseType: 'blob', params: { from, to } });
  }

  getStatistics(from: string, to: string, grcIds: Array<number>): Observable<OrderStatistics> {
    const grcs = grcIds.map(grcId => `${grcId}`);
    return this.http.get<OrderStatistics>(`api/orders/statistics`, { params: { from, to, grcs } });
  }

  updateCustomerInformation(orderId: number, command: CustomerInformationCommand): Observable<void> {
    return this.http.put<void>(`api/orders/${orderId}/customer-information`, command);
  }

  createOrder(command: OrderCreationCommand): Observable<DetailedOrder> {
    return this.http.post<DetailedOrder>('api/orders', command);
  }
}
