import { Component, OnInit } from '@angular/core';
import { faShoppingBag, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { Permission, User } from '../shared/user.model';
import { AuthenticationService } from '../shared/authentication.service';

@Component({
  selector: 'rb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user: User;

  loginIcon = faSignInAlt;
  ordersIcon = faShoppingBag;

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.authenticationService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
  }

  login() {
    this.authenticationService.login();
  }

  hasPermission(permission: Permission): boolean {
    return this.user && this.user.permissions.includes(permission);
  }
}
