import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';
import { faPowerOff, faShoppingBag, faSignInAlt, faUser, faUsersCog } from '@fortawesome/free-solid-svg-icons';
import { Permission, User } from '../shared/user.model';

@Component({
  selector: 'rb-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  collapsed = true;
  user: User;

  ordersIcon = faShoppingBag;
  usersIcon = faUsersCog;
  userIcon = faUser;
  loginIcon = faSignInAlt;
  logoutIcon = faPowerOff;

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.authenticationService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
  }

  login() {
    this.authenticationService.login();
  }

  logout() {
    this.authenticationService.logout();
  }

  hasPermission(permission: Permission): boolean {
    return this.user && this.user.permissions.includes(permission);
  }
}
