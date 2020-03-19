import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Basket, BasketCommand } from './basket.model';

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
}
