export const ALL_CUSTOMER_TYPES = ['FARMER', 'BIOLOGIST'] as const;
export type CustomerType = typeof ALL_CUSTOMER_TYPES[number];

export interface Customer {
  name: string | null;
  email: string | null;
  address: string | null;
  type: CustomerType | null;
}

export interface BasketItem {
  id: number;
  accession: string;
  quantity: number | null;
}

export type BasketStatus = 'DRAFT' | 'SAVED' | 'CONFIRMED';

export interface Basket {
  id: number;
  reference: string;
  status: BasketStatus;
  items: Array<BasketItem>;
  customer: Customer | null;
  rationale: string;
}

export interface CustomerCommand {
  name: string;
  email: string;
  address: string;
  type: CustomerType;
}

export interface BasketItemCommand {
  accession: string;
  quantity: number;
}

export interface BasketCommand {
  items: Array<BasketItemCommand>;
  customer: CustomerCommand;
  rationale: string;
  complete: boolean;
}
