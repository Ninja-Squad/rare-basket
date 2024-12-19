import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RoutingTester } from 'ngx-speculoos';
import { provideRouter, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RouterNavDirective, RouterNavLinkDirective, RouterNavPanelDirective } from './router-nav.directive';
import { RouterTestingHarness } from '@angular/router/testing';

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

class TestComponentTester extends RoutingTester {
  get tabList() {
    return this.element('ul');
  }

  get tabLinks() {
    return this.elements('a');
  }

  get tabPanel() {
    return this.element('div');
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

  it('should add class and accessibility attributes', async () => {
    tester = new TestComponentTester(await RouterTestingHarness.create('/foo'));
    await tester.stable();

    expect(tester.tabList.attr('role')).toBe('tablist');
    expect(tester.tabList).toHaveClass('nav');

    expect(tester.tabLinks[0].attr('role')).toBe('tab');
    expect(tester.tabLinks[0]).toHaveClass('nav-link');
    expect(tester.tabLinks[0].nativeElement.id).toBeTruthy();
    expect(tester.tabLinks[0].attr('aria-selected')).toBe('true');

    expect(tester.tabLinks[1].attr('role')).toBe('tab');
    expect(tester.tabLinks[1]).toHaveClass('nav-link');
    expect(tester.tabLinks[1].nativeElement.id).toBe('bar');
    expect(tester.tabLinks[1].attr('aria-selected')).toBe('false');

    expect(tester.tabPanel.attr('role')).toBe('tabpanel');
    expect(tester.tabPanel.attr('aria-labelledby')).toBe(tester.tabLinks[0].nativeElement.id);

    await tester.harness.navigateByUrl('/bar');

    expect(tester.tabLinks[0].attr('aria-selected')).toBe('false');
    expect(tester.tabLinks[1].attr('aria-selected')).toBe('true');
    expect(tester.tabPanel.attr('aria-labelledby')).toBe('bar');
  });
});
