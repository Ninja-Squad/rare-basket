import { Component, inject } from '@angular/core';
import { Toast, ToastService } from '../../shared/toast.service';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rb-toasts',
  templateUrl: './toasts.component.html',
  styleUrl: './toasts.component.scss',
  imports: [NgbToast, FaIconComponent]
})
export class ToastsComponent {
  private toastService = inject(ToastService);

  toasts: Array<Toast> = [];

  constructor() {
    this.toastService.toasts().subscribe(toast => this.toasts.push(toast));
  }

  remove(toast: Toast) {
    this.toasts.splice(this.toasts.indexOf(toast), 1);
  }

  icon(toast: Toast) {
    return toast.type === 'success' ? faCheckCircle : faExclamationCircle;
  }
}
