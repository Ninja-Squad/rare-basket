import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Basket, BasketCommand } from './basket.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  constructor(private http: HttpClient) {}

  get(reference: string): Observable<Basket> {
    return this.http.get<Basket>(`/api/baskets/${reference}`);
  }

  save(reference: string, command: BasketCommand): Observable<void> {
    return this.http.put<void>(`/api/baskets/${reference}`, command);
  }

  /**
   * Confirms the basket, and if an error is received informing that the order was already confirmed,
   * then ignore it and do as if the confirmation succeeded
   */
  confirm(reference: string, confirmationCode: string): Observable<void> {
    const command = { confirmationCode };
    return this.http.put<void>(`/api/baskets/${reference}/confirmation`, command).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 && error.error?.functionalError === 'BASKET_ALREADY_CONFIRMED') {
          return of(undefined);
        }
        return throwError(error);
      })
    );
  }
}
