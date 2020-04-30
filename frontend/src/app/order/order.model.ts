import { Accession, Customer } from '../basket/basket.model';

export interface OrderItem {
  id: number;
  accession: Accession;
  quantity: number | null;
  unit: string | null;
}

export type OrderStatus = 'DRAFT' | 'FINALIZED' | 'CANCELLED';

export interface BasketInformation {
  reference: string;
  customer: Customer;
  rationale: string;
  confirmationInstant: string;
}

export const ALL_DOCUMENT_TYPES = ['EMAIL', 'MTA', 'SANITARY_PASSPORT', 'INVOICE', 'OTHER'] as const;
export type DocumentType = typeof ALL_DOCUMENT_TYPES[number];

export function isDocumentTypeUnique(documentType: DocumentType): boolean {
  return documentType === 'INVOICE';
}

export interface Document {
  id: number;
  type: DocumentType;
  description: string | null;
  creationInstant: string;
  originalFileName: string;
  contentType: string;
}

export interface Order {
  id: number;
  basket: BasketInformation;
  status: OrderStatus;
  items: Array<OrderItem>;
}

export interface DetailedOrder extends Order {
  documents: Array<Document>;
}

export interface OrderCommand {
  items: Array<OrderItemCommand>;
}

export interface OrderItemCommand {
  accession: Accession;
  quantity: number | null;
  unit: string | null;
}

export interface DocumentCommand {
  document: {
    type: DocumentType;
    description: string;
  };
  file: File;
}
