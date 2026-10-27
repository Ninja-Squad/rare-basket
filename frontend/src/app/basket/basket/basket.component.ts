import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslateDirective } from '@ngx-translate/core';
import { startWith, Subject, switchMap } from 'rxjs';
import { Basket, BasketCommand } from '../basket.model';
import { BasketService } from '../basket.service';
import { ConfirmedComponent } from '../confirmed/confirmed.component';
import { EditBasketComponent } from '../edit-basket/edit-basket.component';
import { EditConfirmationComponent } from '../edit-confirmation/edit-confirmation.component';

@Component({
  selector: 'rb-basket',
  templateUrl: './basket.component.html',
  styleUrl: './basket.component.scss',
  imports: [TranslateDirective, EditBasketComponent, EditConfirmationComponent, ConfirmedComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasketComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly basketService = inject(BasketService);

  private readonly refreshSubject = new Subject<void>();
  readonly basket: Signal<Basket | undefined>;

  constructor() {
    const reference = this.route.snapshot.paramMap.get('reference')!;
    this.basket = toSignal(
      this.refreshSubject.pipe(
        startWith(undefined),
        switchMap(() => this.basketService.get(reference))
      )
    );
  }

  save(command: BasketCommand) {
    const basket = this.basket()!;
    this.basketService.save(basket.reference, command).subscribe(() => this.refresh());
  }

  confirm(confirmationCode: string) {
    const basket = this.basket()!;
    this.basketService.confirm(basket.reference, confirmationCode).subscribe(() => this.refresh());
  }

  refresh() {
    this.refreshSubject.next();
  }
}
