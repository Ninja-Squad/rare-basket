import { Component, OnInit } from '@angular/core';
import { faShoppingBag, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { Permission, User } from '../shared/user.model';
import { AuthenticationService } from '../shared/authentication.service';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  imports: [TranslateModule, NgIf, FontAwesomeModule, RouterLink]
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
