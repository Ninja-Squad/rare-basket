import { Inject, Injectable } from '@angular/core';
import {
  AbstractSecurityStorage,
  AuthWellKnownEndpoints,
  LogLevel,
  OidcConfigService,
  OidcSecurityService,
  OpenIdConfiguration
} from 'angular-auth-oidc-client';
import { environment } from '../../environments/environment';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { WINDOW } from './window.service';
import { HttpClient } from '@angular/common/http';
import { User } from './user.model';
import { LocationStrategy } from '@angular/common';

const REQUESTED_URL_KEY = 'rare-basket-requested-url';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  // Use a ReplaySubject and not a BehaviorSubject so that the authentication guard waits until the login is done
  // and the user is loaded before asking to login
  private currentUser = new ReplaySubject<User | null>(1);

  constructor(
    private oidcSecurityService: OidcSecurityService,
    private oidcConfigService: OidcConfigService,
    private router: Router,
    @Inject(WINDOW) private window: Window,
    private http: HttpClient,
    private locationStrategy: LocationStrategy
  ) {}

  /**
   * Initializes the authentication system based on OpenID/Connect.
   * This is called by the app module constructor and should never be called anywhere else
   */
  init() {
    // create the configuration
    const keycloakUrl = environment.keycloakUrl;
    const url = this.window.origin + this.locationStrategy.getBaseHref();
    const config: OpenIdConfiguration = {
      stsServer: keycloakUrl,
      redirectUrl: url,
      clientId: 'rare-basket',
      responseType: 'code',
      scope: 'openid offline_access', // offline_access is required by the aidc library if silent renew is true
      postLogoutRedirectUri: url,
      startCheckSession: false,
      silentRenew: true,
      triggerAuthorizationResultEvent: true,
      logLevel: LogLevel.Warn,
      maxIdTokenIatOffsetAllowedInSeconds: 10,
      useRefreshToken: true,
      ignoreNonceAfterRefresh: true,
      autoUserinfo: false
    };

    const realmPath = environment.realmPath;
    const realmUrl = `${keycloakUrl}${realmPath}`;
    const authWellKnownEndpoints: AuthWellKnownEndpoints = {
      // these properties can be obtained from
      // http://localhost:8082/auth/realms/rare-basket/.well-known/openid-configuration
      // which is the URL of the link "OpenID Endpoint Configuration" in the "Realm Settings" page of the
      // Keycloak web console
      issuer: realmUrl,
      jwksUri: `${realmUrl}/protocol/openid-connect/certs`,
      authorizationEndpoint: `${realmUrl}/protocol/openid-connect/auth`,
      tokenEndpoint: `${realmUrl}/protocol/openid-connect/token`,
      userinfoEndpoint: `${realmUrl}/protocol/openid-connect/userinfo`,
      endSessionEndpoint: `${realmUrl}/protocol/openid-connect/logout`,
      checkSessionIframe: `${realmUrl}/protocol/openid-connect/login-status-iframe.html`,
      introspectionEndpoint: `${realmUrl}/protocol/openid-connect/token/introspect`
    };

    // initialize the library with the configuration
    this.oidcConfigService.withConfig(config, authWellKnownEndpoints);

    // check if we're technically logged in already
    this.oidcSecurityService
      .checkAuth()
      .pipe(
        // if we are logged in, load the current user. Only after that will we be functionally logged in
        switchMap(authenticated => (authenticated ? this.loadCurrentUser() : of(null)))
      )
      .subscribe({
        next: userOrNull => {
          // set the current user so that we're now functionally logged in (or not logged in if the user is null)
          // the authentication guard waits until the current user is set to decide what to do
          this.currentUser.next(userOrNull);
          if (userOrNull) {
            // if we're functionally logged in and a requested URL was requested,
            // navigate to the URL
            const requestedUrl = this.window.sessionStorage.getItem(REQUESTED_URL_KEY);
            if (requestedUrl) {
              this.router.navigateByUrl(requestedUrl, { replaceUrl: true });
            }
          }
          this.window.sessionStorage.removeItem(REQUESTED_URL_KEY);
        },
        error: () => {
          // in case we didn't manage to load the current user, we set it to null
          this.currentUser.next(null);
        }
      });
  }

  login(requestedUrl = '/') {
    this.oidcSecurityService.logoffLocal();
    this.window.sessionStorage.setItem(REQUESTED_URL_KEY, requestedUrl);
    this.oidcSecurityService.authorize();
  }

  logout() {
    this.currentUser.next(null);
    this.oidcSecurityService.logoff();
  }

  isAuthenticated(): Observable<boolean> {
    return this.getCurrentUser().pipe(map(u => !!u));
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  private loadCurrentUser(): Observable<User> {
    return this.http.get<User>('api/users/me');
  }
}

/**
 * We use local storage instead of the default local storage, otherwise we can't even open
 * a link in a new tab without losing authentication
 */
@Injectable()
export class CustomSecurityStorage extends AbstractSecurityStorage {
  read(key: string): any {
    const item = localStorage.getItem(key);
    if (!item) {
      return null;
    }

    return JSON.parse(item);
  }

  write(key: string, value: any): void {
    value = value || null;
    localStorage.setItem(key, JSON.stringify(value));
  }
}
