import { provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app/app.component';
import { provideI18n } from './app/i18n/i18n';
import { APP_ROUTES } from './app/app.routes';
import { provideRouter, withViewTransitions } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { AuthenticationConfigService, authFactory, CustomSecurityStorage } from './app/shared/authentication-config.service';
import { AbstractSecurityStorage, StsConfigLoader, provideAuth } from 'angular-auth-oidc-client';
import { errorInterceptor } from './app/shared/error.interceptor';
import { authenticationInterceptor } from './app/shared/authentication.interceptor';
import { provideHttpClient, withInterceptors, withNoXsrfProtection } from '@angular/common/http';
import { provideNgbDatepickerServices } from './app/rb-ngb/datepicker-providers';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideBrowserGlobalErrorListeners(),
    provideAuth({
      loader: {
        provide: StsConfigLoader,
        useFactory: authFactory,
        deps: [AuthenticationConfigService]
      }
    }),
    { provide: AbstractSecurityStorage, useClass: CustomSecurityStorage },
    provideRouter(APP_ROUTES, withViewTransitions({ skipInitialTransition: true })),
    provideHttpClient(withInterceptors([authenticationInterceptor, errorInterceptor]), withNoXsrfProtection()),
    provideI18n(),
    provideNgbDatepickerServices()
  ]
})
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
