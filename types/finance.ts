export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TransactionCategory {
  id: string;
  code?: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface PaymentMethod {
  id: string;
  code?: string;
  name: string;
  isActive?: boolean;
}

export type EventStatus = 'pending' | 'delivered' | 'collected' | 'cancelled';

export interface BusinessEvent {
  id: string;
  folio?: string;
  name: string;
  serviceDescription?: string;
  date?: string;
  eventDate?: string;
  clientName?: string;
  clientPhone?: string;
  eventAddress?: string;
  cost?: number;
  status?: EventStatus;
  guaranteeDocument?: string;
  noteId?: string | null;
  noteFolio?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  type: 'INPUT' | 'OUTPUT';
  amount: number | string;
  description?: string;
  category?: TransactionCategory;
  categoryId?: string;
  transactionDate: string;
  paymentMethod?: PaymentMethod;
  paymentMethodId?: string;
  eventId?: string;
}

export interface CreateTransactionDto {
  type: 'INPUT' | 'OUTPUT';
  amount: number;
  description?: string;
  categoryId?: string;
  transactionDate: string;
  paymentMethodId?: string;
  eventId?: string;
}

export interface CreateBusinessEventDto {
  name: string;
  clientName?: string;
  clientPhone?: string;
  eventAddress?: string;
  eventDate?: string;
  cost?: number;
  status?: EventStatus;
  guaranteeDocument?: string;
  noteId?: string;
  notes?: string;
}

export interface UpdateBusinessEventDto extends Partial<CreateBusinessEventDto> {}

export interface CreateTransactionCategoryDto {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CreatePaymentMethodDto {
  code: string;
  name: string;
  isActive?: boolean;
}

export type SalesNoteStatus = 'quote' | 'note' | 'issued';

export interface SalesNoteItem {
  id?: string;
  concept: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

export interface SalesNote {
  id: string;
  folio: string;
  status: SalesNoteStatus;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerEmail?: string;
  customer?: { name: string; phone?: string; address?: string; email?: string };
  applyIva: boolean;
  ivaRate: number;
  subtotal: number;
  ivaAmount?: number;
  total: number;
  eventId?: string | null;
  notes?: string;
  items: SalesNoteItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSalesNoteItemDto {
  concept: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesNoteDto {
  status?: SalesNoteStatus;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerEmail?: string;
  applyIva?: boolean;
  ivaRate?: number;
  eventId?: string;
  notes?: string;
  items: CreateSalesNoteItemDto[];
}

export interface UpdateSalesNoteDto extends Partial<CreateSalesNoteDto> {}
