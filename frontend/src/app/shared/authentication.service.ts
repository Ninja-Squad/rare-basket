import { Inject, Injectable } from '@angular/core';
import { AuthorizationState, AuthWellKnownEndpoints, OidcSecurityService, OpenIdConfiguration } from 'angular-auth-oidc-client';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { WINDOW } from './window.service';
import { HttpClient } from '@angular/common/http';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor(
    private oidcSecurityService: OidcSecurityService,
    private router: Router,
    @Inject(WINDOW) private window: Window,
    private http: HttpClient
  ) {}

  /**
   * Initializes the authentication system based on OpenID/Connect.
   * This is called by the app module constructor and should never be called anywhere else
   */
  init() {
    const keycloakUrl = environment.keycloakUrl;
    const url = this.window.origin;
    const config: OpenIdConfiguration = {
      stsServer: keycloakUrl,
      redirect_url: url,
      client_id: 'rare-basket',
      response_type: 'code',
      scope: 'openid',
      post_logout_redirect_uri: url,
      start_checksession: false,
      silent_renew: true,
      trigger_authorization_result_event: true,
      log_console_warning_active: true,
      log_console_debug_active: false,
      // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
      // limiting the amount of time that nonces need to be stored to prevent attacks. The acceptable range is Client specific.
      max_id_token_iat_offset_allowed_in_seconds: 10,
      // otherwise we can't even open a link in a new tab without losing the session
      storage: localStorage,
      use_refresh_token: true,
      ignore_nonce_after_refresh: true,
      isauthorizedrace_timeout_in_seconds: 2,
      auto_userinfo: false
    };

    const realmUrl = `${keycloakUrl}/auth/realms/rare-basket`;
    const authWellKnownEndpoints: AuthWellKnownEndpoints = {
      // these properties can be obtained from
      // http://localhost:8082/auth/realms/rare-basket/.well-known/openid-configuration
      // which is the URL of the link "OpenID Endpoint Configuration" in the "Realm Settings" page of the
      // Keycloak web console
      issuer: realmUrl,
      jwks_uri: `${realmUrl}/protocol/openid-connect/certs`,
      authorization_endpoint: `${realmUrl}/protocol/openid-connect/auth`,
      token_endpoint: `${realmUrl}/protocol/openid-connect/token`,
      userinfo_endpoint: `${realmUrl}/protocol/openid-connect/userinfo`,
      end_session_endpoint: `${realmUrl}/protocol/openid-connect/logout`,
      check_session_iframe: `${realmUrl}/protocol/openid-connect/login-status-iframe.html`,
      introspection_endpoint: `${realmUrl}/protocol/openid-connect/token/introspect`
    };

    this.oidcSecurityService.onAuthorizationResult
      .pipe(
        // when oidc says that we're authenticated, and doesn't say so after a renew process...
        filter(result => !result.isRenewProcess && result.authorizationState === AuthorizationState.authorized),
        // we first wait until we are **really** authenticated, i.e. the user data have been loaded
        switchMap(() => this.isAuthenticated().pipe(filter(authenticated => authenticated)))
      )
      .subscribe(() => {
        // then we redirect to the requested URL.
        // if we don't wait for the user data to be loaded, then the guard invoked at the redirected URL
        // thinks we're not authenticated yet, and tries to login again, leading to an infinite loop
        const requestedUrl = this.window.sessionStorage.getItem('rare-basket-requested-url') || '/';
        this.router.navigateByUrl(requestedUrl);
      });

    this.oidcSecurityService.setupModule(config, authWellKnownEndpoints);

    this.oidcSecurityService.authorizedCallbackWithCode(this.window.location.toString());

    this.getIsAuthenticated()
      .pipe(switchMap(authenticated => (authenticated ? this.loadCurrentUser() : of(null))))
      .subscribe(user => this.currentUser.next(user));
  }

  login(requestedUrl = '/') {
    this.window.sessionStorage.setItem('rare-basket-requested-url', requestedUrl);
    this.oidcSecurityService.authorize();
  }

  logout() {
    this.oidcSecurityService.logoff();
  }

  isAuthenticated(): Observable<boolean> {
    return this.getCurrentUser().pipe(map(u => !!u));
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  private getIsAuthenticated(): Observable<boolean> {
    return this.oidcSecurityService.getIsAuthorized().pipe(distinctUntilChanged());
  }

  private loadCurrentUser(): Observable<User> {
    return this.http.get<User>('/api/users/me');
  }
}
