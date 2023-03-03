import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../order.service';
import { CustomerInformationCommand, DetailedOrder, Document, DocumentCommand, OrderCommand } from '../order.model';
import {
  faCheckSquare,
  faChevronLeft,
  faClipboard,
  faClipboardList,
  faEdit,
  faFile,
  faFileMedical,
  faPlus,
  faSpinner,
  faTrash,
  faWindowClose
} from '@fortawesome/free-solid-svg-icons';
import { filter, finalize, switchMap, tap } from 'rxjs/operators';
import { ConfirmationService } from '../../shared/confirmation.service';
import { HttpEventType } from '@angular/common/http';
import { DownloadService } from '../../shared/download.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FinalizationWarningsModalComponent } from '../finalization-warnings-modal/finalization-warnings-modal.component';
import { Observable } from 'rxjs';
import { ModalService } from '../../rb-ngb/modal.service';
import { ToastService } from '../../shared/toast.service';
import { DocumentTypeEnumPipe } from '../document-type-enum.pipe';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';
import { EditDocumentComponent } from '../edit-document/edit-document.component';
import { EditOrderComponent } from '../edit-order/edit-order.component';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { EditCustomerInformationComponent } from '../edit-customer-information/edit-customer-information.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CustomerInformationComponent } from '../../shared/customer-information/customer-information.component';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';

/**
 * Component displaying the details of an order to a GRC user
 */
@Component({
  selector: 'rb-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    CustomerInformationComponent,
    FontAwesomeModule,
    EditCustomerInformationComponent,
    NgFor,
    AccessionComponent,
    EditOrderComponent,
    EditDocumentComponent,
    RouterLink,
    DecimalPipe,
    DatePipe,
    OrderStatusEnumPipe,
    DocumentTypeEnumPipe
  ]
})
export class OrderComponent implements OnInit {
  order: DetailedOrder;

  editIcon = faEdit;
  finalizeOrderIcon = faCheckSquare;
  cancelOrderIcon = faWindowClose;
  allOrdersIcon = faChevronLeft;
  documentOnDeliveryFormIcon = faFileMedical;
  documentNotOnDeliveryFormIcon = faFile;
  addDocumentIcon = faPlus;
  deleteDocumentIcon = faTrash;
  downloadingIcon = faSpinner;
  deliveryFormIcon = faClipboard;
  completeDeliveryFormIcon = faClipboardList;

  editing = false;
  editingCustomer = false;
  addingDocument = false;
  uploadProgress: number | null = null;
  statusChanged = false;
  downloadingDeliveryForm = false;

  private downloadingDocumentIds = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private confirmationService: ConfirmationService,
    private downloadService: DownloadService,
    private translateService: TranslateService,
    private modalService: ModalService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const orderId = +this.route.snapshot.paramMap.get('orderId');
    this.orderService.get(orderId).subscribe(order => {
      this.order = order;
      if (this.order.items.length === 0) {
        // we have just created the order, so let's start by editing the order right away
        this.editing = true;
      }
    });
  }

  edit() {
    this.editing = true;
  }

  editCustomer() {
    this.editingCustomer = true;
  }

  saved(command: OrderCommand) {
    this.orderService
      .update(this.order.id, command)
      .pipe(switchMap(() => this.orderService.get(this.order.id)))
      .subscribe(order => {
        this.editing = false;
        this.order = order;
      });
  }

  customerSaved(command: CustomerInformationCommand) {
    this.orderService
      .updateCustomerInformation(this.order.id, command)
      .pipe(switchMap(() => this.orderService.get(this.order.id)))
      .subscribe(order => {
        this.editingCustomer = false;
        this.order = order;
      });
  }

  cancelOrder() {
    this.confirmationService
      .confirm({
        messageKey: 'order.order.cancel-confirmation'
      })
      .pipe(
        tap(() => (this.statusChanged = false)),
        switchMap(() => this.orderService.cancel(this.order.id)),
        tap(() => this.toastService.success('order.order.cancelled')),
        switchMap(() => this.orderService.get(this.order.id))
      )
      .subscribe(order => {
        this.order = order;
        this.statusChanged = true;
      });
  }

  createDocument(command: DocumentCommand) {
    this.orderService
      .addDocument(this.order.id, command)
      .pipe(
        finalize(() => (this.uploadProgress = null)),
        tap(progressEvent => {
          if (progressEvent.type === HttpEventType.UploadProgress) {
            this.uploadProgress = progressEvent.loaded / progressEvent.total;
          }
        }),
        filter(progressEvent => progressEvent.type === HttpEventType.Response),
        finalize(() => (this.addingDocument = false)),
        switchMap(() => this.orderService.get(this.order.id))
      )
      .subscribe(order => (this.order = order));
  }

  deleteDocument(document: Document) {
    this.confirmationService
      .confirm({
        messageKey: 'order.order.delete-document-confirmation'
      })
      .pipe(
        switchMap(() => this.orderService.deleteDocument(this.order.id, document.id)),
        switchMap(() => this.orderService.get(this.order.id))
      )
      .subscribe(order => (this.order = order));
  }

  get operationInProgress() {
    return this.editing || this.editingCustomer || this.addingDocument;
  }

  download(document: Document, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.downloadingDocumentIds.add(document.id);
    this.orderService
      .downloadDocument(this.order.id, document.id)
      .pipe(finalize(() => this.downloadingDocumentIds.delete(document.id)))
      .subscribe(response => this.downloadService.download(response, document.originalFileName));
  }

  isDownloading(document: Document) {
    return this.downloadingDocumentIds.has(document.id);
  }

  finalizeOrder() {
    let result$: Observable<void>;

    const warnings: Array<string> = [];
    if (!this.order.documents.some(doc => doc.type === 'MTA' || doc.type === 'SMTA')) {
      warnings.push(this.translateService.instant('order.order.missing-mta-warning'));
    }
    if (!this.order.documents.some(doc => doc.type === 'SANITARY_PASSPORT')) {
      warnings.push(this.translateService.instant('order.order.missing-sanitary-passport-warning'));
    }
    if (this.order.items.some(item => item.quantity === null)) {
      warnings.push(this.translateService.instant('order.order.missing-quantity-warning'));
    }
    if (this.order.items.some(item => item.unit === null)) {
      warnings.push(this.translateService.instant('order.order.missing-unit-warning'));
    }

    if (warnings.length > 0) {
      const modal = this.modalService.open(FinalizationWarningsModalComponent, { size: 'lg' });
      modal.componentInstance.init(warnings);
      result$ = modal.result;
    } else {
      result$ = this.confirmationService.confirm({
        messageKey: 'order.order.finalize-confirmation'
      });
    }

    result$
      .pipe(
        tap(() => (this.statusChanged = false)),
        switchMap(() => this.orderService.finalize(this.order.id)),
        tap(() => this.toastService.success('order.order.finalized')),
        switchMap(() => this.orderService.get(this.order.id))
      )
      .subscribe(order => {
        this.order = order;
        this.statusChanged = true;
      });
  }

  downloadDeliveryForm(options = { withDocuments: false }) {
    this.orderService
      .downloadDeliveryForm(this.order.id, options)
      .subscribe(response => this.downloadService.download(response, `bon-de-livraison-${this.order.id}.pdf`));
  }

  hasOnDeliveryFormDocument() {
    return this.order.documents.some(document => document.onDeliveryForm);
  }

  downloadCompleteDeliveryForm() {
    this.downloadDeliveryForm({ withDocuments: true });
  }
}
