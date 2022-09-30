import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { User } from './user.model';
import { map } from 'rxjs/operators';

/**
 * This is a "fake" authentication service used in the e2e tests,
 * to avoid messing around keycloack.
 * It always returns a logged in user (admi, with all permissions).
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  // Use a ReplaySubject and not a BehaviorSubject so that the authentication guard waits until the login is done
  // and the user is loaded before asking to login
  private currentUser = new ReplaySubject<User | null>(1);

  /**
   * Initializes the authentication system based on OpenID/Connect.
   * This is called by the app module constructor and should never be called anywhere else
   */
  init() {
    this.currentUser.next({
      id: 1,
      name: 'admin',
      permissions: ['ADMINISTRATION', 'ORDER_MANAGEMENT', 'ORDER_VISUALIZATION'],
      globalVisualization: true,
      visualizationGrcs: [],
      accessionHolder: {
        id: 1,
        name: 'CBGP',
        email: 'contact1@grc1.fr',
        grc: { id: 1, name: 'GRC1', address: '10 rue du Louvres 75000 Paris', institution: 'INRAE' },
        phone: ''
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  login(requestedUrl = '/') {}

  logout() {
    this.currentUser.next(null);
  }

  isAuthenticated(): Observable<boolean> {
    return this.getCurrentUser().pipe(map(u => !!u));
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser.asObservable();
  }
}
