import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BasketService } from '../basket.service';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
  standalone: true,
  imports: [FontAwesomeModule, TranslateModule, RouterLink]
})
export class BasketConfirmationComponent implements OnInit {
  basketReference: string | null = null;
  errorIcon = faExclamationCircle;
  confirmationFailed = false;

  constructor(
    private route: ActivatedRoute,
    private basketService: BasketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.basketReference = this.route.snapshot.paramMap.get('reference')!;
    const confirmationCode = this.route.snapshot.queryParamMap.get('code')!;
    this.basketService.confirm(this.basketReference, confirmationCode).subscribe({
      next: () => this.router.navigate(['/baskets', this.basketReference]),
      error: () => (this.confirmationFailed = true)
    });
  }
}
