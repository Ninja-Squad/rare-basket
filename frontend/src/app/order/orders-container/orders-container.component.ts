import { Component } from '@angular/core';
import { AuthenticationService } from '../../shared/authentication.service';
import { Permission } from '../../shared/user.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'rb-orders-container',
  templateUrl: './orders-container.component.html',
  styleUrls: ['./orders-container.component.scss']
})
export class OrdersContainerComponent {
  constructor(private authenticationService: AuthenticationService) {}

  hasPermission(permission: Permission): Observable<boolean> {
    return this.authenticationService.getCurrentUser().pipe(map(user => user && user.permissions.includes(permission)));
  }
}
