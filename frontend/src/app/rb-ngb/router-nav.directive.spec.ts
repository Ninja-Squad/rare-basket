import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ComponentTester } from 'ngx-speculoos';
import { provideRouter, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RouterNavDirective, RouterNavLinkDirective, RouterNavPanelDirective } from './router-nav.directive';

@Component({
  template: '',
  standalone: true
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
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, RouterNavDirective, RouterNavPanelDirective, RouterNavLinkDirective]
})
class TestComponent {}

class TestComponentTester extends ComponentTester<TestComponent> {
  constructor() {
    super(TestComponent);
  }

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
          { path: 'foo', component: PlaceholderComponent },
          { path: 'bar', component: PlaceholderComponent }
        ])
      ]
    });

    tester = new TestComponentTester();
    TestBed.inject(Router).initialNavigation();

    tester.detectChanges();
  });

  it('should add class and accessibility attributes', fakeAsync(() => {
    TestBed.inject(Router).navigate(['/foo']);
    tick();
    tester.detectChanges();

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

    TestBed.inject(Router).navigate(['/bar']);
    tick();
    tester.detectChanges();

    expect(tester.tabLinks[0].attr('aria-selected')).toBe('false');
    expect(tester.tabLinks[1].attr('aria-selected')).toBe('true');
    expect(tester.tabPanel.attr('aria-labelledby')).toBe('bar');
  }));
});
