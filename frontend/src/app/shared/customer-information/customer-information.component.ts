import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Customer } from '../../basket/basket.model';
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
import { LanguageEnumPipe } from '../language-enum.pipe';
import { CustomerTypeEnumPipe } from '../customer-type-enum.pipe';

import { TranslateModule } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'rb-customer-information',
  templateUrl: './customer-information.component.html',
  styleUrl: './customer-information.component.scss',
  imports: [FaIconComponent, TranslateModule, CustomerTypeEnumPipe, LanguageEnumPipe],
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
