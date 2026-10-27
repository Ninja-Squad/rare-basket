import { ChangeDetectionStrategy, Component, signal, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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
import { NgbCollapse, NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { AuthenticationService } from '../shared/authentication.service';
import { Permission, User } from '../shared/user.model';

type ViewModel = { status: 'unknown' | 'absent' } | { status: 'present'; user: User };

@Component({
  selector: 'rb-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    RouterLink,
    FaIconComponent,
    TranslateDirective,
    TranslatePipe,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem,
    NgbCollapse
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private readonly authenticationService = inject(AuthenticationService);

  readonly collapsed = signal(true);
  readonly vm: Signal<ViewModel>;

  readonly ordersIcon = faShoppingBag;
  readonly administrationIcon = faShieldAlt;
  readonly usersIcon = faUsersCog;
  readonly userIcon = faUser;
  readonly grcIcon = faBuilding;
  readonly accessionHolderIcon = faStoreAlt;
  readonly loginIcon = faSignInAlt;
  readonly logoutIcon = faPowerOff;

  constructor() {
    this.vm = toSignal(
      this.authenticationService
        .getCurrentUser()
        .pipe(map((user): ViewModel => (user ? { status: 'present', user } : { status: 'absent' }))),
      {
        initialValue: { status: 'unknown' as const }
      }
    );
  }

  login() {
    this.authenticationService.login();
  }

  logout() {
    this.authenticationService.logout();
  }

  hasPermission(permission: Permission): boolean {
    const vm = this.vm();
    return vm.status === 'present' && vm.user.permissions.includes(permission);
  }
}
