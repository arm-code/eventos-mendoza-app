export interface TransactionCategory {
  id: string;
  name: string;
  description?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
}

export interface BusinessEvent {
  id: string;
  name: string;
  date?: string;
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
  date?: string;
}
