import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ModalOptions, ModalService } from './modal.service';
import { beforeEach, describe, expect, test, vi } from 'vitest';

@Component({
  template: 'Hello',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestModalComponent {}

describe('ModalService', () => {
  let ngbModal: NgbModal;
  let modalService: ModalService;
  const fakeModalComponent = {} as TestModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    ngbModal = TestBed.inject(NgbModal);
    modalService = TestBed.inject(ModalService);
  });

  test('should create a modal instance', () => {
    vi.spyOn(ngbModal, 'open').mockReturnValue({
      componentInstance: fakeModalComponent,
      result: Promise.resolve()
    } as NgbModalRef);

    const modal = modalService.open(TestModalComponent);

    expect(ngbModal.open).toHaveBeenCalledWith(TestModalComponent, undefined);
    expect(modal.componentInstance).toBe(fakeModalComponent);
  });

  test('should emit on close', async () => {
    const promise = Promise.resolve();
    vi.spyOn(ngbModal, 'open').mockReturnValue({
      componentInstance: fakeModalComponent,
      result: promise
    } as NgbModalRef);

    const modal = modalService.open(TestModalComponent);

    let closed = false;
    modal.result.subscribe(() => (closed = true));

    // close the modal by resolving the promise
    await promise;

    expect(closed).toBe(true);
  });

  test('should emit EMPTY on cancel', async () => {
    const promise = Promise.reject();
    vi.spyOn(ngbModal, 'open').mockReturnValue({
      componentInstance: fakeModalComponent,
      result: promise
    } as unknown as NgbModalRef);

    const modal = modalService.open(TestModalComponent);

    let closed = false;
    modal.result.subscribe(() => (closed = true));

    // close the modal by resolving the promise
    try {
      await promise;
    } catch (_) {
      // ignore
    }

    expect(closed).toBe(false);
  });

  test('should throw error on cancel if options says so', async () => {
    const promise = Promise.reject();
    vi.spyOn(ngbModal, 'open').mockReturnValue({
      componentInstance: fakeModalComponent,
      result: promise
    } as unknown as NgbModalRef);

    const options: ModalOptions = { errorOnClose: true };
    const modal = modalService.open(TestModalComponent, options);

    expect(ngbModal.open).toHaveBeenCalledWith(TestModalComponent, options);
    expect(modal.componentInstance).toBe(fakeModalComponent);

    let hasError = false;
    modal.result.subscribe({ error: () => (hasError = true) });

    // close the modal by resolving the promise
    try {
      await promise;
    } catch (_) {
      // ignore
    }

    expect(hasError).toBe(true);
  });
});
