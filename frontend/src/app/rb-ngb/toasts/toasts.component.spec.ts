import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ToastsComponent } from './toasts.component';
import { ComponentTester, speculoosMatchers } from 'ngx-speculoos';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { Toast, ToastService } from '../../shared/toast.service';
import { RbNgbTestingModule } from '../rb-ngb-testing.module';

class ToastsComponentTester extends ComponentTester<ToastsComponent> {
  constructor() {
    super(ToastsComponent);
  }

  get toasts(): Array<NgbToast> {
    return this.debugElement.queryAll(By.directive(NgbToast)).map(d => d.componentInstance);
  }
}

describe('ToastsComponent', () => {
  let tester: ToastsComponentTester;
  let toastsSubject: Subject<Toast>;

  beforeEach(() => {
    const toastService = jasmine.createSpyObj<ToastService>('ToastService', ['toasts']);
    toastsSubject = new Subject<Toast>();
    toastService.toasts.and.returnValue(toastsSubject);

    TestBed.configureTestingModule({
      imports: [RbNgbTestingModule],
      declarations: [ToastsComponent],
      providers: [{ provide: ToastService, useValue: toastService }]
    });

    jasmine.addMatchers(speculoosMatchers);
    tester = new ToastsComponentTester();
    tester.detectChanges();
  });

  it('should display toasts and make them disappear', fakeAsync(() => {
    expect(tester.toasts.length).toBe(0);

    toastsSubject.next({ message: 'foo', type: 'error' });
    tester.detectChanges();
    expect(tester.toasts.length).toBe(1);
    expect(tester.testElement).toContainText('foo');

    tick(2500);
    toastsSubject.next({ message: 'bar', type: 'success' });
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
