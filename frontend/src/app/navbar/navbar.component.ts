import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../shared/authentication.service';
import { faPowerOff, faSignInAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { User } from '../shared/user.model';

@Component({
  selector: 'rb-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  collapsed = true;
  user: User;

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

  get showOrders() {
    return this.user && this.user.permissions.includes('ORDER_MANAGEMENT');
  }
}
