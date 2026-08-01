// Tipos del Módulo de Inventario — mapeados 1:1 con la API de ARM Solutions

export type InventoryItemType = 'product' | 'serialized' | 'combo' | 'consumable' | 'service';
export type InventoryItemStatus = 'available' | 'rented' | 'maintenance' | 'damaged' | 'lost' | 'retired';
export type InventoryLocationType = 'warehouse' | 'room' | 'vehicle';
export type InventoryMovementType = 'in' | 'out' | 'transfer' | 'adjustment';
export type InventoryAttributeType = 'string' | 'number' | 'boolean' | 'date';

// ─── Ubicaciones ────────────────────────────────────────────────────────────

export interface InventoryLocation {
  id: string;
  name: string;
  type: InventoryLocationType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryLocationDto {
  name: string;
  type: InventoryLocationType;
}

export interface UpdateInventoryLocationDto {
  name?: string;
  type?: InventoryLocationType;
}

// ─── Categorías ─────────────────────────────────────────────────────────────

export interface CategoryAttribute {
  name: string;
  type: InventoryAttributeType;
  required: boolean;
}

export interface InventoryCategory {
  id: string;
  name: string;
  color: string;
  attributes: CategoryAttribute[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryCategoryDto {
  name: string;
  color?: string;
  attributes?: CategoryAttribute[];
}

export interface UpdateInventoryCategoryDto {
  name?: string;
  color?: string;
  attributes?: CategoryAttribute[];
}

// ─── Ítems ───────────────────────────────────────────────────────────────────

export interface InventoryStock {
  total: number;
  available: number;
  reserved: number;
  rented: number;
}

export interface InventorySerial {
  id: string;
  serialNumber: string;
  status: InventoryItemStatus;
  notes: string | null;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  type: InventoryItemType;
  status: InventoryItemStatus;
  categoryId: string;
  categoryName: string;
  locationId: string | null;
  locationName: string | null;
  rentPrice: number | null;
  salePrice: number | null;
  stock: InventoryStock;
  attributes: Record<string, string | number | boolean | null>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  serials?: InventorySerial[]; // Solo en detalle, cuando type === 'serialized'
}

export interface CreateInventoryItemDto {
  name: string;
  sku: string;
  type: InventoryItemType;
  categoryId: string;
  status?: InventoryItemStatus;
  initialStock?: number;
  locationId?: string;
  rentPrice?: number;
  salePrice?: number;
  attributes?: Record<string, string | number | boolean | null>;
}

export interface UpdateInventoryItemDto {
  name?: string;
  type?: InventoryItemType;
  categoryId?: string;
  status?: InventoryItemStatus;
  locationId?: string;
  rentPrice?: number;
  salePrice?: number;
  attributes?: Record<string, string | number | boolean | null>;
}

export interface InventoryItemsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: InventoryItemStatus;
  type?: InventoryItemType;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ─── Movimientos ─────────────────────────────────────────────────────────────

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: InventoryMovementType;
  quantity: number;
  originLocationId: string | null;
  originLocationName: string | null;
  destinationLocationId: string | null;
  destinationLocationName: string | null;
  reason: string;
  snapshotStockBefore: InventoryStock;
  snapshotStockAfter: InventoryStock;
  createdAt: string;
}

export interface CreateInventoryMovementDto {
  itemId: string;
  type: InventoryMovementType;
  quantity: number;
  originLocationId?: string;
  destinationLocationId?: string;
  reason: string;
}

export interface InventoryMovementsQueryParams {
  page?: number;
  limit?: number;
  itemId?: string;
  type?: InventoryMovementType;
  startDate?: string;
  endDate?: string;
}

// ─── Paginación ──────────────────────────────────────────────────────────────

export interface PaginatedMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedInventoryResponse<T> {
  items: T[];
  meta: PaginatedMeta;
}
