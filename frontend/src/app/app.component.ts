import { Component } from '@angular/core';
import { AuthenticationService } from './shared/authentication.service';

@Component({
  selector: 'rb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(authenticationService: AuthenticationService) {
    authenticationService.init();
  }

  scrollTo(id: string) {
    window.location.hash = id;
  }
}
