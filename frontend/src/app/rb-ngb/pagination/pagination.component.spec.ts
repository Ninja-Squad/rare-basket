import { TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentTester, RoutingTester } from 'ngx-speculoos';
import { provideRouter, Routes } from '@angular/router';
import { Page } from '../../shared/page.model';
import { RouterTestingHarness } from '@angular/router/testing';

@Component({
  template: `@if (page(); as page) {
    <rb-pagination [page]="page" (pageChanged)="pageChanged($event)" [navigate]="navigate()" />
  }`,
  imports: [PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  page = signal<Page<string> | undefined>(undefined);
  navigate = signal(false);

  newPage: number | null = null;

  pageChanged(newPage: number) {
    this.newPage = newPage;
  }
}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

  get ngbPagination(): NgbPagination {
    return this.component(NgbPagination);
  }

  get firstPageLink() {
    return this.element<HTMLAnchorElement>('a');
  }
}

class RoutingTestComponentTester extends RoutingTester {
  get testComponent(): TestComponent {
    return this.component(TestComponent);
  }

  get ngbPagination(): NgbPagination {
    return this.component(NgbPagination);
  }

  get firstPageLink() {
    return this.element<HTMLAnchorElement>('a');
  }
}

describe('PaginationComponent', () => {
  describe('without routing', () => {
    let tester: TestComponentTester;

    beforeEach(() => {
      TestBed.configureTestingModule({});

      tester = new TestComponentTester();
    });

    it('should not display pagination if page is empty', async () => {
      tester.componentInstance.page.set({ content: [], number: 0, totalElements: 0, size: 20, totalPages: 1 });

      await tester.stable();

      expect(tester.ngbPagination).toBeNull();
    });

    it('should not display pagination if page is alone', async () => {
      tester.componentInstance.page.set({ content: ['a'], number: 0, totalElements: 1, size: 20, totalPages: 1 });

      await tester.stable();

      expect(tester.ngbPagination).toBeNull();
    });

    it('should emit event when page changes', async () => {
      tester.componentInstance.page.set({ content: ['a'], number: 1, totalElements: 21, size: 20, totalPages: 2 });

      await tester.stable();
      expect(tester.ngbPagination.page).toBe(2);

      await tester.firstPageLink.click();

      expect(tester.componentInstance.newPage).toBe(0);
    });
  });

  describe('with routing', () => {
    let tester: RoutingTestComponentTester;
    beforeEach(async () => {
      const routes: Routes = [
        {
          path: 'foo',
          component: TestComponent
        }
      ];

      TestBed.configureTestingModule({
        providers: [provideRouter(routes)]
      });

      tester = new RoutingTestComponentTester(await RouterTestingHarness.create('/foo'));
      tester.testComponent.page.set({ content: ['a'], number: 1, totalElements: 21, size: 20, totalPages: 2 });
    });

    it('should not navigate if navigate is false', async () => {
      await tester.stable();

      await tester.firstPageLink.click();

      expect(tester.url).toBe('/foo');
      expect(tester.testComponent.newPage).toBe(0);
    });

    it('should navigate if navigate is true', async () => {
      tester.testComponent.navigate.set(true);

      await tester.stable();

      await tester.firstPageLink.click();

      expect(tester.url).toBe('/foo?page=0');
      expect(tester.testComponent.newPage).toBe(0);
    });
  });
});
