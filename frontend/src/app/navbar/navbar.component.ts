import { Component, OnInit } from '@angular/core';
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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'rb-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [NgIf, RouterLink, FontAwesomeModule, TranslateModule, NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownItem]
})
export class NavbarComponent implements OnInit {
  collapsed = true;
  user: User;

  ordersIcon = faShoppingBag;
  administrationIcon = faShieldAlt;
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
