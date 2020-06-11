import { Component, OnInit } from '@angular/core';
import { Toast, ToastService } from '../../shared/toast.service';
import { faExclamationCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'rb-toasts',
  templateUrl: './toasts.component.html',
  styleUrls: ['./toasts.component.scss'],
  // tslint:disable-next-line:no-host-metadata-property
  host: { '[class.ngb-toasts]': 'true' }
})
export class ToastsComponent implements OnInit {
  toasts: Array<Toast> = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts().subscribe(toast => this.toasts.push(toast));
  }

  remove(toast: Toast) {
    this.toasts.splice(this.toasts.indexOf(toast), 1);
  }

  icon(toast: Toast) {
    return toast.type === 'success' ? faInfoCircle : faExclamationCircle;
  }
}
