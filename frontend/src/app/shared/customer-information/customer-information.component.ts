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
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'rb-customer-information',
  templateUrl: './customer-information.component.html',
  styleUrls: ['./customer-information.component.scss'],
  standalone: true,
  imports: [FontAwesomeModule, TranslateModule, NgIf, CustomerTypeEnumPipe, LanguageEnumPipe]
})
export class CustomerInformationComponent {
  @Input()
  customer: Customer;

  @Input()
  rationale: string;

  @Input()
  withLanguage = false;

  nameIcon = faUser;
  organizationIcon = faSitemap;
  emailIcon = faAt;
  deliveryAddressIcon = faHome;
  billingAddressIcon = faFileInvoiceDollar;
  customerTypeIcon = faAddressCard;
  languageIcon = faMicrophone;
  rationaleIcon = faCommentDots;
}
