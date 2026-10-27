import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateDirective } from '@ngx-translate/core';
import { NavbarComponent } from './navbar/navbar.component';
import { ToastsComponent } from './rb-ngb/toasts/toasts.component';
import { AuthenticationService } from './shared/authentication.service';
import { ValidationDefaultsComponent } from './validation-defaults/validation-defaults.component';

@Component({
  selector: 'rb-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [TranslateDirective, NavbarComponent, ValidationDefaultsComponent, RouterOutlet, ToastsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor() {
    const authenticationService = inject(AuthenticationService);
    authenticationService.init();
  }

  scrollTo(id: string) {
    window.location.hash = id;
  }
}
