import { Component, OnInit } from '@angular/core';
import { Toast, ToastService } from '../../shared/toast.service';
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rb-toasts',
  templateUrl: './toasts.component.html',
  styleUrl: './toasts.component.scss',
  standalone: true,
  imports: [NgbToast, FontAwesomeModule]
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
    return toast.type === 'success' ? faCheckCircle : faExclamationCircle;
  }
}
