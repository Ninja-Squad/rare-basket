import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { ToastsComponent } from './toasts.component';
import { ComponentTester } from 'ngx-speculoos';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { Toast, ToastService } from '../../shared/toast.service';
import { provideDisabledNgbAnimation } from '../disable-animations';
import { createMock } from '../../../mock';

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
    vi.useFakeTimers();
    const toastService = createMock(ToastService);
    toastsSubject = new Subject<Toast>();
    toastService.toasts.mockReturnValue(toastsSubject);

    TestBed.configureTestingModule({
      providers: [provideDisabledNgbAnimation(), { provide: ToastService, useValue: toastService }]
    });

    tester = new ToastsComponentTester();
    await tester.stable();
  });

  afterEach(() => vi.useRealTimers());

  it.skip('should display toasts and make them disappear', async () => {
    expect(tester.toasts.length).toBe(0);

    toastsSubject.next({ message: 'foo', type: 'error' });
    vi.advanceTimersByTime(1);
    vi.advanceTimersToNextFrame();
    await tester.stable();
    expect(tester.toasts.length).toBe(1);
    expect(tester.testElement).toContainText('foo');

    vi.advanceTimersByTime(2500);
    vi.advanceTimersToNextFrame();
    toastsSubject.next({ message: 'bar', type: 'success' });
    vi.advanceTimersByTime(1);
    vi.advanceTimersToNextFrame();
    await tester.stable();
    expect(tester.toasts.length).toBe(2);
    expect(tester.testElement).toContainText('foo');
    expect(tester.testElement).toContainText('bar');

    vi.advanceTimersByTime(2500);
    vi.advanceTimersToNextFrame();
    await tester.stable();
    expect(tester.toasts.length).toBe(1);
    expect(tester.testElement).not.toContainText('foo');
    expect(tester.testElement).toContainText('bar');

    vi.advanceTimersByTime(2500);
    vi.advanceTimersToNextFrame();
    await tester.stable();
    expect(tester.toasts.length).toBe(0);
  });
});
