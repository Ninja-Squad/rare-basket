import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faAddressCard,
  faAt,
  faCommentDots,
  faFileInvoiceDollar,
  faHome,
  faMicrophone,
  faSitemap,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { TranslateDirective } from '@ngx-translate/core';
import { Customer } from '../../basket/basket.model';
import { CustomerTypeEnumPipe } from '../customer-type-enum.pipe';
import { LanguageEnumPipe } from '../language-enum.pipe';

@Component({
  selector: 'rb-customer-information',
  templateUrl: './customer-information.component.html',
  styleUrl: './customer-information.component.scss',
  imports: [FaIconComponent, TranslateDirective, CustomerTypeEnumPipe, LanguageEnumPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerInformationComponent {
  readonly customer = input.required<Customer>();
  readonly rationale = input.required<string | null>();
  readonly withLanguage = input(false);

  readonly nameIcon = faUser;
  readonly organizationIcon = faSitemap;
  readonly emailIcon = faAt;
  readonly deliveryAddressIcon = faHome;
  readonly billingAddressIcon = faFileInvoiceDollar;
  readonly customerTypeIcon = faAddressCard;
  readonly languageIcon = faMicrophone;
  readonly rationaleIcon = faCommentDots;
}
