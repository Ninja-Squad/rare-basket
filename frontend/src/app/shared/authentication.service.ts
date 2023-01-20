import { Inject, Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { WINDOW } from './window.service';
import { HttpClient } from '@angular/common/http';
import { User } from './user.model';

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
    private router: Router,
    @Inject(WINDOW) private window: Window,
    private http: HttpClient
  ) {}

  /**
   * Initializes the authentication system based on OpenID/Connect.
   * This is called by the app module constructor and should never be called anywhere else
   */
  init() {
    // check if we're technically logged in already
    this.oidcSecurityService
      .checkAuth()
      .pipe(
        // if we are logged in, load the current user. Only after that will we be functionally logged in
        switchMap(response => (response.isAuthenticated ? this.loadCurrentUser() : of(null)))
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
    this.oidcSecurityService.logoff().subscribe();
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
