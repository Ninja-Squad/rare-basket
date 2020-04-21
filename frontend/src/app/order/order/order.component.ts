import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../order.service';
import { DetailedOrder, Document, DocumentCommand, OrderCommand } from '../order.model';
import {
  faAddressCard,
  faAt,
  faCheckSquare,
  faChevronLeft,
  faClipboardList,
  faCommentDots,
  faEdit,
  faExclamationCircle,
  faFile,
  faHome,
  faMicrophone,
  faPlus,
  faSpinner,
  faTrash,
  faUser,
  faWindowClose
} from '@fortawesome/free-solid-svg-icons';
import { filter, finalize, switchMap, tap } from 'rxjs/operators';
import { ConfirmationService } from '../../shared/confirmation.service';
import { HttpEventType } from '@angular/common/http';
import { DownloadService } from '../../shared/download.service';

/**
 * Component displaying the details of an order to a GRC user
 */
@Component({
  selector: 'rb-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  order: DetailedOrder;

  nameIcon = faUser;
  emailIcon = faAt;
  addressIcon = faHome;
  customerTypeIcon = faAddressCard;
  languageIcon = faMicrophone;
  rationaleIcon = faCommentDots;
  editIcon = faEdit;
  finalizeOrderIcon = faCheckSquare;
  finalizationErrorIcon = faExclamationCircle;
  cancelOrderIcon = faWindowClose;
  allOrdersIcon = faChevronLeft;
  documentIcon = faFile;
  addDocumentIcon = faPlus;
  deleteDocumentIcon = faTrash;
  downloadingIcon = faSpinner;
  deliveryFormIcon = faClipboardList;

  editing = false;
  addingDocument = false;
  uploadProgress: number | null = null;

  finalizationErrors: Array<string> = [];

  private downloadingDocumentIds = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private confirmationService: ConfirmationService,
    private downloadService: DownloadService
  ) {}

  ngOnInit(): void {
    const orderId = +this.route.snapshot.paramMap.get('orderId');
    this.orderService.get(orderId).subscribe(order => (this.order = order));
  }

  edit() {
    this.editing = true;
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

  cancelOrder() {
    this.confirmationService
      .confirm({
        messageKey: 'order.order.cancel-confirmation'
      })
      .pipe(
        switchMap(() => this.orderService.cancel(this.order.id)),
        switchMap(() => this.orderService.get(this.order.id))
      )
      .subscribe(order => (this.order = order));
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
      .subscribe(order => {
        this.order = order;
      });
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
    return this.editing || this.addingDocument;
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
    this.finalizationErrors = [];
    if (this.order.items.some(item => item.quantity === null)) {
      this.finalizationErrors.push('order.order.missing-quantity-error');
    }

    if (this.finalizationErrors.length !== 0) {
      return;
    }

    this.confirmationService
      .confirm({
        messageKey: 'order.order.finalize-confirmation'
      })
      .pipe(
        switchMap(() => this.orderService.finalize(this.order.id)),
        switchMap(() => this.orderService.get(this.order.id))
      )
      .subscribe(order => (this.order = order));
  }

  downloadDeliveryForm() {
    this.orderService
      .downloadDeliveryForm(this.order.id)
      .subscribe(response => this.downloadService.download(response, `bon-de-livraison-${this.order.id}.pdf`));
  }
}
