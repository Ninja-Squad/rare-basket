import { Inject, Injectable } from '@angular/core';
import { AuthorizationState, AuthWellKnownEndpoints, OidcSecurityService, OpenIdConfiguration } from 'angular-auth-oidc-client';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, first, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { WINDOW } from './window.service';

export interface AuthenticatedUserData {
  preferred_username: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private oidcSecurityService: OidcSecurityService, private router: Router, @Inject(WINDOW) private window: Window) {}

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
      // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
      max_id_token_iat_offset_allowed_in_seconds: 10,
      // otherwise we can't even open a link in a new tab without losing the session
      storage: localStorage,
      use_refresh_token: true,
      ignore_nonce_after_refresh: true,
      isauthorizedrace_timeout_in_seconds: 2
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

    this.oidcSecurityService.onAuthorizationResult.pipe(filter(result => !result.isRenewProcess)).subscribe(result => {
      if (result.authorizationState === AuthorizationState.authorized) {
        const requestedUrl = this.window.sessionStorage.getItem('rare-basket-requested-url') || '/';
        this.router.navigateByUrl(requestedUrl);
      } else {
        // don't really know what to do here: I don't see how it can happen
      }
    });

    this.oidcSecurityService.setupModule(config, authWellKnownEndpoints);

    this.oidcSecurityService.authorizedCallbackWithCode(this.window.location.toString());
  }

  login(requestedUrl = '/') {
    this.window.sessionStorage.setItem('rare-basket-requested-url', requestedUrl);
    this.oidcSecurityService.authorize();
  }

  logout() {
    this.oidcSecurityService.logoff();
  }

  isAuthenticated(): Observable<boolean> {
    return this.oidcSecurityService.getIsAuthorized().pipe(distinctUntilChanged());
  }

  getUserData(): Observable<AuthenticatedUserData | null> {
    return this.isAuthenticated().pipe(
      switchMap(authenticated => (authenticated ? this.oidcSecurityService.getUserData().pipe(first()) : of(null))),
      map(data => data || null)
    );
  }
}
