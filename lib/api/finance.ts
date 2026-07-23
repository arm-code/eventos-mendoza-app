import { axiosInstance } from './axios';
import {
  Transaction,
  CreateTransactionDto,
  BusinessEvent,
  CreateBusinessEventDto,
  UpdateBusinessEventDto,
  EventStatus,
  SalesNote,
  CreateSalesNoteDto,
  UpdateSalesNoteDto,
  SalesNoteStatus,
  TransactionCategory,
  PaymentMethod,
  CreateTransactionCategoryDto,
  CreatePaymentMethodDto,
  PaginatedResponse,
  BusinessConfig,
  UpdateBusinessConfigDto,
  CreatePaymentCardDto,
  PaymentCard,
} from '@/types/finance';

const PREFIX = '/v1';

export const financeApi = {
  // Transactions
  getTransactions: async (page: number = 1, limit: number = 10) => {
    const res = await axiosInstance.get<PaginatedResponse<Transaction>>(`${PREFIX}/transactions`, {
      params: { page, limit }
    });
    return res.data;
  },

  createTransaction: async (data: CreateTransactionDto) => {
    const res = await axiosInstance.post<Transaction>(`${PREFIX}/transactions`, data);
    return res.data;
  },

  getSummary: async () => {
    const res = await axiosInstance.get<{ totalInputs: number; totalOutputs: number; balance: number }>(`${PREFIX}/transactions/summary`);
    return res.data;
  },

  // Sales Notes / Quotes
  getSalesNotes: async (params?: { page?: number; limit?: number; status?: string; eventId?: string; search?: string }) => {
    const res = await axiosInstance.get<PaginatedResponse<SalesNote> | SalesNote[]>(`${PREFIX}/sales-notes`, {
      params,
    });
    return (res.data as PaginatedResponse<SalesNote>).items || res.data;
  },

  getSalesNoteById: async (id: string) => {
    const res = await axiosInstance.get<SalesNote>(`${PREFIX}/sales-notes/${id}`);
    return res.data;
  },

  createSalesNote: async (data: CreateSalesNoteDto) => {
    const res = await axiosInstance.post<SalesNote>(`${PREFIX}/sales-notes`, data);
    return res.data;
  },

  updateSalesNote: async (id: string, data: UpdateSalesNoteDto) => {
    const res = await axiosInstance.patch<SalesNote>(`${PREFIX}/sales-notes/${id}`, data);
    return res.data;
  },

  updateSalesNoteStatus: async (id: string, status: SalesNoteStatus) => {
    const res = await axiosInstance.patch<SalesNote>(`${PREFIX}/sales-notes/${id}/status`, { status });
    return res.data;
  },

  deleteSalesNote: async (id: string) => {
    const res = await axiosInstance.delete<{ success: boolean }>(`${PREFIX}/sales-notes/${id}`);
    return res.data;
  },

  // Business Events
  getBusinessEvents: async (params?: { page?: number; limit?: number; status?: string; tab?: string; search?: string }) => {
    const res = await axiosInstance.get<PaginatedResponse<BusinessEvent> | BusinessEvent[]>(`${PREFIX}/events`, {
      params,
    });
    return (res.data as PaginatedResponse<BusinessEvent>).items || res.data;
  },

  getBusinessEventById: async (id: string) => {
    const res = await axiosInstance.get<BusinessEvent>(`${PREFIX}/events/${id}`);
    return res.data;
  },

  createBusinessEvent: async (data: CreateBusinessEventDto) => {
    const res = await axiosInstance.post<BusinessEvent>(`${PREFIX}/events`, data);
    return res.data;
  },

  updateBusinessEvent: async (id: string, data: UpdateBusinessEventDto) => {
    const res = await axiosInstance.patch<BusinessEvent>(`${PREFIX}/events/${id}`, data);
    return res.data;
  },

  updateEventStatus: async (id: string, status: EventStatus) => {
    const res = await axiosInstance.patch<BusinessEvent>(`${PREFIX}/events/${id}/status`, { status });
    return res.data;
  },

  deleteBusinessEvent: async (id: string) => {
    const res = await axiosInstance.delete<{ success: boolean }>(`${PREFIX}/events/${id}`);
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

  // Business Configuration
  getConfig: async () => {
    const res = await axiosInstance.get<BusinessConfig>(`${PREFIX}/config`);
    return res.data;
  },

  updateConfig: async (data: UpdateBusinessConfigDto) => {
    const res = await axiosInstance.patch<BusinessConfig>(`${PREFIX}/config`, data);
    return res.data;
  },

  addPaymentCard: async (data: CreatePaymentCardDto) => {
    const res = await axiosInstance.post<PaymentCard>(`${PREFIX}/config/cards`, data);
    return res.data;
  },

  deletePaymentCard: async (cardId: string) => {
    const res = await axiosInstance.delete<{ success: boolean }>(`${PREFIX}/config/cards/${cardId}`);
    return res.data;
  },
};
