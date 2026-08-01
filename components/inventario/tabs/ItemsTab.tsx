'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, LayoutGrid, List, Loader2, Package, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/inventario/StatusBadge';
import { ItemTypeIcon } from '@/components/inventario/ItemTypeIcon';
import { StockIndicator } from '@/components/inventario/StockIndicator';
import CreateItemModal from '@/components/inventario/modals/CreateItemModal';
import EditItemModal from '@/components/inventario/modals/EditItemModal';
import ItemDetailSheet from '@/components/inventario/modals/ItemDetailSheet';
import { inventarioApi } from '@/lib/inventario/api';
import type { InventoryItem, InventoryCategory, PaginatedInventoryResponse, InventoryLocation } from '@/lib/inventario/types';

export default function ItemsTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [meta, setMeta] = useState<PaginatedInventoryResponse<InventoryItem>['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [itemsRes, catsRes, locsRes] = await Promise.all([
        inventarioApi.getItems({ search: debouncedSearch || undefined, limit: 50 }),
        inventarioApi.getCategories(),
        inventarioApi.getLocations(),
      ]);
      setItems(itemsRes.items);
      setMeta(itemsRes.meta);
      setCategories(catsRes);
      setLocations(locsRes);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el inventario.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleItemCreated = () => {
    setIsCreateModalOpen(false);
    fetchData();
  };

  const handleItemUpdated = () => {
    setIsEditModalOpen(false);
    fetchData();
  };

  const openDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailSheetOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const lowStockItems = items.filter(i => i.stock.total > 0 && i.stock.available === 0).length;
  const maintenanceItems = items.filter(i => i.status === 'maintenance').length;
  const totalItems = meta?.totalItems ?? items.length;

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border-violet-100 shadow-sm flex flex-col justify-center active:scale-[0.98] transition-transform duration-150">
          <p className="text-xs text-violet-500 font-semibold uppercase tracking-wide">Total Ítems</p>
          <p className="text-3xl font-bold text-violet-950 mt-1">{isLoading ? '—' : totalItems}</p>
        </Card>
        <Card className="p-4 bg-white border-violet-100 shadow-sm flex flex-col justify-center active:scale-[0.98] transition-transform duration-150">
          <p className="text-xs text-violet-500 font-semibold uppercase tracking-wide">Categorías</p>
          <p className="text-3xl font-bold text-violet-950 mt-1">{isLoading ? '—' : categories.length}</p>
        </Card>
        <Card className="p-4 bg-red-50 border-red-100 shadow-sm flex flex-col justify-center active:scale-[0.98] transition-transform duration-150">
          <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">Stock Agotado</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{isLoading ? '—' : lowStockItems}</p>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-100 shadow-sm flex flex-col justify-center active:scale-[0.98] transition-transform duration-150">
          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">En Mantenimiento</p>
          <p className="text-3xl font-bold text-amber-700 mt-1">{isLoading ? '—' : maintenanceItems}</p>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-3 rounded-2xl border border-violet-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400 pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-12 sm:h-10 text-base sm:text-sm border-violet-200 rounded-xl focus-visible:ring-violet-500 w-full touch-manipulation"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-violet-50 p-1 rounded-xl border border-violet-100">
            <Button
              variant="ghost" size="icon"
              className={`h-11 w-11 sm:h-9 sm:w-9 rounded-lg active:scale-90 transition-all duration-150 ${viewMode === 'table' ? 'bg-white shadow-sm text-violet-700' : 'text-violet-400'}`}
              onClick={() => setViewMode('table')}
            >
              <List className="w-5 h-5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className={`h-11 w-11 sm:h-9 sm:w-9 rounded-lg active:scale-90 transition-all duration-150 ${viewMode === 'grid' ? 'bg-white shadow-sm text-violet-700' : 'text-violet-400'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-5 h-5 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <Button
            className="h-12 sm:h-10 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold ml-auto sm:ml-0 active:scale-95 transition-all duration-150 shadow-sm hover:shadow-md px-4"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Ítem</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Estados */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-violet-100">
          <Loader2 className="w-7 h-7 animate-spin text-violet-500 mr-3" />
          <span className="text-violet-600 text-base font-medium">Cargando inventario...</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="py-12 text-center bg-white rounded-2xl border border-red-100 text-red-600 text-sm px-4">
          <p className="font-medium">{error}</p>
          <Button variant="ghost" className="mt-3 text-violet-600" onClick={fetchData}>Reintentar</Button>
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="py-20 text-center bg-white rounded-2xl border border-violet-100">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-violet-50 flex items-center justify-center">
            <Package className="w-10 h-10 text-violet-200" />
          </div>
          <p className="font-bold text-violet-800 text-lg mb-2">No hay artículos</p>
          <p className="text-sm text-violet-400 max-w-xs mx-auto">Crea tu primer ítem con el botón "Nuevo Ítem" para comenzar.</p>
        </div>
      )}

      {/* Table View */}
      {!isLoading && !error && items.length > 0 && viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden -mx-4 sm:mx-0">
          <div className="overflow-x-auto snap-x">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-violet-50/80 text-violet-700 font-semibold border-b border-violet-100">
                <tr>
                  <th className="px-4 py-3.5 whitespace-nowrap">Ítem / SKU</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Categoría</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Stock</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3.5 whitespace-nowrap hidden md:table-cell">Ubicación</th>
                  <th className="px-4 py-3.5 whitespace-nowrap text-right">Precio Renta</th>
                  <th className="px-4 py-3.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50">
                {items.map(item => (
                  <tr
                    key={item.id}
                    className="group hover:bg-violet-50/40 transition-colors cursor-pointer active:bg-violet-100/50"
                    onClick={() => openDetails(item)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <ItemTypeIcon type={item.type} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-violet-950 truncate">{item.name}</p>
                          <p className="text-xs text-violet-500 font-mono">{item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: item.categoryName ? `${getCategoryColor(categories, item.categoryId)}18` : undefined, color: getCategoryColor(categories, item.categoryId) }}
                      >
                        {item.categoryName ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StockIndicator
                        total={item.stock.total}
                        available={item.stock.available}
                        reserved={item.stock.reserved}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-violet-600 text-xs hidden md:table-cell">
                      {item.locationName ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-violet-900">
                      {item.rentPrice != null ? `$${item.rentPrice}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <ChevronRight className="h-5 w-5 text-violet-300 group-hover:text-violet-500 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && !error && items.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <Card
              key={item.id}
              className="overflow-hidden bg-white border-violet-100 shadow-sm hover:shadow-lg active:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer select-none touch-manipulation"
              onClick={() => openDetails(item)}
            >
              <div className="h-36 bg-violet-50 flex items-center justify-center border-b border-violet-100 relative">
                <Package className="w-12 h-12 text-violet-200" />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-violet-950 truncate text-base" title={item.name}>{item.name}</h3>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-violet-500 font-mono">{item.sku}</p>
                    <span
                      className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                      style={{ backgroundColor: `${getCategoryColor(categories, item.categoryId)}18`, color: getCategoryColor(categories, item.categoryId) }}
                    >
                      {item.categoryName}
                    </span>
                  </div>
                </div>
                <StockIndicator total={item.stock.total} available={item.stock.available} reserved={item.stock.reserved} />
                <div className="flex justify-between items-center pt-3 border-t border-violet-50">
                  <span className="text-xs text-violet-600 truncate max-w-[55%]">{item.locationName ?? '—'}</span>
                  <span className="font-bold text-violet-900 text-base">{item.rentPrice != null ? `$${item.rentPrice}` : ''}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleItemCreated}
        categories={categories}
        locations={locations}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdated={handleItemUpdated}
        item={selectedItem}
        categories={categories}
        locations={locations}
      />

      <ItemDetailSheet
        isOpen={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
        item={selectedItem}
        onEditClick={() => {
          setIsDetailSheetOpen(false);
          setIsEditModalOpen(true);
        }}
      />
    </div>
  );
}

function getCategoryColor(categories: InventoryCategory[], categoryId: string): string {
  return categories.find(c => c.id === categoryId)?.color ?? '#7c3aed';
}