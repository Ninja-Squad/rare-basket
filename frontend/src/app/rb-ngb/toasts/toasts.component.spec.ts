import { TestBed } from '@angular/core/testing';

import { ToastsComponent } from './toasts.component';
import { Subject } from 'rxjs';
import { Toast, ToastService } from '../../shared/toast.service';
import { provideDisabledNgbAnimation } from '../disable-animations';
import { page } from 'vitest/browser';
import { createMock, MockObject } from '../../../test/mock';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

class ToastsComponentTester {
  readonly fixture = TestBed.createComponent(ToastsComponent);
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly toasts = this.root.getByCss('.toast');
}

describe('ToastsComponent', () => {
  let tester: ToastsComponentTester;
  let toastsSubject: Subject<Toast>;

  beforeEach(async () => {
    const toastService: MockObject<ToastService> = createMock(ToastService);
    toastsSubject = new Subject<Toast>();
    toastService.toasts.mockReturnValue(toastsSubject);

    TestBed.configureTestingModule({
      providers: [provideDisabledNgbAnimation(), { provide: ToastService, useValue: toastService }]
    });
    vi.useFakeTimers();

    tester = new ToastsComponentTester();
  });

  afterEach(() => vi.useRealTimers());

  test('should display toasts and make them disappear', async () => {
    vi.advanceTimersToNextFrame();
    await expect.element(tester.toasts).toHaveLength(0);

    toastsSubject.next({ message: 'foo', type: 'error' });
    vi.advanceTimersByTime(1);
    vi.advanceTimersToNextFrame();
    await expect.element(tester.toasts).toHaveLength(1);
    await expect.element(tester.root).toHaveTextContent('foo');

    vi.advanceTimersByTime(2500);
    toastsSubject.next({ message: 'bar', type: 'success' });
    vi.advanceTimersByTime(1);
    vi.advanceTimersToNextFrame();
    await expect.element(tester.toasts).toHaveLength(2);
    await expect.element(tester.root).toHaveTextContent('foo');
    await expect.element(tester.root).toHaveTextContent('bar');

    vi.advanceTimersByTime(2500);
    vi.advanceTimersToNextFrame();
    await expect.element(tester.toasts).toHaveLength(1);
    await expect.element(tester.root).not.toHaveTextContent('foo');
    await expect.element(tester.root).toHaveTextContent('bar');

    vi.advanceTimersByTime(2500);
    vi.advanceTimersToNextFrame();
    await expect.element(tester.toasts).toHaveLength(0);
  });
});
