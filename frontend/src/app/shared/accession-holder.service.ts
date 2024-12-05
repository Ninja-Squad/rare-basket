import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccessionHolder, AccessionHolderCommand } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class AccessionHolderService {
  private http = inject(HttpClient);

  /**
   * Lists the accession holders.
   * Note that this method does not return a page as there are a limited number of accession holders.
   */
  list(): Observable<Array<AccessionHolder>> {
    return this.http.get<Array<AccessionHolder>>('api/accession-holders');
  }

  get(accessionHolderId: number): Observable<AccessionHolder> {
    return this.http.get<AccessionHolder>(`api/accession-holders/${accessionHolderId}`);
  }

  create(command: AccessionHolderCommand): Observable<AccessionHolder> {
    return this.http.post<AccessionHolder>('api/accession-holders', command);
  }

  update(accessionHolderId: number, command: AccessionHolderCommand): Observable<void> {
    return this.http.put<void>(`api/accession-holders/${accessionHolderId}`, command);
  }

  delete(accessionHolderId: number): Observable<void> {
    return this.http.delete<void>(`api/accession-holders/${accessionHolderId}`);
  }
}
