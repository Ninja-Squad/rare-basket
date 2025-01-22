import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
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
import { ConfirmationService } from '../../shared/confirmation.service';
import { HttpEventType } from '@angular/common/http';
import { DownloadService } from '../../shared/download.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FinalizationWarningsModalComponent } from '../finalization-warnings-modal/finalization-warnings-modal.component';
import { filter, finalize, map, Observable, startWith, Subject, switchMap, tap } from 'rxjs';
import { ModalService } from '../../rb-ngb/modal.service';
import { ToastService } from '../../shared/toast.service';
import { DocumentTypeEnumPipe } from '../document-type-enum.pipe';
import { OrderStatusEnumPipe } from '../order-status-enum.pipe';
import { EditDocumentComponent } from '../edit-document/edit-document.component';
import { EditOrderComponent } from '../edit-order/edit-order.component';
import { AccessionComponent } from '../../shared/accession/accession.component';
import { EditCustomerInformationComponent } from '../edit-customer-information/edit-customer-information.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CustomerInformationComponent } from '../../shared/customer-information/customer-information.component';
import { DatePipe, DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

/**
 * Component displaying the details of an order to a GRC user
 */
@Component({
  selector: 'rb-order',
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss',
  imports: [
    TranslateModule,
    CustomerInformationComponent,
    FaIconComponent,
    EditCustomerInformationComponent,
    AccessionComponent,
    EditOrderComponent,
    EditDocumentComponent,
    RouterLink,
    DecimalPipe,
    DatePipe,
    OrderStatusEnumPipe,
    DocumentTypeEnumPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderComponent {
  private readonly orderService = inject(OrderService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly downloadService = inject(DownloadService);
  private readonly translateService = inject(TranslateService);
  private readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);

  readonly order: Signal<DetailedOrder | undefined>;

  readonly editIcon = faEdit;
  readonly finalizeOrderIcon = faCheckSquare;
  readonly cancelOrderIcon = faWindowClose;
  readonly allOrdersIcon = faChevronLeft;
  readonly documentOnDeliveryFormIcon = faFileMedical;
  readonly documentNotOnDeliveryFormIcon = faFile;
  readonly addDocumentIcon = faPlus;
  readonly deleteDocumentIcon = faTrash;
  readonly downloadingIcon = faSpinner;
  readonly deliveryFormIcon = faClipboard;
  readonly completeDeliveryFormIcon = faClipboardList;

  readonly editing = signal(false);
  readonly editingCustomer = signal(false);
  readonly addingDocument = signal(false);
  readonly operationInProgress = computed(() => this.editing() || this.editingCustomer() || this.addingDocument());
  readonly uploadProgress = signal<number | null>(null);
  readonly statusChanged = signal(false);
  readonly downloadingDeliveryForm = signal(false);

  private readonly downloadingDocumentIds = signal<Array<number>>([]);

  readonly refresh = new Subject<void>();

  constructor() {
    const route = inject(ActivatedRoute);
    const orderId = parseInt(route.snapshot.paramMap.get('orderId')!);
    this.order = toSignal(
      this.refresh.pipe(
        map(() => 'refresh'),
        startWith('init'),
        switchMap(cause => this.orderService.get(orderId).pipe(map(order => ({ order, cause })))),
        tap(({ order, cause }) => {
          if (cause === 'init' && order.items.length === 0) {
            this.editing.set(true);
          }
        }),
        map(({ order }) => order)
      )
    );
  }

  edit() {
    this.editing.set(true);
  }

  editCustomer() {
    this.editingCustomer.set(true);
  }

  saved(command: OrderCommand) {
    const order = this.order()!;
    this.orderService.update(order.id, command).subscribe(() => {
      this.editing.set(false);
      this.refresh.next();
    });
  }

  customerSaved(command: CustomerInformationCommand) {
    const order = this.order()!;
    this.orderService.updateCustomerInformation(order.id, command).subscribe(() => {
      this.editingCustomer.set(false);
      this.refresh.next();
    });
  }

  cancelOrder() {
    const order = this.order()!;
    this.confirmationService
      .confirm({
        messageKey: 'order.order.cancel-confirmation'
      })
      .pipe(
        tap(() => this.statusChanged.set(false)),
        switchMap(() => this.orderService.cancel(order.id))
      )
      .subscribe(() => {
        this.toastService.success('order.order.cancelled');
        this.refresh.next();
        this.statusChanged.set(true);
      });
  }

  createDocument(command: DocumentCommand) {
    const order = this.order()!;
    this.orderService
      .addDocument(order.id, command)
      .pipe(
        finalize(() => this.uploadProgress.set(null)),
        tap(progressEvent => {
          if (progressEvent.type === HttpEventType.UploadProgress) {
            this.uploadProgress.set(progressEvent.loaded / progressEvent.total!);
          }
        }),
        filter(progressEvent => progressEvent.type === HttpEventType.Response),
        finalize(() => this.addingDocument.set(false))
      )
      .subscribe(() => this.refresh.next());
  }

  deleteDocument(document: Document) {
    const order = this.order()!;
    this.confirmationService
      .confirm({
        messageKey: 'order.order.delete-document-confirmation'
      })
      .pipe(switchMap(() => this.orderService.deleteDocument(order.id, document.id)))
      .subscribe(() => this.refresh.next());
  }

  download(document: Document, event: Event) {
    const order = this.order()!;
    event.stopPropagation();
    event.preventDefault();
    this.downloadingDocumentIds.update(ids => [...ids, document.id]);
    this.orderService
      .downloadDocument(order.id, document.id)
      .pipe(finalize(() => this.downloadingDocumentIds.update(ids => ids.filter(id => id !== document.id))))
      .subscribe(response => this.downloadService.download(response, document.originalFileName));
  }

  isDownloading(document: Document) {
    return this.downloadingDocumentIds().includes(document.id);
  }

  finalizeOrder() {
    const order = this.order()!;
    let result$: Observable<void>;

    const warnings: Array<string> = [];
    if (!order.documents.some(doc => doc.type === 'MTA' || doc.type === 'SMTA')) {
      warnings.push(this.translateService.instant('order.order.missing-mta-warning'));
    }
    if (!order.documents.some(doc => doc.type === 'SANITARY_PASSPORT')) {
      warnings.push(this.translateService.instant('order.order.missing-sanitary-passport-warning'));
    }
    if (order.items.some(item => item.quantity === null)) {
      warnings.push(this.translateService.instant('order.order.missing-quantity-warning'));
    }
    if (order.items.some(item => item.unit === null)) {
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
        tap(() => this.statusChanged.set(false)),
        switchMap(() => this.orderService.finalize(order.id))
      )
      .subscribe(() => {
        this.toastService.success('order.order.finalized');
        this.statusChanged.set(true);
        this.refresh.next();
      });
  }

  downloadDeliveryForm(options = { withDocuments: false }) {
    const order = this.order()!;
    this.orderService
      .downloadDeliveryForm(order.id, options)
      .subscribe(response => this.downloadService.download(response, `bon-de-livraison-${order.id}.pdf`));
  }

  hasOnDeliveryFormDocument() {
    return this.order()!.documents.some(document => document.onDeliveryForm);
  }

  downloadCompleteDeliveryForm() {
    this.downloadDeliveryForm({ withDocuments: true });
  }
}
