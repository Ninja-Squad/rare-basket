import { ContentChildren, Directive, Input, QueryList, inject } from '@angular/core';
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
 *   <li *ngIf="true" class="nav-item">
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
  },
  standalone: true
})
export class RouterNavLinkDirective {
  private routerLinkActive = inject(RouterLinkActive);
  nav = inject(RouterNavDirective);

  /**
   * The ID of the link. If not specified, it's auto-generated
   */
  @Input('rbRouterNavLink') itemId: string | null = null;

  private domId = 'router-nav-link-' + counter++;

  get selected() {
    return this.routerLinkActive.isActive;
  }

  get id() {
    return this.itemId || this.domId;
  }
}

@Directive({
  selector: '[rbRouterNavPanel]',
  host: {
    '[attr.role]': `'tabpanel'`,
    '[attr.aria-labelledby]': 'nav.selectedId'
  },
  standalone: true
})
export class RouterNavPanelDirective {
  /**
   * The reference to the router nav directive.
   */
  @Input({ alias: 'rbRouterNavPanel', required: true }) nav!: RouterNavDirective;
}

@Directive({
  selector: '[rbRouterNav]',
  exportAs: 'rbRouterNav',
  host: {
    '[attr.role]': `'tablist'`,
    '[class.nav]': 'true'
  },
  standalone: true
})
export class RouterNavDirective {
  @ContentChildren(RouterNavLinkDirective, { descendants: true }) navItems!: QueryList<RouterNavLinkDirective>;

  get selectedId() {
    return this.navItems?.find(item => item.nav === this && item.selected)?.id;
  }
}
