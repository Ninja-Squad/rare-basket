import { inject, Injectable } from '@angular/core';
import {
  AbstractSecurityStorage,
  AuthWellKnownEndpoints,
  LogLevel,
  OpenIdConfiguration,
  StsConfigStaticLoader
} from 'angular-auth-oidc-client';
import { WINDOW } from './window.service';
import { LocationStrategy } from '@angular/common';
import { environment } from '../../environments/environment';

const CONFIG_ID = 'rare-basket-auth';

/**
 * We use local storage instead of the default local storage, otherwise we can't even open
 * a link in a new tab without losing authentication
 */
@Injectable()
export class CustomSecurityStorage extends AbstractSecurityStorage {
  constructor() {
    super();
  }

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

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear() {
    // apparently, only read and write are actually used, and always with the same key: the config ID
    // to be safe, let's at least removed that key
    localStorage.removeItem(CONFIG_ID);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationConfigService {
  private window = inject(WINDOW);
  private locationStrategy = inject(LocationStrategy);

  getConfig(): OpenIdConfiguration {
    // create the configuration
    const keycloakUrl = environment.keycloakUrl;
    const url = this.window.origin + this.locationStrategy.getBaseHref();

    const realmPath = environment.realmPath;
    const realmUrl = `${keycloakUrl}${realmPath}`;
    const authWellknownEndpoints: AuthWellKnownEndpoints = {
      // these properties can be obtained from
      // http://localhost:8082/auth/realms/rare-basket/.well-known/openid-configuration
      // which is the URL of the link "OpenID Endpoint Configuration" in the "Realm Settings" page of the
      // Keycloak web console
      issuer: realmUrl,
      jwksUri: `${realmUrl}/protocol/openid-connect/certs`,
      authorizationEndpoint: `${realmUrl}/protocol/openid-connect/auth`,
      tokenEndpoint: `${realmUrl}/protocol/openid-connect/token`,
      userInfoEndpoint: `${realmUrl}/protocol/openid-connect/userinfo`,
      endSessionEndpoint: `${realmUrl}/protocol/openid-connect/logout`,
      checkSessionIframe: `${realmUrl}/protocol/openid-connect/login-status-iframe.html`,
      introspectionEndpoint: `${realmUrl}/protocol/openid-connect/token/introspect`
    };

    return {
      configId: CONFIG_ID,
      authority: realmUrl,
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
      autoUserInfo: false,
      authWellknownEndpoints
    };
  }
}

export const authFactory = (authenticationConfigService: AuthenticationConfigService) => {
  const config = authenticationConfigService.getConfig();
  return new StsConfigStaticLoader(config);
};
