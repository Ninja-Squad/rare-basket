import { Component, OnInit } from '@angular/core';
import { BasketService } from '../basket.service';
import { Basket, BasketCommand } from '../basket.model';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'rb-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit {
  basket: Basket | null = null;

  constructor(private route: ActivatedRoute, private basketService: BasketService) {}

  ngOnInit() {
    this.basketService.get(this.route.snapshot.paramMap.get('reference')).subscribe(basket => (this.basket = basket));
  }

  save(command: BasketCommand) {
    this.basketService
      .save(this.basket.reference, command)
      .pipe(switchMap(() => this.basketService.get(this.basket.reference)))
      .subscribe(basket => (this.basket = basket));
  }

  confirm(confirmationCode: string) {
    this.basketService
      .confirm(this.basket.reference, confirmationCode)
      .pipe(switchMap(() => this.basketService.get(this.basket.reference)))
      .subscribe(basket => (this.basket = basket));
  }

  refresh() {
    this.basketService.get(this.basket.reference).subscribe(basket => (this.basket = basket));
  }
}
