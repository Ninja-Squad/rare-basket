import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { faShoppingBag, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { Permission, User } from '../shared/user.model';
import { AuthenticationService } from '../shared/authentication.service';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

type ViewModel = { status: 'unknown' | 'absent' } | { status: 'present'; user: User };

@Component({
  selector: 'rb-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [TranslateModule, FaIconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  private readonly authenticationService = inject(AuthenticationService);
  readonly vm = toSignal(
    this.authenticationService.getCurrentUser().pipe(map((user): ViewModel => (user ? { status: 'present', user } : { status: 'absent' }))),
    { initialValue: { status: 'unknown' as const } }
  );

  readonly loginIcon = faSignInAlt;
  readonly ordersIcon = faShoppingBag;

  login() {
    this.authenticationService.login();
  }

  hasPermission(permission: Permission): boolean {
    const vm = this.vm();
    return vm.status === 'present' && vm.user.permissions.includes(permission);
  }
}
