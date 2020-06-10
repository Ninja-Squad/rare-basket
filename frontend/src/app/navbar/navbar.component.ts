import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';
import { faBuilding, faPowerOff, faShoppingBag, faSignInAlt, faStoreAlt, faUser, faUsersCog } from '@fortawesome/free-solid-svg-icons';
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
  grcIcon = faBuilding;
  accessionHolderIcon = faStoreAlt;
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
