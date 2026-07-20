import { axiosInstance } from './axios';
import {
  Transaction,
  CreateTransactionDto,
  BusinessEvent,
  CreateBusinessEventDto,
  TransactionCategory,
  PaymentMethod,
  CreateTransactionCategoryDto,
  CreatePaymentMethodDto,
  PaginatedResponse
} from '@/types/finance';

const PREFIX = '/v1';

export const financeApi = {
  // Transactions
  getTransactions: async (page: number = 1, limit: number = 10) => {
    const res = await axiosInstance.get<PaginatedResponse<Transaction>>(`${PREFIX}/transactions`, {
      params: { page, limit }
    });
    // Return the full paginated response which contains { items, meta }
    return res.data;
  },

  createTransaction: async (data: CreateTransactionDto) => {
    const res = await axiosInstance.post<Transaction>(`${PREFIX}/transactions`, data);
    return res.data;
  },

  getSummary: async () => {
    const res = await axiosInstance.get<{ totalInputs: number; totalOutputs: number; balance: number }>(`${PREFIX}/transactions/summary`);
    // Assuming the transform interceptor unwraps the "data" or if axiosInstance handles it.
    // If interceptor returns `res.data` as the content of `data` property:
    return res.data;
  },

  // Business Events
  getBusinessEvents: async () => {
    const res = await axiosInstance.get<PaginatedResponse<BusinessEvent> | BusinessEvent[]>(`${PREFIX}/events`);
    return (res.data as PaginatedResponse<BusinessEvent>).items || res.data;
  },

  createBusinessEvent: async (data: CreateBusinessEventDto) => {
    const res = await axiosInstance.post<BusinessEvent>(`${PREFIX}/events`, data);
    return res.data;
  },

  // Categories
  getCategories: async () => {
    const res = await axiosInstance.get<PaginatedResponse<TransactionCategory> | TransactionCategory[]>(`${PREFIX}/categories`);
    return (res.data as PaginatedResponse<TransactionCategory>).items || res.data;
  },

  createCategory: async (data: CreateTransactionCategoryDto) => {
    const res = await axiosInstance.post<TransactionCategory>(`${PREFIX}/categories`, data);
    return res.data;
  },

  // Payment Methods
  getPaymentMethods: async () => {
    const res = await axiosInstance.get<PaginatedResponse<PaymentMethod> | PaymentMethod[]>(`${PREFIX}/payment-methods`);
    return (res.data as PaginatedResponse<PaymentMethod>).items || res.data;
  },

  createPaymentMethod: async (data: CreatePaymentMethodDto) => {
    const res = await axiosInstance.post<PaymentMethod>(`${PREFIX}/payment-methods`, data);
    return res.data;
  },
};
