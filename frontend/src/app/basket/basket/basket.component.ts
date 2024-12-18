import { Component, inject } from '@angular/core';
import { BasketService } from '../basket.service';
import { Basket, BasketCommand } from '../basket.model';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ConfirmedComponent } from '../confirmed/confirmed.component';
import { EditConfirmationComponent } from '../edit-confirmation/edit-confirmation.component';
import { EditBasketComponent } from '../edit-basket/edit-basket.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'rb-basket',
  templateUrl: './basket.component.html',
  styleUrl: './basket.component.scss',
  imports: [TranslateModule, EditBasketComponent, EditConfirmationComponent, ConfirmedComponent]
})
export class BasketComponent {
  private route = inject(ActivatedRoute);
  private basketService = inject(BasketService);

  basket: Basket | null = null;

  constructor() {
    this.basketService.get(this.route.snapshot.paramMap.get('reference')!).subscribe(basket => (this.basket = basket));
  }

  save(command: BasketCommand) {
    this.basketService
      .save(this.basket!.reference, command)
      .pipe(switchMap(() => this.basketService.get(this.basket!.reference)))
      .subscribe(basket => (this.basket = basket));
  }

  confirm(confirmationCode: string) {
    this.basketService
      .confirm(this.basket!.reference, confirmationCode)
      .pipe(switchMap(() => this.basketService.get(this.basket!.reference)))
      .subscribe(basket => (this.basket = basket));
  }

  refresh() {
    this.basketService.get(this.basket!.reference).subscribe(basket => (this.basket = basket));
  }
}
