import { TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideRouter, Router, Routes } from '@angular/router';
import { Page } from '../../shared/page.model';
import { RouterTestingHarness } from '@angular/router/testing';
import { page } from 'vitest/browser';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, test } from 'vitest';

@Component({
  template: `@if (page(); as page) {
    <rb-pagination [page]="page" (pageChanged)="pageChanged($event)" [navigate]="navigate()" />
  }`,
  imports: [PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {
  readonly page = signal<Page<string> | undefined>(undefined);
  readonly navigate = signal(false);

  readonly newPage = signal<number | null>(null);

  pageChanged(newPage: number) {
    this.newPage.set(newPage);
  }
}

class TestComponentTester {
  readonly fixture = TestBed.createComponent(TestComponent);
  readonly componentInstance = this.fixture.componentInstance;
  readonly root = page.elementLocator(this.fixture.nativeElement);
  readonly firstPageLink = this.root.getByRole('link', { name: '1' });

  get ngbPagination(): NgbPagination | null {
    return this.fixture.debugElement.query(By.directive(NgbPagination))?.componentInstance ?? null;
  }
}

class RoutingTestComponentTester {
  readonly root;
  readonly firstPageLink;

  constructor(readonly harness: RouterTestingHarness) {
    this.root = page.elementLocator(harness.fixture.nativeElement);
    this.firstPageLink = this.root.getByRole('link', { name: '1' });
  }

  get testComponent(): TestComponent {
    return this.harness.routeDebugElement?.componentInstance as TestComponent;
  }

  get ngbPagination(): NgbPagination | null {
    return this.harness.fixture.debugElement.query(By.directive(NgbPagination))?.componentInstance ?? null;
  }

  get url(): string {
    return TestBed.inject(Router).url;
  }
}

describe('PaginationComponent', () => {
  describe('without routing', () => {
    let tester: TestComponentTester;

    beforeEach(() => {
      TestBed.configureTestingModule({});

      tester = new TestComponentTester();
    });

    test('should not display pagination if page is empty', async () => {
      tester.componentInstance.page.set({ content: [], number: 0, totalElements: 0, size: 20, totalPages: 1 });

      await tester.fixture.whenStable();

      expect(tester.ngbPagination).toBeNull();
    });

    test('should not display pagination if page is alone', async () => {
      tester.componentInstance.page.set({ content: ['a'], number: 0, totalElements: 1, size: 20, totalPages: 1 });

      await tester.fixture.whenStable();

      expect(tester.ngbPagination).toBeNull();
    });

    test('should emit event when page changes', async () => {
      tester.componentInstance.page.set({ content: ['a'], number: 1, totalElements: 21, size: 20, totalPages: 2 });

      await tester.fixture.whenStable();
      expect(tester.ngbPagination?.page).toBe(2);

      await tester.firstPageLink.click();

      expect(tester.componentInstance.newPage()).toBe(0);
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

    test('should not navigate if navigate is false', async () => {
      await tester.harness.fixture.whenStable();

      await tester.firstPageLink.click();

      expect(tester.url).toBe('/foo');
      expect(tester.testComponent.newPage()).toBe(0);
    });

    test('should navigate if navigate is true', async () => {
      tester.testComponent.navigate.set(true);

      await tester.harness.fixture.whenStable();

      await tester.firstPageLink.click();

      expect(tester.url).toBe('/foo?page=0');
      expect(tester.testComponent.newPage()).toBe(0);
    });
  });
});
