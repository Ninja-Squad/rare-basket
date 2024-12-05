import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grc, GrcCommand } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class GrcService {
  private http = inject(HttpClient);

  /**
   * Lists the GRCs.
   * Note that this method does not return a page as there are a limited number of GRCs.
   */
  list(): Observable<Array<Grc>> {
    return this.http.get<Array<Grc>>('api/grcs');
  }

  get(grcId: number): Observable<Grc> {
    return this.http.get<Grc>(`api/grcs/${grcId}`);
  }

  create(command: GrcCommand): Observable<Grc> {
    return this.http.post<Grc>('api/grcs', command);
  }

  update(grcId: number, command: GrcCommand): Observable<void> {
    return this.http.put<void>(`api/grcs/${grcId}`, command);
  }

  delete(grcId: number): Observable<void> {
    return this.http.delete<void>(`api/grcs/${grcId}`);
  }
}
