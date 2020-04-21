import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccessionHolder } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class AccessionHolderService {
  constructor(private http: HttpClient) {}

  /**
   * Lists the accession holders.
   * Note that this method does not return a page as there are a limited number of accession holders.
   */
  list(): Observable<Array<AccessionHolder>> {
    return this.http.get<Array<AccessionHolder>>('/api/accession-holders');
  }

  delete(accessionHolderId: number): Observable<void> {
    return this.http.delete<void>(`/api/accession-holders/${accessionHolderId}`);
  }
}
