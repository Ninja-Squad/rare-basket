import { Accession, Customer, CustomerCommand, CustomerType } from '../basket/basket.model';

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

export const ALL_DOCUMENT_TYPES = ['EMAIL', 'MTA', 'SMTA', 'SANITARY_PASSPORT', 'INVOICE', 'OTHER'] as const;
export type DocumentType = (typeof ALL_DOCUMENT_TYPES)[number];
export const ON_DELIVERY_FORM_BY_DEFAULT_DOCUMENT_TYPES: ReadonlyArray<DocumentType> = ['MTA', 'SMTA', 'SANITARY_PASSPORT', 'INVOICE'];

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
  onDeliveryForm: boolean;
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
    onDeliveryForm: boolean;
  };
  file: File;
}

export interface CustomerTypeStatistics {
  customerType: CustomerType;
  finalizedOrderCount: number;
}

export interface OrderStatusStatistics {
  orderStatus: OrderStatus;
  createdOrderCount: number;
}

export interface OrderStatistics {
  createdOrderCount: number;
  finalizedOrderCount: number;
  cancelledOrderCount: number;
  averageFinalizationDurationInDays: number;
  distinctFinalizedOrderCustomerCount: number;
  orderStatusStatistics: Array<OrderStatusStatistics>;
  customerTypeStatistics: Array<CustomerTypeStatistics>;
}

export interface CustomerInformationCommand {
  customer: CustomerCommand;
  rationale: string | null;
}
