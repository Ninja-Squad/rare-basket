import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccessionHolder, User, UserCommand } from '../shared/user.model';
import { Page } from '../shared/page.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  list(page: number): Observable<Page<User>> {
    return this.http.get<Page<User>>('/api/users', { params: { page: `${page}` } });
  }

  listAccessionHolders(): Observable<Array<AccessionHolder>> {
    return this.http.get<Array<AccessionHolder>>('/api/accession-holders');
  }

  get(userId: number): Observable<User> {
    return this.http.get<User>(`/api/users/${userId}`);
  }

  create(command: UserCommand): Observable<User> {
    return this.http.post<User>('/api/users', command);
  }

  update(userId: number, command: UserCommand): Observable<void> {
    return this.http.put<void>(`/api/users/${userId}`, command);
  }
}
