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

export interface BusinessEvent {
  id: string;
  name: string;
  date?: string;
  eventDate?: string;
  clientName?: string;
  notes?: string;
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
  eventDate?: string;
  notes?: string;
}

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
