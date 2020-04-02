import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';
import { NgbPagination, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Component } from '@angular/core';
import { ComponentTester, fakeRoute, speculoosMatchers, TestHtmlElement } from 'ngx-speculoos';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Page } from '../../shared/page.model';

@Component({
  template: `
    <rb-pagination [page]="page" (pageChanged)="pageChanged($event)" [navigate]="navigate"></rb-pagination>
  `
})
class TestComponent {
  page: Page<string>;
  newPage: number = null;

  navigate = false;

  pageChanged(newPage: number) {
    this.newPage = newPage;
  }
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get ngbPagination(): NgbPagination {
    const debugElement = this.debugElement.query(By.directive(NgbPagination));
    return debugElement ? debugElement.componentInstance : null;
  }

  get firstPageLink() {
    return this.element('a') as TestHtmlElement<HTMLAnchorElement>;
  }
}

describe('PaginationComponent', () => {
  let tester: TestComponentTester;

  describe('without routing', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [PaginationComponent, TestComponent],
        imports: [NgbPaginationModule]
      });

      tester = new TestComponentTester();

      jasmine.addMatchers(speculoosMatchers);
    });

    it('should not display pagination if page is empty', () => {
      tester.componentInstance.page = { content: [], number: 0, totalElements: 0, size: 20, totalPages: 1 };

      tester.detectChanges();

      expect(tester.ngbPagination).toBeNull();
    });

    it('should not display pagination if page is alone', () => {
      tester.componentInstance.page = { content: ['a'], number: 0, totalElements: 1, size: 20, totalPages: 1 };

      tester.detectChanges();

      expect(tester.ngbPagination).toBeNull();
    });

    it('should emit event when page changes', fakeAsync(() => {
      tester.componentInstance.page = { content: ['a'], number: 1, totalElements: 21, size: 20, totalPages: 2 };

      tester.detectChanges();
      expect(tester.ngbPagination.page).toBe(2);

      tester.firstPageLink.click();
      tick();

      expect(tester.componentInstance.newPage).toBe(0);
    }));
  });

  describe('with routing', () => {
    let route: ActivatedRoute;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
      route = fakeRoute({});
      router = jasmine.createSpyObj('router', ['navigate']);

      TestBed.configureTestingModule({
        declarations: [PaginationComponent, TestComponent],
        imports: [NgbPaginationModule],
        providers: [
          { provide: ActivatedRoute, useValue: route },
          { provide: Router, useValue: router }
        ]
      });

      tester = new TestComponentTester();
      tester.componentInstance.page = { content: ['a'], number: 1, totalElements: 21, size: 20, totalPages: 2 };

      jasmine.addMatchers(speculoosMatchers);
    });

    it('should not navigate if navigate is false', fakeAsync(() => {
      tester.detectChanges();

      tester.firstPageLink.click();
      tick();

      expect(router.navigate).not.toHaveBeenCalled();
      expect(tester.componentInstance.newPage).toBe(0);
    }));

    it('should navigate if navigate is true', fakeAsync(() => {
      tester.componentInstance.navigate = true;

      tester.detectChanges();

      tester.firstPageLink.click();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['.'], { relativeTo: route, queryParams: { page: 0 }, queryParamsHandling: 'merge' });
      expect(tester.componentInstance.newPage).toBe(0);
    }));
  });
});
