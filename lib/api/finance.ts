import { apiClient } from './api';
import { 
  Transaction, 
  CreateTransactionDto, 
  BusinessEvent, 
  CreateBusinessEventDto,
  TransactionCategory,
  PaymentMethod 
} from '@/types/finance';

// Assuming API endpoints are prefixed with /v1
const PREFIX = '/v1';

export const financeApi = {
  // Transactions
  getTransactions: () => 
    apiClient<Transaction[]>(`${PREFIX}/transactions`, { method: 'GET' }),
  
  createTransaction: (data: CreateTransactionDto) => 
    apiClient<Transaction>(`${PREFIX}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Business Events
  getBusinessEvents: () => 
    apiClient<BusinessEvent[]>(`${PREFIX}/events`, { method: 'GET' }),
  
  createBusinessEvent: (data: CreateBusinessEventDto) => 
    apiClient<BusinessEvent>(`${PREFIX}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Categories
  getCategories: () => 
    apiClient<TransactionCategory[]>(`${PREFIX}/categories`, { method: 'GET' }), // Assuming the endpoint is /categories based on standard naming, or /transaction-categories

  // Payment Methods
  getPaymentMethods: () => 
    apiClient<PaymentMethod[]>(`${PREFIX}/payment-methods`, { method: 'GET' }),
};
