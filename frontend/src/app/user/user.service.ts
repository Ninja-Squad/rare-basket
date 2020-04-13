import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../shared/user.model';
import { Page } from '../shared/page.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  list(page: number): Observable<Page<User>> {
    return this.http.get<Page<User>>('/api/users', { params: { page: `${page}` } });
  }
}
