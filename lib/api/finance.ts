import { axiosInstance } from './axios';
import { 
  Transaction, 
  CreateTransactionDto, 
  BusinessEvent, 
  CreateBusinessEventDto,
  TransactionCategory,
  PaymentMethod,
  CreateTransactionCategoryDto,
  CreatePaymentMethodDto
} from '@/types/finance';

const PREFIX = '/v1';

export const financeApi = {
  // Transactions
  getTransactions: async () => {
    const res = await axiosInstance.get<Transaction[]>(`${PREFIX}/transactions`);
    return res.data;
  },
  
  createTransaction: async (data: CreateTransactionDto) => {
    const res = await axiosInstance.post<Transaction>(`${PREFIX}/transactions`, data);
    return res.data;
  },

  // Business Events
  getBusinessEvents: async () => {
    const res = await axiosInstance.get<BusinessEvent[]>(`${PREFIX}/events`);
    return res.data;
  },
  
  createBusinessEvent: async (data: CreateBusinessEventDto) => {
    const res = await axiosInstance.post<BusinessEvent>(`${PREFIX}/events`, data);
    return res.data;
  },

  // Categories
  getCategories: async () => {
    const res = await axiosInstance.get<TransactionCategory[]>(`${PREFIX}/categories`);
    return res.data;
  },

  createCategory: async (data: CreateTransactionCategoryDto) => {
    const res = await axiosInstance.post<TransactionCategory>(`${PREFIX}/categories`, data);
    return res.data;
  },

  // Payment Methods
  getPaymentMethods: async () => {
    const res = await axiosInstance.get<PaymentMethod[]>(`${PREFIX}/payment-methods`);
    return res.data;
  },

  createPaymentMethod: async (data: CreatePaymentMethodDto) => {
    const res = await axiosInstance.post<PaymentMethod>(`${PREFIX}/payment-methods`, data);
    return res.data;
  },
};
