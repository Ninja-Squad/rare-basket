import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grc } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class GrcService {
  constructor(private http: HttpClient) {}

  /**
   * Lists the GRCs.
   * Note that this method does not return a page as there are a limited number of GRCs.
   */
  list(): Observable<Array<Grc>> {
    return this.http.get<Array<Grc>>('/api/grcs');
  }
}
