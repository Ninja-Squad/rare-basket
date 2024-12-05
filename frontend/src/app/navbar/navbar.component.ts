import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';
import {
  faBuilding,
  faPowerOff,
  faShieldAlt,
  faShoppingBag,
  faSignInAlt,
  faStoreAlt,
  faUser,
  faUsersCog
} from '@fortawesome/free-solid-svg-icons';
import { Permission, User } from '../shared/user.model';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';

import { NgbCollapse, NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
import { map, Observable, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';

type ViewModel = { status: 'unknown' | 'absent' } | { status: 'present'; user: User };

@Component({
  selector: 'rb-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    RouterLink,
    FaIconComponent,
    TranslateModule,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem,
    AsyncPipe,
    NgbCollapse
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  collapsed = signal(true);
  vm$: Observable<ViewModel>;

  ordersIcon = faShoppingBag;
  administrationIcon = faShieldAlt;
  usersIcon = faUsersCog;
  userIcon = faUser;
  grcIcon = faBuilding;
  accessionHolderIcon = faStoreAlt;
  loginIcon = faSignInAlt;
  logoutIcon = faPowerOff;

  constructor(private authenticationService: AuthenticationService) {
    this.vm$ = this.authenticationService.getCurrentUser().pipe(
      map((user): ViewModel => (user ? { status: 'present', user } : { status: 'absent' })),
      startWith({ status: 'unknown' as const })
    );
  }

  login() {
    this.authenticationService.login();
  }

  logout() {
    this.authenticationService.logout();
  }

  hasPermission(vm: ViewModel, permission: Permission): boolean {
    return vm.status === 'present' && vm.user.permissions.includes(permission);
  }
}
