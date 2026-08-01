import { axiosInstance } from '@/lib/api/axios';
import {
  InventoryLocation,
  CreateInventoryLocationDto,
  UpdateInventoryLocationDto,
  InventoryCategory,
  CreateInventoryCategoryDto,
  UpdateInventoryCategoryDto,
  InventoryItem,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  InventoryItemsQueryParams,
  InventoryMovement,
  CreateInventoryMovementDto,
  InventoryMovementsQueryParams,
  PaginatedInventoryResponse,
} from './types';

const PREFIX = '/v1/inventory';

export const inventarioApi = {
  // ─── Ubicaciones ───────────────────────────────────────────────────────────
  getLocations: async (): Promise<InventoryLocation[]> => {
    const res = await axiosInstance.get<InventoryLocation[]>(`${PREFIX}/locations`);
    return res.data;
  },

  createLocation: async (data: CreateInventoryLocationDto): Promise<InventoryLocation> => {
    const res = await axiosInstance.post<InventoryLocation>(`${PREFIX}/locations`, data);
    return res.data;
  },

  updateLocation: async (id: string, data: UpdateInventoryLocationDto): Promise<InventoryLocation> => {
    const res = await axiosInstance.put<InventoryLocation>(`${PREFIX}/locations/${id}`, data);
    return res.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${PREFIX}/locations/${id}`);
  },

  // ─── Categorías ────────────────────────────────────────────────────────────
  getCategories: async (): Promise<InventoryCategory[]> => {
    const res = await axiosInstance.get<InventoryCategory[]>(`${PREFIX}/categories`);
    return res.data;
  },

  createCategory: async (data: CreateInventoryCategoryDto): Promise<InventoryCategory> => {
    const res = await axiosInstance.post<InventoryCategory>(`${PREFIX}/categories`, data);
    return res.data;
  },

  updateCategory: async (id: string, data: UpdateInventoryCategoryDto): Promise<InventoryCategory> => {
    const res = await axiosInstance.put<InventoryCategory>(`${PREFIX}/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    // Puede retornar 409 si tiene ítems activos — el interceptor de axios lanzará el error automáticamente
    await axiosInstance.delete(`${PREFIX}/categories/${id}`);
  },

  // ─── Ítems ─────────────────────────────────────────────────────────────────
  getItems: async (params?: InventoryItemsQueryParams): Promise<PaginatedInventoryResponse<InventoryItem>> => {
    const res = await axiosInstance.get<PaginatedInventoryResponse<InventoryItem>>(`${PREFIX}/items`, { params });
    return res.data;
  },

  getItemById: async (id: string): Promise<InventoryItem> => {
    const res = await axiosInstance.get<InventoryItem>(`${PREFIX}/items/${id}`);
    return res.data;
  },

  createItem: async (data: CreateInventoryItemDto): Promise<InventoryItem> => {
    const res = await axiosInstance.post<InventoryItem>(`${PREFIX}/items`, data);
    return res.data;
  },

  updateItem: async (id: string, data: UpdateInventoryItemDto): Promise<InventoryItem> => {
    const res = await axiosInstance.put<InventoryItem>(`${PREFIX}/items/${id}`, data);
    return res.data;
  },

  deleteItem: async (id: string): Promise<InventoryItem> => {
    // Soft delete — retorna el ítem con isActive: false
    const res = await axiosInstance.delete<InventoryItem>(`${PREFIX}/items/${id}`);
    return res.data;
  },

  // ─── Movimientos ───────────────────────────────────────────────────────────
  getMovements: async (params?: InventoryMovementsQueryParams): Promise<PaginatedInventoryResponse<InventoryMovement>> => {
    const res = await axiosInstance.get<PaginatedInventoryResponse<InventoryMovement>>(`${PREFIX}/movements`, { params });
    return res.data;
  },

  createMovement: async (data: CreateInventoryMovementDto): Promise<InventoryMovement> => {
    const res = await axiosInstance.post<InventoryMovement>(`${PREFIX}/movements`, data);
    return res.data;
  },
};
