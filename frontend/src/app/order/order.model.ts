import { Customer } from '../basket/basket.model';

export interface OrderItem {
  id: number;
  accession: string;
  quantity: number;
}

export type OrderStatus = 'DRAFT' | 'FINALIZED' | 'CANCELLED';

export interface BasketInformation {
  reference: string;
  customer: Customer;
  rationale: string;
  confirmationInstant: string;
}

export interface Order {
  id: number;
  basket: BasketInformation;
  status: OrderStatus;
  items: Array<OrderItem>;
}
