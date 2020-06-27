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

@Component({
  selector: 'rb-customer-information',
  templateUrl: './customer-information.component.html',
  styleUrls: ['./customer-information.component.scss']
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
