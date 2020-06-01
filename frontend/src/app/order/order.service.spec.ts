import { TestBed } from '@angular/core/testing';

import { OrderService } from './order.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Document, DocumentCommand, Order, OrderCommand, OrderCustomerCommand, OrderStatistics } from './order.model';
import { Page } from '../shared/page.model';
import { filter } from 'rxjs/operators';
import { HttpEventType, HttpResponse } from '@angular/common/http';

describe('OrderService', () => {
  let service: OrderService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(OrderService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should get an order', () => {
    let actualOrder: Order = null;

    service.get(42).subscribe(order => (actualOrder = order));

    const expectedOrder = { id: 42 } as Order;
    http.expectOne({ method: 'GET', url: '/api/orders/42' }).flush(expectedOrder);
    expect(actualOrder).toBe(expectedOrder);
  });

  it('should list in progress orders', () => {
    let actualOrders: Page<Order> = null;

    service.listInProgress(0).subscribe(orders => (actualOrders = orders));

    const expectedOrders = { totalElements: 0 } as Page<Order>;
    http.expectOne({ method: 'GET', url: '/api/orders?status=DRAFT&page=0' }).flush(expectedOrders);
    expect(actualOrders).toBe(expectedOrders);
  });

  it('should list done orders', () => {
    let actualOrders: Page<Order> = null;

    service.listDone(0).subscribe(orders => (actualOrders = orders));

    const expectedOrders = { totalElements: 0 } as Page<Order>;
    http.expectOne({ method: 'GET', url: '/api/orders?status=FINALIZED&status=CANCELLED&page=0' }).flush(expectedOrders);
    expect(actualOrders).toBe(expectedOrders);
  });

  it('should update an order', () => {
    let done = false;

    const command = {} as OrderCommand;
    service.update(42, command).subscribe(() => (done = true));

    const testRequest = http.expectOne({ method: 'PUT', url: '/api/orders/42' });
    expect(testRequest.request.body).toBe(command);
    testRequest.flush(null);
    expect(done).toBe(true);
  });

  it('should add a document', async () => {
    let actual: Document = null;

    const command: DocumentCommand = {
      file: { name: 'foo.txt' } as File,
      document: {
        type: 'OTHER',
        description: 'test',
        onDeliveryForm: false
      }
    };
    service
      .addDocument(42, command)
      .pipe(filter(event => event.type === HttpEventType.Response))
      .subscribe(response => (actual = (response as HttpResponse<Document>).body));

    const testRequest = http.expectOne({ method: 'POST', url: '/api/orders/42/documents' });
    const formData: FormData = testRequest.request.body;
    expect(formData.has('file')).toBe(true);
    const documentCommand = formData.get('document') as Blob;
    expect(documentCommand.type).toBe('application/json');

    const json = await blobToString(documentCommand);
    const sentCommand = JSON.parse(json);

    expect(sentCommand).toEqual(command.document);
    const expected = {} as Document;
    testRequest.flush(expected);
    expect(actual).toBe(expected);
  });

  it('should delete a document', () => {
    let done = false;
    service.deleteDocument(42, 54).subscribe(() => (done = true));

    http.expectOne({ url: '/api/orders/42/documents/54', method: 'DELETE' }).flush(null);
    expect(done).toBe(true);
  });

  it('should download a document', () => {
    let actual: Blob = null;
    service.downloadDocument(42, 54).subscribe(response => (actual = response.body));

    const expected = new Blob();
    http.expectOne({ url: '/api/orders/42/documents/54/file', method: 'GET' }).flush(expected);
    expect(actual).toBe(expected);
  });

  it('should download delivery form', () => {
    let actual: Blob = null;
    service.downloadDeliveryForm(42).subscribe(response => (actual = response.body));

    const expected = new Blob();
    http.expectOne({ url: '/api/orders/42/delivery-form', method: 'GET' }).flush(expected);
    expect(actual).toBe(expected);
  });

  it('should finalize an order', () => {
    let done = false;
    service.finalize(42).subscribe(() => (done = true));

    http.expectOne({ url: '/api/orders/42/finalization', method: 'PUT' }).flush(null);
    expect(done).toBe(true);
  });

  it('should export a report', () => {
    let actual: Blob = null;
    service.exportReport('2020-01-01', '2021-01-01').subscribe(response => (actual = response.body));

    const expected = new Blob();
    http.expectOne({ url: '/api/orders/report?from=2020-01-01&to=2021-01-01', method: 'GET' }).flush(expected);
    expect(actual).toBe(expected);
  });

  it('should get statistics for a year', () => {
    let actual: OrderStatistics = null;
    service.getStatistics(2020).subscribe(stats => (actual = stats));

    const expected = {} as OrderStatistics;
    http.expectOne({ url: '/api/orders/statistics?from=2020-01-01&to=2021-01-01', method: 'GET' }).flush(expected);
    expect(actual).toBe(expected);
  });

  it('should update an order customer', () => {
    let done = false;

    const command = {} as OrderCustomerCommand;
    service.updateCustomer(42, command).subscribe(() => (done = true));

    const testRequest = http.expectOne({ method: 'PUT', url: '/api/orders/42/customer' });
    expect(testRequest.request.body).toBe(command);
    testRequest.flush(null);
    expect(done).toBe(true);
  });

  function blobToString(blob: Blob): Promise<string> {
    // Blob as a text() method, but which does not exist on the old CI browsers. Grrr.
    return new Promise(resolve => {
      const reader = new FileReader();

      // This fires after the blob has been read/loaded.
      reader.addEventListener('loadend', e => {
        resolve(reader.result as string);
      });

      reader.readAsText(blob);
    });
  }
});
