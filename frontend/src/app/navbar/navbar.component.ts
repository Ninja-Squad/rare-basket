import { Component, OnInit } from '@angular/core';
import { AuthenticatedUserData, AuthenticationService } from '../shared/authentication.service';
import { faPowerOff, faSignInAlt, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'rb-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  collapsed = true;
  user: AuthenticatedUserData;

  userIcon = faUser;
  loginIcon = faSignInAlt;
  logoutIcon = faPowerOff;

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.authenticationService.getUserData().subscribe(userData => {
      this.user = userData;
    });
  }

  login() {
    this.authenticationService.login();
  }

  logout() {
    this.authenticationService.logout();
  }
}
