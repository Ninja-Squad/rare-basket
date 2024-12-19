import { TestBed } from '@angular/core/testing';

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

  beforeEach(async () => {
    const toastService = createMock(ToastService);
    toastsSubject = new Subject<Toast>();
    toastService.toasts.and.returnValue(toastsSubject);

    TestBed.configureTestingModule({
      providers: [provideDisabledNgbAnimation(), { provide: ToastService, useValue: toastService }]
    });
    jasmine.clock().install();

    tester = new ToastsComponentTester();
    await tester.stable();
  });

  afterEach(() => jasmine.clock().uninstall());

  it('should display toasts and make them disappear', async () => {
    expect(tester.toasts.length).toBe(0);

    toastsSubject.next({ message: 'foo', type: 'error' });
    jasmine.clock().tick(1);
    await tester.stable();
    expect(tester.toasts.length).toBe(1);
    expect(tester.testElement).toContainText('foo');

    jasmine.clock().tick(2500);
    toastsSubject.next({ message: 'bar', type: 'success' });
    jasmine.clock().tick(1);
    await tester.stable();
    expect(tester.toasts.length).toBe(2);
    expect(tester.testElement).toContainText('foo');
    expect(tester.testElement).toContainText('bar');

    jasmine.clock().tick(2500);
    await tester.stable();
    expect(tester.toasts.length).toBe(1);
    expect(tester.testElement).not.toContainText('foo');
    expect(tester.testElement).toContainText('bar');

    jasmine.clock().tick(2500);
    await tester.stable();
    expect(tester.toasts.length).toBe(0);
  });
});
