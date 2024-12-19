import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthenticationService } from '../../shared/authentication.service';
import { Permission } from '../../shared/user.model';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RouterNavDirective, RouterNavLinkDirective, RouterNavPanelDirective } from '../../rb-ngb/router-nav.directive';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'rb-orders-container',
  templateUrl: './orders-container.component.html',
  styleUrl: './orders-container.component.scss',
  imports: [
    TranslateModule,
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
