import { Component, Input } from '@angular/core';
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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'rb-customer-information',
  templateUrl: './customer-information.component.html',
  styleUrl: './customer-information.component.scss',
  imports: [FontAwesomeModule, TranslateModule, CustomerTypeEnumPipe, LanguageEnumPipe]
})
export class CustomerInformationComponent {
  @Input({ required: true }) customer!: Customer;

  @Input({ required: true }) rationale: string | null = null;

  @Input() withLanguage = false;

  nameIcon = faUser;
  organizationIcon = faSitemap;
  emailIcon = faAt;
  deliveryAddressIcon = faHome;
  billingAddressIcon = faFileInvoiceDollar;
  customerTypeIcon = faAddressCard;
  languageIcon = faMicrophone;
  rationaleIcon = faCommentDots;
}
