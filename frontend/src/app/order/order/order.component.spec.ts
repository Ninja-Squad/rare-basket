import { TestBed } from '@angular/core/testing';

import { OrderComponent } from './order.component';
import { ComponentTester, fakeRoute, fakeSnapshot, speculoosMatchers, TestButton } from 'ngx-speculoos';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { EMPTY, of, Subject } from 'rxjs';
import { DetailedOrder, Document, DocumentCommand, OrderCommand } from '../order.model';
import { LOCALE_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { I18nTestingModule } from '../../i18n/i18n-testing.module.spec';
import { LanguageEnumPipe } from '../language-enum.pipe';
import { EditOrderComponent } from '../edit-order/edit-order.component';
import { By } from '@angular/platform-browser';
import { ValdemortModule } from 'ngx-valdemort';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from '../../shared/confirmation.service';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';
import { DocumentTypeEnumPipe } from '../document-type-enum.pipe';
import { EditDocumentComponent } from '../edit-document/edit-document.component';
import { HttpEvent, HttpEventType, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { RbNgbModule } from '../../rb-ngb/rb-ngb.module';
import { DownloadService } from '../../shared/download.service';

class OrderComponentTester extends ComponentTester<OrderComponent> {
  constructor() {
    super(OrderComponent);
  }

  get title() {
    return this.element('h1');
  }

  get items() {
    return this.elements('.order-item');
  }

  get editOrderButton() {
    return this.button('#edit-order-button');
  }

  get editOrderComponent(): EditOrderComponent | null {
    return this.debugElement.query(By.directive(EditOrderComponent))?.componentInstance ?? null;
  }

  get finalizeOrderButton() {
    return this.button('#finalize-order-button');
  }

  get finalizationErrors() {
    return this.elements('.finalization-error');
  }

  get cancelOrderButton() {
    return this.button('#cancel-order-button');
  }

  get deliveryFormButton() {
    return this.button('#delivery-form-button');
  }

  get documents() {
    return this.elements('.document');
  }

  get deleteDocumentButtons() {
    return this.elements('.delete-document-button') as Array<TestButton>;
  }

  get downloadDocumentButtons() {
    return this.elements('.download-button') as Array<TestButton>;
  }

  downloadSpinner(index: number) {
    return this.documents[index].element('.download-spinner');
  }

  get addDocumentButton() {
    return this.button('#add-document-button');
  }

  get editDocumentComponent(): EditDocumentComponent | null {
    return this.debugElement.query(By.directive(EditDocumentComponent))?.componentInstance ?? null;
  }
}

describe('OrderComponent', () => {
  let tester: OrderComponentTester;
  let orderService: jasmine.SpyObj<OrderService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let downloadService: jasmine.SpyObj<DownloadService>;

  let order: DetailedOrder;

  beforeEach(() => {
    const route = fakeRoute({
      snapshot: fakeSnapshot({
        params: { orderId: 42 }
      })
    });

    orderService = jasmine.createSpyObj<OrderService>('OrderService', [
      'get',
      'update',
      'finalize',
      'cancel',
      'deleteDocument',
      'addDocument',
      'downloadDocument',
      'downloadDeliveryForm'
    ]);
    confirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);
    downloadService = jasmine.createSpyObj<DownloadService>('DownloadService', ['download']);

    TestBed.configureTestingModule({
      declarations: [
        OrderComponent,
        LanguageEnumPipe,
        EditOrderComponent,
        OrderStatusEnumPipe,
        DocumentTypeEnumPipe,
        EditDocumentComponent
      ],
      imports: [I18nTestingModule, FontAwesomeModule, RouterTestingModule, SharedModule, ReactiveFormsModule, ValdemortModule, RbNgbModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: OrderService, useValue: orderService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: DownloadService, useValue: downloadService },
        { provide: LOCALE_ID, useValue: 'fr' }
      ]
    });

    tester = new OrderComponentTester();
    jasmine.addMatchers(speculoosMatchers);

    order = {
      id: 42,
      status: 'DRAFT',
      basket: {
        customer: {
          name: 'John Doe',
          email: 'john@mail.com',
          address: 'Av. du Centre\n75000 Paris',
          type: 'CITIZEN',
          language: 'en'
        },
        rationale: 'Why not?',
        reference: 'ABCDEFGH',
        confirmationInstant: '2020-04-02T11:00:00Z'
      },
      items: [
        {
          id: 1,
          accession: {
            name: 'Rosa',
            identifier: 'rosa1'
          },
          quantity: 1234,
          unit: 'bags'
        },
        {
          id: 2,
          accession: {
            name: 'Violetta',
            identifier: 'violetta1'
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
          contentType: 'text/plain'
        }
      ]
    };
  });

  it('should not display anything until order is there', () => {
    orderService.get.and.returnValue(EMPTY);
    tester.detectChanges();

    expect(orderService.get).toHaveBeenCalledWith(42);
    expect(tester.title).toBeNull();
    expect(tester.items.length).toBe(0);
    expect(tester.editOrderComponent).toBeNull();
  });

  it('should have a title', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.title).toContainText('Commande n° ABCDEFGH');
  });

  it('should display customer information', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.testElement).toContainText('John');
    expect(tester.testElement).toContainText('john@mail.com');
    expect(tester.testElement).toContainText('Av. du Centre\n75000 Paris');
    expect(tester.testElement).toContainText('Citoyen');
    expect(tester.testElement).toContainText('Anglais');
    expect(tester.testElement).toContainText('Why not?');
  });

  it('should display order items', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.items.length).toBe(2);
    expect(tester.items[0]).toContainText('Rosa');
    expect(tester.items[0]).toContainText('1 234 bags');
    expect(tester.items[1]).toContainText('Violetta');

    expect(tester.editOrderComponent).toBeNull();
  });

  it('should not display edit button if order is not draft', () => {
    orderService.get.and.returnValue(of({ ...order, status: 'CANCELLED' }));
    tester.detectChanges();

    expect(tester.editOrderButton).toBeNull();
  });

  it('should edit order', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    tester.editOrderButton.click();

    expect(tester.items.length).toBe(0);
    expect(tester.editOrderComponent).not.toBeNull();
    expect(tester.editOrderComponent.order).toBe(tester.componentInstance.order);
  });

  it('should cancel edition', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    tester.editOrderButton.click();

    tester.editOrderComponent.cancel();
    tester.detectChanges();

    expect(tester.items.length).toBe(2);
    expect(tester.editOrderComponent).toBeNull();
  });

  it('should save and refresh', () => {
    const newOrder = { ...order };
    orderService.get.and.returnValues(of(order), of(newOrder));
    tester.detectChanges();

    tester.editOrderButton.click();

    orderService.update.and.returnValue(of(undefined));
    const command = {} as OrderCommand;
    tester.editOrderComponent.saved.emit(command);
    tester.detectChanges();

    expect(orderService.update).toHaveBeenCalledWith(order.id, command);
    expect(tester.componentInstance.order).toBe(newOrder);
    expect(tester.items.length).toBe(2);
    expect(tester.editOrderComponent).toBeNull();
  });

  it('should not have a finalize order button when status is not DRAFT', () => {
    order.status = 'CANCELLED';
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.finalizeOrderButton).toBeNull();
  });

  it('should finalize order after confirmation', () => {
    confirmationService.confirm.and.returnValue(of(undefined));
    const newOrder: DetailedOrder = { ...order, status: 'FINALIZED' };

    orderService.finalize.and.returnValue(of(undefined));
    orderService.get.and.returnValues(of(order), of(newOrder));
    tester.componentInstance.finalizationErrors.push('order.order.missing-quantity-error');
    tester.detectChanges();

    tester.finalizeOrderButton.click();

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(orderService.finalize).toHaveBeenCalledWith(tester.componentInstance.order.id);
    expect(tester.componentInstance.order).toBe(newOrder);
    expect(tester.finalizationErrors.length).toBe(0);
  });

  it('should not finalize order if missing quantity', () => {
    order.items[0].quantity = null;
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    tester.finalizeOrderButton.click();

    expect(confirmationService.confirm).not.toHaveBeenCalled();
    expect(orderService.finalize).not.toHaveBeenCalled();
    expect(tester.finalizationErrors.length).toBe(1);
  });

  it('should not have a cancel order button when status is not DRAFT', () => {
    order.status = 'CANCELLED';
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.cancelOrderButton).toBeNull();
  });

  it('should cancel order after confirmation', () => {
    confirmationService.confirm.and.returnValue(of(undefined));
    const newOrder: DetailedOrder = { ...order, status: 'CANCELLED' };

    orderService.cancel.and.returnValue(of(undefined));
    orderService.get.and.returnValues(of(order), of(newOrder));
    tester.detectChanges();

    tester.cancelOrderButton.click();

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(orderService.cancel).toHaveBeenCalledWith(tester.componentInstance.order.id);
    expect(tester.componentInstance.order).toBe(newOrder);
  });

  it('should display documents', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.documents.length).toBe(1);
    expect(tester.documents[0]).toContainText('mail.txt');
    expect(tester.documents[0]).toContainText('Autre');
    expect(tester.documents[0]).toContainText('first email');
    expect(tester.deleteDocumentButtons.length).toBe(1);

    expect(tester.addDocumentButton).not.toBeNull();
    expect(tester.editDocumentComponent).toBeNull();
    expect(tester.deleteDocumentButtons[0].disabled).toBe(false);
    expect(tester.addDocumentButton.disabled).toBe(false);

    expect(tester.testElement).not.toContainText('Aucun document');
  });

  it('should not display document delete buttons and add button if not DRAFT', () => {
    order.status = 'FINALIZED';
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.deleteDocumentButtons.length).toBe(0);
    expect(tester.addDocumentButton).toBeNull();
  });

  it('should disable buttons when editing', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    tester.editOrderButton.click();

    expect(tester.finalizeOrderButton.disabled).toBe(true);
    expect(tester.cancelOrderButton.disabled).toBe(true);
    expect(tester.deleteDocumentButtons[0].disabled).toBe(true);
    expect(tester.addDocumentButton.disabled).toBe(true);
  });

  it('should disable buttons when adding document', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    tester.addDocumentButton.click();

    expect(tester.editOrderButton.disabled).toBe(true);
    expect(tester.cancelOrderButton.disabled).toBe(true);
    expect(tester.deleteDocumentButtons[0].disabled).toBe(true);
  });

  it('should delete document after confirmation', () => {
    confirmationService.confirm.and.returnValue(of(undefined));
    const newOrder: DetailedOrder = { ...order, documents: [] };

    orderService.deleteDocument.and.returnValue(of(undefined));
    orderService.get.and.returnValues(of(order), of(newOrder));
    tester.detectChanges();

    tester.deleteDocumentButtons[0].click();

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(orderService.deleteDocument).toHaveBeenCalledWith(tester.componentInstance.order.id, 543);
    expect(tester.componentInstance.order).toBe(newOrder);
    expect(tester.testElement).toContainText('Aucun document');
  });

  it('should add document', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    tester.addDocumentButton.click();

    expect(tester.addDocumentButton).toBeNull();
    expect(tester.editDocumentComponent).not.toBeNull();
    expect(tester.editDocumentComponent.uploadProgress).toBeNull();
  });

  it('should cancel document addition', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    tester.addDocumentButton.click();

    tester.editDocumentComponent.cancel();
    tester.detectChanges();

    expect(tester.addDocumentButton).not.toBeNull();
    expect(tester.editDocumentComponent).toBeNull();
  });

  it('should create new document and refresh', () => {
    const newOrder = { ...order, documents: [order.documents[0], { ...order.documents[0], id: 765 }] };
    orderService.get.and.returnValues(of(order), of(newOrder));
    tester.detectChanges();

    tester.addDocumentButton.click();

    const progressSubject = new Subject<HttpEvent<Document>>();
    orderService.addDocument.and.returnValue(progressSubject.asObservable());
    const command = {} as DocumentCommand;
    tester.editDocumentComponent.saved.emit(command);
    tester.detectChanges();

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
    tester.detectChanges();
    expect(tester.editDocumentComponent.uploadProgress).toBe(0.5);

    progressSubject.next(event2);
    tester.detectChanges();
    expect(tester.editDocumentComponent.uploadProgress).toBe(1);

    progressSubject.next(event3);
    progressSubject.complete();
    tester.detectChanges();

    expect(tester.componentInstance.order).toBe(newOrder);
    expect(tester.documents.length).toBe(2);
    expect(tester.editDocumentComponent).toBeNull();
  });

  it('should download file', () => {
    orderService.get.and.returnValue(of(order));
    tester.detectChanges();

    expect(tester.downloadSpinner(0)).toBeNull();

    const response = new HttpResponse<Blob>();
    const responseSubject = new Subject<HttpResponse<Blob>>();
    orderService.downloadDocument.and.returnValue(responseSubject);

    tester.downloadDocumentButtons[0].click();

    expect(tester.downloadSpinner(0)).not.toBeNull();

    responseSubject.next(response);
    responseSubject.complete();
    tester.detectChanges();

    expect(tester.downloadSpinner(0)).toBeNull();
    expect(downloadService.download).toHaveBeenCalledWith(response, order.documents[0].originalFileName);
  });

  it('should not have a delivery form button when status is not FINALIZED', () => {
    orderService.get.and.returnValue(of(order));
    order.status = 'DRAFT';
    tester.detectChanges();

    expect(tester.deliveryFormButton).toBeNull();

    order.status = 'CANCELLED';
    tester.detectChanges();

    expect(tester.deliveryFormButton).toBeNull();
  });

  it('should download delivery form', () => {
    orderService.get.and.returnValue(of(order));
    order.status = 'FINALIZED';
    tester.detectChanges();

    const response = new HttpResponse<Blob>();
    orderService.downloadDeliveryForm.and.returnValue(of(response));

    tester.deliveryFormButton.click();

    expect(downloadService.download).toHaveBeenCalledWith(response, 'bon-de-livraison-42.pdf');
  });
});
