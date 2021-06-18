import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();

  constructor(private translateService: TranslateService) {}

  error(messageKey: string, interpolateParams?: Record<string, unknown>) {
    this.signal(messageKey, 'error', interpolateParams);
  }

  success(messageKey: string, interpolateParams?: Record<string, unknown>) {
    this.signal(messageKey, 'success', interpolateParams);
  }

  toasts(): Observable<Toast> {
    return this.toastSubject.asObservable();
  }

  private signal(messageKey: string, type: 'success' | 'error', interpolateParams?: Record<string, unknown>) {
    this.translateService.get(messageKey, interpolateParams).subscribe(message => this.toastSubject.next({ message, type }));
  }
}
