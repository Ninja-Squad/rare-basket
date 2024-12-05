import { Component, OnInit } from '@angular/core';
import { faShoppingBag, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { Permission, User } from '../shared/user.model';
import { AuthenticationService } from '../shared/authentication.service';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [TranslateModule, FaIconComponent, RouterLink]
})
export class HomeComponent implements OnInit {
  user: User | null | undefined = undefined;

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
    return !!this.user && this.user.permissions.includes(permission);
  }
}
