import { provideHttpClient, withInterceptors, withNoXsrfProtection, withXhr } from '@angular/common/http';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { AbstractSecurityStorage, provideAuth, StsConfigLoader } from 'angular-auth-oidc-client';
import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';
import { provideI18n } from './app/i18n/i18n';
import { provideNgbDatepickerServices } from './app/rb-ngb/datepicker-providers';
import { AuthenticationConfigService, authFactory, CustomSecurityStorage } from './app/shared/authentication-config.service';
import { authenticationInterceptor } from './app/shared/authentication.interceptor';
import { errorInterceptor } from './app/shared/error.interceptor';
import { provideRbSignalFormsConfig } from './app/signal-forms';

bootstrapApplication(AppComponent, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAuth({
      loader: {
        provide: StsConfigLoader,
        useFactory: authFactory,
        deps: [AuthenticationConfigService]
      }
    }),
    { provide: AbstractSecurityStorage, useClass: CustomSecurityStorage },
    provideRouter(APP_ROUTES, withViewTransitions({ skipInitialTransition: true }), withComponentInputBinding()),
    // Fetch does not support upload progress; XHR is needed for the document upload progress bar.
    provideHttpClient(withInterceptors([authenticationInterceptor, errorInterceptor]), withNoXsrfProtection(), withXhr()),
    provideI18n(),
    provideNgbDatepickerServices(),
    provideRbSignalFormsConfig()
  ]
})
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));
