import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BasketService } from '../basket.service';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/**
 * Component that is used only when the customer clicks on the confirmation link in the
 * confirmation email he/she received.
 * It sends the confirmation code found in its query parameters to the backend, and if the
 * confirmation succeeded, then it redirects to the basket component.
 * Otherwise, it displays an error message.
 */
@Component({
  selector: 'rb-basket-confirmation',
  templateUrl: './basket-confirmation.component.html',
  styleUrl: './basket-confirmation.component.scss',
  imports: [FaIconComponent, TranslateModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasketConfirmationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly basketService = inject(BasketService);
  private readonly router = inject(Router);

  readonly basketReference = signal<string | null>(null);
  readonly errorIcon = faExclamationCircle;
  readonly confirmationFailed = signal(false);

  constructor() {
    this.basketReference.set(this.route.snapshot.paramMap.get('reference')!);
    const confirmationCode = this.route.snapshot.queryParamMap.get('code')!;
    this.basketService.confirm(this.basketReference()!, confirmationCode).subscribe({
      next: () => this.router.navigate(['/baskets', this.basketReference()]),
      error: () => this.confirmationFailed.set(true)
    });
  }
}
