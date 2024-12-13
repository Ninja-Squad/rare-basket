import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ModalOptions, ModalService } from './modal.service';

@Component({
  template: 'Hello'
})
class TestModalComponent {}

describe('ModalService', () => {
  let ngbModal: NgbModal;
  let modalService: ModalService;
  const fakeModalComponent = jasmine.createSpyObj<TestModalComponent>(['']);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    ngbModal = TestBed.inject(NgbModal);
    modalService = TestBed.inject(ModalService);
  });

  it('should create a modal instance', fakeAsync(() => {
    spyOn(ngbModal, 'open').and.returnValue({
      componentInstance: fakeModalComponent,
      result: Promise.resolve()
    } as NgbModalRef);

    const modal = modalService.open(TestModalComponent);

    expect(ngbModal.open).toHaveBeenCalledWith(TestModalComponent, undefined);
    expect(modal.componentInstance).toBe(fakeModalComponent);
  }));

  it('should emit on close', fakeAsync(() => {
    spyOn(ngbModal, 'open').and.returnValue({
      componentInstance: fakeModalComponent,
      result: Promise.resolve()
    } as NgbModalRef);

    const modal = modalService.open(TestModalComponent);

    let closed = false;
    modal.result.subscribe(() => (closed = true));

    // close the modal by resolving the promise
    tick();

    expect(closed).toBe(true);
  }));

  it('should emit EMPTY on cancel', fakeAsync(() => {
    spyOn(ngbModal, 'open').and.returnValue({
      componentInstance: fakeModalComponent,
      result: Promise.reject()
    } as NgbModalRef);

    const modal = modalService.open(TestModalComponent);

    let closed = false;
    modal.result.subscribe(() => (closed = true));

    // close the modal by resolving the promise
    tick();

    expect(closed).toBe(false);
  }));

  it('should throw error on cancel if options says so', fakeAsync(() => {
    spyOn(ngbModal, 'open').and.returnValue({
      componentInstance: fakeModalComponent,
      result: Promise.reject()
    } as NgbModalRef);

    const options: ModalOptions = { errorOnClose: true };
    const modal = modalService.open(TestModalComponent, options);

    expect(ngbModal.open).toHaveBeenCalledWith(TestModalComponent, options);
    expect(modal.componentInstance).toBe(fakeModalComponent);

    let hasError = false;
    modal.result.subscribe({ error: () => (hasError = true) });

    // close the modal by resolving the promise
    tick();

    expect(hasError).toBe(true);
  }));
});
