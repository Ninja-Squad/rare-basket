import { Component } from '@angular/core';
import { AuthenticationService } from './shared/authentication.service';
import { ToastsComponent } from './rb-ngb/toasts/toasts.component';
import { RouterOutlet } from '@angular/router';
import { ValidationDefaultsComponent } from './validation-defaults/validation-defaults.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [TranslateModule, NavbarComponent, ValidationDefaultsComponent, RouterOutlet, ToastsComponent]
})
export class AppComponent {
  constructor(authenticationService: AuthenticationService) {
    authenticationService.init();
  }

  scrollTo(id: string) {
    window.location.hash = id;
  }
}
