import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserCommand } from '../shared/user.model';
import { Page } from '../shared/page.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  list(page: number): Observable<Page<User>> {
    return this.http.get<Page<User>>('api/users', { params: { page: `${page}` } });
  }

  get(userId: number): Observable<User> {
    return this.http.get<User>(`api/users/${userId}`);
  }

  create(command: UserCommand): Observable<User> {
    return this.http.post<User>('api/users', command);
  }

  update(userId: number, command: UserCommand): Observable<void> {
    return this.http.put<void>(`api/users/${userId}`, command);
  }

  delete(userId: number): Observable<void> {
    return this.http.delete<void>(`api/users/${userId}`);
  }
}
