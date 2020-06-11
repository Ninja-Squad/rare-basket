import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ValdemortModule } from 'ngx-valdemort';
import { ValidationDefaultsComponent } from './validation-defaults/validation-defaults.component';
import { I18nModule } from './i18n/i18n.module';
import { AuthModule } from 'angular-auth-oidc-client';
import { AuthenticationService } from './shared/authentication.service';
import { AuthenticationInterceptorService } from './shared/authentication-interceptor.service';
import { NavbarComponent } from './navbar/navbar.component';
import { ErrorInterceptorService } from './shared/error-interceptor.service';
import { RbNgbModule } from './rb-ngb/rb-ngb.module';

@NgModule({
  declarations: [AppComponent, HomeComponent, ValidationDefaultsComponent, NavbarComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(APP_ROUTES),
    FontAwesomeModule,
    HttpClientModule,
    ValdemortModule,
    I18nModule,
    RbNgbModule,
    AuthModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptorService, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(authenticationService: AuthenticationService) {
    authenticationService.init();
  }
}
