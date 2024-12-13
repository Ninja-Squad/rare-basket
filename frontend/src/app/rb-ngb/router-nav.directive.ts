import { Directive, inject, input, contentChildren } from '@angular/core';
import { RouterLinkActive } from '@angular/router';

let counter = 0;

/**
 * Directives allowing to display navs (tabs, pills) that navigate using the router, using routerLink and
 * routerLinkActive.
 * These directive main goal is to add the accessibility attributes (role, aria) automatically, as well as the
 * standard bootstrap classes (nav and nav-link).
 *
 * Usage:
 *
 * ```
 * <ul class="nav-tabs" rbRouterNav #nav="rbRouterNav">
 *   <li class="nav-item">
 *     <a routerLink="/foo" routerLinkActive="active" rbRouterNavLink>Foo</a>
 *   </li>
 *   <li class="nav-item">
 *     <a routerLink="/bar" routerLinkActive="active" rbRouterNavLink="bar">Bar</a>
 *   </li>
 * </ul>
 *
 * <div [rbRouterNavPanel]="nav">
 *   <router-outlet></router-outlet>
 * </div>
 * ```
 */
@Directive({
  selector: '[rbRouterNavLink]',
  host: {
    '[attr.role]': `'tab'`,
    '[attr.aria-selected]': 'selected',
    '[attr.id]': 'id',
    '[class.nav-link]': 'true'
  }
})
export class RouterNavLinkDirective {
  private routerLinkActive = inject(RouterLinkActive);
  nav = inject(RouterNavDirective);

  /**
   * The ID of the link. If not specified, it's auto-generated
   */
  readonly itemId = input<string | null>(null, { alias: 'rbRouterNavLink' });

  private domId = 'router-nav-link-' + counter++;

  get selected() {
    return this.routerLinkActive.isActive;
  }

  get id() {
    return this.itemId() || this.domId;
  }
}

@Directive({
  selector: '[rbRouterNavPanel]',
  host: {
    '[attr.role]': `'tabpanel'`,
    '[attr.aria-labelledby]': 'nav().selectedId'
  }
})
export class RouterNavPanelDirective {
  /**
   * The reference to the router nav directive.
   */
  readonly nav = input.required<RouterNavDirective>({ alias: 'rbRouterNavPanel' });
}

@Directive({
  selector: '[rbRouterNav]',
  exportAs: 'rbRouterNav',
  host: {
    '[attr.role]': `'tablist'`,
    '[class.nav]': 'true'
  }
})
export class RouterNavDirective {
  readonly navItems = contentChildren(RouterNavLinkDirective, { descendants: true });

  get selectedId() {
    return this.navItems()?.find(item => item.nav === this && item.selected)?.id;
  }
}
