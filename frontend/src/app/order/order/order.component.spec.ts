import { TestBed } from '@angular/core/testing';

import { OrderComponent } from './order.component';
import { page } from 'vitest/browser';
import { stubRoute } from '../../../test/route-stub';
import { createMock, MockObject } from '../../../test/mock';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { EMPTY, of, Subject } from 'rxjs';
import { DetailedOrder, Document, DocumentCommand, OrderCommand } from '../order.model';
import { LOCALE_ID } from '@angular/core';
import { EditOrderComponent } from '../edit-order/edit-order.component';
import { By } from '@angular/platform-browser';
import { ConfirmationService } from '../../shared/confirmation.service';
import { EditDocumentComponent } from '../edit-document/edit-document.component';
import { HttpEvent, HttpEventType, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { DownloadService } from '../../shared/download.service';
import { MockModalService, provideModalTesting } from '../../rb-ngb/mock-modal.service';
import { FinalizationWarningsModalComponent } from '../finalization-warnings-modal/finalization-warnings-modal.component';
import { ToastService } from '../../shared/toast.service';
import { provideI18nTesting } from '../../i18n/mock-18n';
import { beforeEach, describe, expect, test } from 'vitest';

class OrderComponentTester {
  readonly fixture = TestBed.createComponent(OrderComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly title = this.root.getByRole('heading', { level: 1 });
  readonly items = this.root.getByCss('.order-item');
  readonly editOrderButton = this.root.getByCss('#edit-order-button');
  readonly finalizeOrderButton = this.root.getByCss('#finalize-order-button');
  readonly cancelOrderButton = this.root.getByCss('#cancel-order-button');
  readonly deliveryFormButton = this.root.getByCss('#delivery-form-button');
  readonly completeDeliveryFormButton = this.root.getByCss('#complete-delivery-form-button');
  readonly documents = this.root.getByCss('.document');
  readonly deleteDocumentButtons = this.root.getByCss('.delete-document-button');
  readonly downloadDocumentButtons = this.root.getByCss('.download-button');
  readonly addDocumentButton = this.root.getByCss('#add-document-button');

  get componentInstance() {
    return this.fixture.componentInstance;
  }

  get editOrderComponent(): EditOrderComponent | null {
    return this.fixture.debugElement.query(By.directive(EditOrderComponent))?.componentInstance ?? null;
  }

  get editDocumentComponent(): EditDocumentComponent | null {
    return this.fixture.debugElement.query(By.directive(EditDocumentComponent))?.componentInstance ?? null;
  }

  downloadSpinner(index: number) {
    return this.documents.nth(index).getByCss('.download-spinner');
  }
}

describe('OrderComponent', () => {
  let tester: OrderComponentTester;
  let orderService: MockObject<OrderService>;
  let confirmationService: MockObject<ConfirmationService>;
  let downloadService: MockObject<DownloadService>;
  let modalService: MockModalService<FinalizationWarningsModalComponent>;
  let toastService: MockObject<ToastService>;

  let order: DetailedOrder;

  beforeEach(() => {
    const route = stubRoute({
      params: { orderId: 42 }
    });

    orderService = createMock(OrderService);
    confirmationService = createMock(ConfirmationService);
    downloadService = createMock(DownloadService);
    toastService = createMock(ToastService);

    TestBed.configureTestingModule({
      providers: [
        provideI18nTesting(),
        provideModalTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: OrderService, useValue: orderService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: DownloadService, useValue: downloadService },
        { provide: LOCALE_ID, useValue: 'fr' },
        { provide: ToastService, useValue: toastService }
      ]
    });

    modalService = TestBed.inject(MockModalService);

    order = {
      id: 42,
      status: 'DRAFT',
      basket: {
        customer: {
          name: 'John Doe',
          organization: 'Wheat SA',
          email: 'john@mail.com',
          deliveryAddress: 'Av. du Centre\n75000 Paris',
          billingAddress: 'Av. du Centre - billing service\n75000 Paris',
          type: 'CITIZEN',
          language: 'en'
        },
        rationale: 'Why not?',
        reference: 'ABCDEFGH',
        confirmationInstant: '2020-04-02T11:00:00Z'
      },
      accessionHolder: {
        id: 42,
        name: 'the flower holder'
      },
      items: [
        {
          id: 1,
          accession: {
            name: 'Rosa',
            identifier: 'rosa1',
            accessionNumber: null,
            taxon: 'rosaTaxon',
            url: 'https://rosa.com'
          },
          quantity: 1234,
          unit: 'bags'
        },
        {
          id: 2,
          accession: {
            name: 'Violetta',
            identifier: 'violetta1',
            accessionNumber: 'violettaNumber',
            taxon: 'violettaTaxon',
            url: 'https://violetta.com'
          },
          quantity: 5,
          unit: null
        }
      ],
      documents: [
        {
          id: 543,
          type: 'OTHER',
          description: 'first email',
          creationInstant: '2020-04-10T09:00:00Z',
          originalFileName: 'mail.txt',
          contentType: 'text/plain',
          onDeliveryForm: false
        }
      ]
    };
  });

  test('should not display anything until order is there', async () => {
    orderService.get.mockReturnValue(EMPTY);
    tester = new OrderComponentTester();

    expect(orderService.get).toHaveBeenCalledWith(42);
    await expect.element(tester.title).toHaveLength(0);
    await expect.element(tester.items).toHaveLength(0);
    expect(tester.editOrderComponent).toBeNull();
  });

  test('should have a title', async () => {
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await expect.element(tester.title).toHaveTextContent('Commande n° ABCDEFGH');
  });

  test('should display order and customer information', async () => {
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await expect.element(tester.root).toHaveTextContent('pour the flower holder');
    await expect.element(tester.root).toHaveTextContent('John');
    await expect.element(tester.root).toHaveTextContent('Wheat SA');
    await expect.element(tester.root).toHaveTextContent('john@mail.com');
    await expect.element(tester.root).toHaveTextContent(/Av\. du Centre\s*75000 Paris/);
    await expect.element(tester.root).toHaveTextContent(/Av\. du Centre - billing service\s*75000 Paris/);
    await expect.element(tester.root).toHaveTextContent('Citoyen');
    await expect.element(tester.root).toHaveTextContent('Anglais');
    await expect.element(tester.root).toHaveTextContent('Why not?');
  });

  test('should display order items', async () => {
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await expect.element(tester.items).toHaveLength(2);
    await expect.element(tester.items.nth(0)).toHaveTextContent('Rosa');
    await expect.element(tester.items.nth(0)).toHaveTextContent(/1\s*234 bags/);
    await expect.element(tester.items.nth(1)).toHaveTextContent('Violetta');

    expect(tester.editOrderComponent).toBeNull();
  });

  test('should not display edit button if order is not draft', async () => {
    orderService.get.mockReturnValue(of({ ...order, status: 'CANCELLED' }));
    tester = new OrderComponentTester();

    await expect.element(tester.editOrderButton).not.toBeInTheDocument();
  });

  test('should edit order', async () => {
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await tester.editOrderButton.click();

    await expect.element(tester.items).toHaveLength(0);
    expect(tester.editOrderComponent).not.toBeNull();
    expect(tester.editOrderComponent!.order()).toBe(tester.componentInstance.order()!);
  });

  test('should cancel edition', async () => {
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await tester.editOrderButton.click();

    tester.editOrderComponent!.cancel();

    await expect.element(tester.items).toHaveLength(2);
    expect(tester.editOrderComponent).toBeNull();
  });

  test('should save and refresh', async () => {
    const newOrder = { ...order };
    orderService.get.mockReturnValueOnce(of(order)).mockReturnValueOnce(of(newOrder));
    tester = new OrderComponentTester();

    await tester.editOrderButton.click();

    orderService.update.mockReturnValue(of(undefined));
    const command = {} as OrderCommand;
    tester.editOrderComponent!.saved.emit(command);
    await tester.fixture.whenStable();

    expect(orderService.update).toHaveBeenCalledWith(order.id, command);
    expect(tester.componentInstance.order()).toBe(newOrder);
    await expect.element(tester.items).toHaveLength(2);
    expect(tester.editOrderComponent).toBeNull();
  });

  test('should not have a finalize order button when status is not DRAFT', async () => {
    order.status = 'CANCELLED';
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await expect.element(tester.finalizeOrderButton).not.toBeInTheDocument();
  });

  test('should finalize order after confirmation if no warning', async () => {
    order.items.forEach(item => (item.unit = 'bags'));
    order.documents.push({
      id: 54,
      type: 'MTA'
    } as Document);
    order.documents.push({
      id: 55,
      type: 'SANITARY_PASSPORT'
    } as Document);

    confirmationService.confirm.mockReturnValue(of(undefined));
    const newOrder: DetailedOrder = { ...order, status: 'FINALIZED' };

    orderService.finalize.mockReturnValue(of(undefined));
    orderService.get.mockReturnValueOnce(of(order)).mockReturnValueOnce(of(newOrder));
    tester = new OrderComponentTester();

    await tester.finalizeOrderButton.click();

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(orderService.finalize).toHaveBeenCalledWith(tester.componentInstance.order()!.id);
    expect(toastService.success).toHaveBeenCalled();
    expect(tester.componentInstance.order()).toBe(newOrder);
  });

  test('should finalize order after confirmation with warnings', async () => {
    order.items[0].quantity = null;

    const newOrder: DetailedOrder = { ...order, status: 'FINALIZED' };
    orderService.finalize.mockReturnValue(of(undefined));
    orderService.get.mockReturnValueOnce(of(order)).mockReturnValueOnce(of(newOrder));
    tester = new OrderComponentTester();

    const warningsComponent = createMock(FinalizationWarningsModalComponent);
    modalService.mockClosedModal(warningsComponent);

    await tester.finalizeOrderButton.click();

    expect(warningsComponent.init).toHaveBeenCalledWith([
      `La commande n'a pas d'ATM (accord de transfert de matériel)`,
      `La commande n'a pas de passeport sanitaire`,
      `Certaines des accessions commandées n'ont pas de quantité spécifiée`,
      `Certaines des accessions commandées n'ont pas d'unité spécifiée`
    ]);
    expect(orderService.finalize).toHaveBeenCalledWith(tester.componentInstance.order()!.id);
    expect(toastService.success).toHaveBeenCalled();
    expect(tester.componentInstance.order()).toBe(newOrder);
  });

  test('should not have a cancel order button when status is not DRAFT', async () => {
    order.status = 'CANCELLED';
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();
    await expect.element(tester.cancelOrderButton).not.toBeInTheDocument();
  });

  test('should cancel order after confirmation', async () => {
    confirmationService.confirm.mockReturnValue(of(undefined));
    const newOrder: DetailedOrder = { ...order, status: 'CANCELLED' };

    orderService.cancel.mockReturnValue(of(undefined));
    orderService.get.mockReturnValueOnce(of(order)).mockReturnValueOnce(of(newOrder));
    tester = new OrderComponentTester();

    await tester.cancelOrderButton.click();

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(orderService.cancel).toHaveBeenCalledWith(tester.componentInstance.order()!.id);
    expect(toastService.success).toHaveBeenCalled();
    expect(tester.componentInstance.order()).toBe(newOrder);
  });

  test('should display documents', async () => {
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await expect.element(tester.documents).toHaveLength(1);
    await expect.element(tester.documents.nth(0)).toHaveTextContent('mail.txt');
    await expect.element(tester.documents.nth(0)).toHaveTextContent('Autre');
    await expect.element(tester.documents.nth(0)).toHaveTextContent('first email');
    await expect.element(tester.deleteDocumentButtons).toHaveLength(1);
    await expect.element(tester.addDocumentButton).toHaveLength(1);
    expect(tester.editDocumentComponent).toBeNull();
    await expect.element(tester.deleteDocumentButtons.nth(0)).not.toBeDisabled();
    await expect.element(tester.addDocumentButton).not.toBeDisabled();

    await expect.element(tester.root).not.toHaveTextContent('Aucun document');
  });

  test('should not display document delete buttons and add button if not DRAFT', async () => {
    order.status = 'FINALIZED';
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await expect.element(tester.deleteDocumentButtons).toHaveLength(0);
    await expect.element(tester.addDocumentButton).toHaveLength(0);
  });

  test('should disable buttons when editing', async () => {
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await tester.editOrderButton.click();

    await expect.element(tester.finalizeOrderButton).toBeDisabled();
    await expect.element(tester.cancelOrderButton).toBeDisabled();
    await expect.element(tester.deleteDocumentButtons.nth(0)).toBeDisabled();
    await expect.element(tester.addDocumentButton).toBeDisabled();
  });

  test('should disable buttons when adding document', async () => {
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await tester.addDocumentButton.click();

    await expect.element(tester.editOrderButton).toBeDisabled();
    await expect.element(tester.cancelOrderButton).toBeDisabled();
    await expect.element(tester.deleteDocumentButtons.nth(0)).toBeDisabled();
  });

  test('should delete document after confirmation', async () => {
    confirmationService.confirm.mockReturnValue(of(undefined));
    const newOrder: DetailedOrder = { ...order, documents: [] };

    orderService.deleteDocument.mockReturnValue(of(undefined));
    orderService.get.mockReturnValueOnce(of(order)).mockReturnValueOnce(of(newOrder));
    tester = new OrderComponentTester();

    await tester.deleteDocumentButtons.nth(0).click();

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(orderService.deleteDocument).toHaveBeenCalledWith(tester.componentInstance.order()!.id, 543);
    expect(tester.componentInstance.order()).toBe(newOrder);
    await expect.element(tester.root).toHaveTextContent('Aucun document');
  });

  test('should add document', async () => {
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await tester.addDocumentButton.click();

    await expect.element(tester.addDocumentButton).not.toBeInTheDocument();
    expect(tester.editDocumentComponent).not.toBeNull();
    expect(tester.editDocumentComponent!.uploadProgress()).toBeNull();
    expect(tester.editDocumentComponent!.order()).toBe(order);
  });

  test('should cancel document addition', async () => {
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await tester.addDocumentButton.click();

    tester.editDocumentComponent!.cancel();

    await expect.element(tester.addDocumentButton).toBeInTheDocument();
    expect(tester.editDocumentComponent).toBeNull();
  });

  test('should create new document and refresh', async () => {
    const newOrder = { ...order, documents: [order.documents[0], { ...order.documents[0], id: 765 }] };
    orderService.get.mockReturnValueOnce(of(order)).mockReturnValueOnce(of(newOrder));
    tester = new OrderComponentTester();

    await tester.addDocumentButton.click();

    const progressSubject = new Subject<HttpEvent<Document>>();
    orderService.addDocument.mockReturnValue(progressSubject.asObservable());
    const command = {} as DocumentCommand;
    tester.editDocumentComponent!.saved.emit(command);
    await tester.fixture.whenStable();

    expect(orderService.addDocument).toHaveBeenCalledWith(order.id, command);

    const event1: HttpProgressEvent = {
      loaded: 50,
      total: 100,
      type: HttpEventType.UploadProgress
    };
    const event2: HttpProgressEvent = {
      loaded: 100,
      total: 100,
      type: HttpEventType.UploadProgress
    };
    const event3 = new HttpResponse<Document>();

    progressSubject.next(event1);
    await tester.fixture.whenStable();
    expect(tester.editDocumentComponent!.uploadProgress()).toBe(0.5);

    progressSubject.next(event2);
    await tester.fixture.whenStable();
    expect(tester.editDocumentComponent!.uploadProgress()).toBe(1);

    progressSubject.next(event3);
    progressSubject.complete();
    await tester.fixture.whenStable();

    expect(tester.componentInstance.order()).toBe(newOrder);
    await expect.element(tester.documents).toHaveLength(2);
    expect(tester.editDocumentComponent).toBeNull();
  });

  test('should download file', async () => {
    orderService.get.mockReturnValue(of(order));
    tester = new OrderComponentTester();

    await expect.element(tester.downloadSpinner(0)).not.toBeInTheDocument();

    const response = new HttpResponse<Blob>();
    const responseSubject = new Subject<HttpResponse<Blob>>();
    orderService.downloadDocument.mockReturnValue(responseSubject);

    await tester.downloadDocumentButtons.nth(0).click();

    await expect.element(tester.downloadSpinner(0)).toBeVisible();

    responseSubject.next(response);
    responseSubject.complete();

    await expect.element(tester.downloadSpinner(0)).not.toBeInTheDocument();
    expect(downloadService.download).toHaveBeenCalledWith(response, order.documents[0].originalFileName);
  });

  test('should not have a delivery form button when status is not FINALIZED', async () => {
    orderService.get.mockReturnValue(of(order));
    order.status = 'DRAFT';
    order.documents[0].onDeliveryForm = true;
    tester = new OrderComponentTester();

    await expect.element(tester.deliveryFormButton).not.toBeInTheDocument();
    await expect.element(tester.completeDeliveryFormButton).not.toBeInTheDocument();

    order.status = 'CANCELLED';
    await tester.fixture.whenStable();

    await expect.element(tester.deliveryFormButton).not.toBeInTheDocument();
    await expect.element(tester.completeDeliveryFormButton).not.toBeInTheDocument();
  });

  test('should download delivery form', async () => {
    orderService.get.mockReturnValue(of(order));
    order.status = 'FINALIZED';
    tester = new OrderComponentTester();

    const response = new HttpResponse<Blob>();
    orderService.downloadDeliveryForm.mockReturnValue(of(response));

    await tester.deliveryFormButton.click();

    expect(orderService.downloadDeliveryForm).toHaveBeenCalledWith(42, { withDocuments: false });
    expect(downloadService.download).toHaveBeenCalledWith(response, 'bon-de-livraison-42.pdf');
  });

  test('should not have complete delivery form button if no document is attached', async () => {
    orderService.get.mockReturnValue(of(order));
    order.status = 'FINALIZED';
    tester = new OrderComponentTester();

    await expect.element(tester.completeDeliveryFormButton).not.toBeInTheDocument();
  });

  test('should download complete delivery form', async () => {
    orderService.get.mockReturnValue(of(order));
    order.status = 'FINALIZED';
    order.documents[0].onDeliveryForm = true;
    tester = new OrderComponentTester();

    const deliveryFormResponse = new HttpResponse<Blob>();
    orderService.downloadDeliveryForm.mockReturnValue(of(deliveryFormResponse));

    await tester.completeDeliveryFormButton.click();

    expect(orderService.downloadDeliveryForm).toHaveBeenCalledWith(42, { withDocuments: true });
    expect(downloadService.download).toHaveBeenCalledWith(deliveryFormResponse, 'bon-de-livraison-42.pdf');
  });
});
