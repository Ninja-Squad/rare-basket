import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { ModalService } from '../rb-ngb/modal.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * The options that are passed when opening a confirmation modal.
 * If there is no title, then the common confirmation key is used.
 * If errorOnClose is true, then clicking "No" in the modal makes the returned observable emit an error. Otherwise,
 * the observable just doesn't emit anything and completes.
 */
export interface ConfirmationOptions {
  messageKey?: string;
  titleKey?: string;
  errorOnClose?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  constructor(private modalService: ModalService, private translateService: TranslateService) {}

  /**
   * Opens a confirmation modal, and returns an observable, which emits and completes if the user clicks "Yes".
   * If `errorOnClose` is true, then clicking "No" in the modal makes the returned observable emit an error. Otherwise,
   * the observable just doesn't emit anything and completes.
   */
  confirm(options: ConfirmationOptions): Observable<void> {
    const modalRef = this.modalService.open(ConfirmationModalComponent, options);
    modalRef.componentInstance.title = this.translateService.instant(options.titleKey ?? 'common.confirmation-modal-title');
    modalRef.componentInstance.message = this.translateService.instant(options.messageKey);
    return modalRef.result;
  }
}
