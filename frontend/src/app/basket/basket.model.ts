export const ALL_CUSTOMER_TYPES = [
  'INRAE_RESEARCHER',
  'FR_RESEARCHER',
  'FOREIGN_RESEARCHER',
  'FR_COMPANY',
  'FOREIGN_COMPANY',
  'FARMER',
  'NGO',
  'CITIZEN',
  'OTHER'
] as const;
export type CustomerType = typeof ALL_CUSTOMER_TYPES[number];

export interface Accession {
  name: string;
  identifier: string;
}

export interface Customer {
  name: string | null;
  email: string | null;
  address: string | null;
  type: CustomerType | null;
  language: Language | null;
}

export interface BasketItem {
  id: number;
  accession: Accession;
  quantity: number | null;
  unit: string | null;
}

export interface AccessionHolderBasket {
  grcName: string;
  accessionHolderName: string;
  items: Array<BasketItem>;
}

export type BasketStatus = 'DRAFT' | 'SAVED' | 'CONFIRMED';

export interface Basket {
  id: number;
  reference: string;
  status: BasketStatus;
  accessionHolderBaskets: Array<AccessionHolderBasket>;
  customer: Customer | null;
  rationale: string;
}

export type Language = 'en' | 'fr';

export interface CustomerCommand {
  name: string;
  email: string;
  address: string;
  type: CustomerType;
  language: Language;
}

export interface BasketItemCommand {
  accession: Accession;
  quantity: number | null;
  unit: string | null;
}

export interface BasketCommand {
  items: Array<BasketItemCommand>;
  customer: CustomerCommand;
  rationale: string;
  complete: boolean;
}
