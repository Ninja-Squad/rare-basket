import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideRouter, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RouterNavDirective, RouterNavLinkDirective, RouterNavPanelDirective } from './router-nav.directive';
import { RouterTestingHarness } from '@angular/router/testing';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, test } from 'vitest';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class PlaceholderComponent {}

@Component({
  template: `
    <ul class="nav-tabs" rbRouterNav #nav="rbRouterNav">
      @if (true) {
        <li class="nav-item">
          <a routerLink="/foo" routerLinkActive="active" rbRouterNavLink>Foo</a>
        </li>
      }
      <li class="nav-item">
        <a routerLink="/bar" routerLinkActive="active" rbRouterNavLink="bar">Bar</a>
      </li>
    </ul>

    <div [rbRouterNavPanel]="nav">
      <router-outlet />
    </div>
  `,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, RouterNavDirective, RouterNavPanelDirective, RouterNavLinkDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class TestComponent {}

class TestComponentTester {
  readonly root;
  readonly tabList;
  readonly tabLinks;
  readonly tabPanel;

  constructor(readonly harness: RouterTestingHarness) {
    this.root = page.elementLocator(harness.fixture.nativeElement);
    this.tabList = this.root.getByCss('ul');
    this.tabLinks = this.root.getByCss('a');
    this.tabPanel = this.root.getByCss('div');
  }
}

describe('Router nav directives', () => {
  let tester: TestComponentTester;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: '',
            component: TestComponent,
            children: [
              { path: 'foo', component: PlaceholderComponent },
              { path: 'bar', component: PlaceholderComponent }
            ]
          }
        ])
      ]
    });
  });

  test('should add class and accessibility attributes', async () => {
    tester = new TestComponentTester(await RouterTestingHarness.create('/foo'));
    await tester.harness.fixture.whenStable();

    await expect.element(tester.tabList).toHaveAttribute('role', 'tablist');
    await expect.element(tester.tabList).toHaveClass('nav');

    const firstLink = tester.tabLinks.nth(0);
    const secondLink = tester.tabLinks.nth(1);
    await expect.element(firstLink).toHaveAttribute('role', 'tab');
    await expect.element(firstLink).toHaveClass('nav-link');
    const firstLinkId = firstLink.element().id;
    expect(firstLinkId).toBeTruthy();
    await expect.element(firstLink).toHaveAttribute('aria-selected', 'true');

    await expect.element(secondLink).toHaveAttribute('role', 'tab');
    await expect.element(secondLink).toHaveClass('nav-link');
    const secondLinkId = secondLink.element().id;
    expect(secondLinkId).toBe('bar');
    await expect.element(secondLink).toHaveAttribute('aria-selected', 'false');

    await expect.element(tester.tabPanel).toHaveAttribute('role', 'tabpanel');
    await expect.element(tester.tabPanel).toHaveAttribute('aria-labelledby', firstLinkId);

    await tester.harness.navigateByUrl('/bar');
    await tester.harness.fixture.whenStable();

    await expect.element(firstLink).toHaveAttribute('aria-selected', 'false');
    await expect.element(secondLink).toHaveAttribute('aria-selected', 'true');
    await expect.element(tester.tabPanel).toHaveAttribute('aria-labelledby', 'bar');
  });
});
