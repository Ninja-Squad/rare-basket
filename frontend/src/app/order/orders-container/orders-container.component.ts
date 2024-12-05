import { Component } from '@angular/core';
import { AuthenticationService } from '../../shared/authentication.service';
import { Permission } from '../../shared/user.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { RouterNavDirective, RouterNavLinkDirective, RouterNavPanelDirective } from '../../rb-ngb/router-nav.directive';
import { TranslateModule } from '@ngx-translate/core';

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
    RouterOutlet,
    AsyncPipe
  ]
})
export class OrdersContainerComponent {
  constructor(private authenticationService: AuthenticationService) {}

  hasPermission(permission: Permission): Observable<boolean> {
    return this.authenticationService.getCurrentUser().pipe(map(user => !!user && user.permissions.includes(permission)));
  }
}
