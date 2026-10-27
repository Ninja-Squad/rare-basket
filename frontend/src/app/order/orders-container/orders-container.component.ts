import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateDirective } from '@ngx-translate/core';
import { RouterNavDirective, RouterNavLinkDirective, RouterNavPanelDirective } from '../../rb-ngb/router-nav.directive';
import { AuthenticationService } from '../../shared/authentication.service';
import { Permission } from '../../shared/user.model';

@Component({
  selector: 'rb-orders-container',
  templateUrl: './orders-container.component.html',
  styleUrl: './orders-container.component.scss',
  imports: [
    TranslateDirective,
    RouterNavDirective,
    RouterLink,
    RouterLinkActive,
    RouterNavLinkDirective,
    RouterNavPanelDirective,
    RouterOutlet
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersContainerComponent {
  private readonly user = toSignal(inject(AuthenticationService).getCurrentUser());

  hasPermission(permission: Permission): boolean {
    const user = this.user();
    return !!user && user.permissions.includes(permission);
  }
}
