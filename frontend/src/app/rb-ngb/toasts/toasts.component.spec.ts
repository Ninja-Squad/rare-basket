import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ToastsComponent } from './toasts.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { Toast, ToastService } from '../../shared/toast.service';
import { provideDisabledNgbAnimation } from '../disable-animations';

class ToastsComponentTester extends ComponentTester<ToastsComponent> {
  constructor() {
    super(ToastsComponent);
  }

  get toasts(): Array<NgbToast> {
    return this.components(NgbToast);
  }
}

describe('ToastsComponent', () => {
  let tester: ToastsComponentTester;
  let toastsSubject: Subject<Toast>;

  beforeEach(() => {
    const toastService = createMock(ToastService);
    toastsSubject = new Subject<Toast>();
    toastService.toasts.and.returnValue(toastsSubject);

    TestBed.configureTestingModule({
      providers: [provideDisabledNgbAnimation(), { provide: ToastService, useValue: toastService }]
    });

    tester = new ToastsComponentTester();
    tester.detectChanges();
  });

  it('should display toasts and make them disappear', fakeAsync(() => {
    expect(tester.toasts.length).toBe(0);

    toastsSubject.next({ message: 'foo', type: 'error' });
    tick(1);
    tester.detectChanges();
    expect(tester.toasts.length).toBe(1);
    expect(tester.testElement).toContainText('foo');

    tick(2500);
    toastsSubject.next({ message: 'bar', type: 'success' });
    tick(1);
    tester.detectChanges();
    expect(tester.toasts.length).toBe(2);
    expect(tester.testElement).toContainText('foo');
    expect(tester.testElement).toContainText('bar');

    tick(2500);
    tester.detectChanges();
    expect(tester.toasts.length).toBe(1);
    expect(tester.testElement).not.toContainText('foo');
    expect(tester.testElement).toContainText('bar');

    tick(2500);
    tester.detectChanges();
    expect(tester.toasts.length).toBe(0);
  }));
});
