'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter, MoreVertical, LayoutGrid, List, Loader2, Package } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/inventario/StatusBadge';
import { ItemTypeIcon } from '@/components/inventario/ItemTypeIcon';
import { StockIndicator } from '@/components/inventario/StockIndicator';
import CreateItemModal from '@/components/inventario/modals/CreateItemModal';
import { inventarioApi } from '@/lib/inventario/api';
import type { InventoryItem, InventoryCategory, PaginatedInventoryResponse } from '@/lib/inventario/types';

export default function ItemsTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [meta, setMeta] = useState<PaginatedInventoryResponse<InventoryItem>['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce del buscador (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        inventarioApi.getItems({ search: debouncedSearch || undefined, limit: 50 }),
        inventarioApi.getCategories(),
      ]);
      setItems(itemsRes.items);
      setMeta(itemsRes.meta);
      setCategories(catsRes);
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

  const lowStockItems = items.filter(i => i.stock.total > 0 && i.stock.available === 0).length;
  const maintenanceItems = items.filter(i => i.status === 'maintenance').length;
  const totalItems = meta?.totalItems ?? items.length;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border-violet-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-violet-500 font-medium">Total Ítems</p>
          <p className="text-2xl font-bold text-violet-950">{isLoading ? '—' : totalItems}</p>
        </Card>
        <Card className="p-4 bg-white border-violet-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-violet-500 font-medium">Categorías</p>
          <p className="text-2xl font-bold text-violet-950">{isLoading ? '—' : categories.length}</p>
        </Card>
        <Card className="p-4 bg-red-50 border-red-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-red-600 font-medium">Stock Agotado</p>
          <p className="text-2xl font-bold text-red-700">{isLoading ? '—' : lowStockItems}</p>
        </Card>
        <Card className="p-4 bg-amber-50 border-amber-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs text-amber-600 font-medium">En Mantenimiento</p>
          <p className="text-2xl font-bold text-amber-700">{isLoading ? '—' : maintenanceItems}</p>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-3 rounded-2xl border border-violet-100 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
          <Input
            placeholder="Buscar por nombre, SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 border-violet-200 rounded-xl focus-visible:ring-violet-500 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-violet-50 p-1 rounded-xl border border-violet-100">
            <Button
              variant="ghost" size="icon"
              className={`h-8 w-8 rounded-lg ${viewMode === 'table' ? 'bg-white shadow-sm text-violet-700' : 'text-violet-400'}`}
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className={`h-8 w-8 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-violet-700' : 'text-violet-400'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
          <Button
            className="h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold ml-auto sm:ml-0"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Ítem</span>
          </Button>
        </div>
      </div>

      {/* Estados: loading / error / empty */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-violet-100">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500 mr-2" />
          <span className="text-violet-500 text-sm">Cargando inventario...</span>
        </div>
      )}

      {!isLoading && error && (
        <div className="py-10 text-center bg-white rounded-2xl border border-red-100 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-violet-100">
          <Package className="w-12 h-12 mx-auto mb-3 text-violet-200" />
          <p className="font-semibold text-violet-700 mb-1">No hay artículos en el inventario</p>
          <p className="text-sm text-violet-400">Crea tu primer ítem con el botón "Nuevo Ítem".</p>
        </div>
      )}

      {/* Table View */}
      {!isLoading && !error && items.length > 0 && viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-violet-50/50 text-violet-700 font-semibold border-b border-violet-100">
              <tr>
                <th className="px-4 py-3">Ítem / SKU</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 hidden md:table-cell">Ubicación</th>
                <th className="px-4 py-3 text-right">Precio Renta</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-violet-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <ItemTypeIcon type={item.type} />
                      </div>
                      <div>
                        <p className="font-bold text-violet-950">{item.name}</p>
                        <p className="text-xs text-violet-500">{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{ backgroundColor: item.categoryName ? `${getCategoryColor(categories, item.categoryId)}20` : undefined }}
                    >
                      {item.categoryName ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StockIndicator
                      total={item.stock.total}
                      available={item.stock.available}
                      reserved={item.stock.reserved}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-violet-600 text-xs hidden md:table-cell">
                    {item.locationName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-violet-900">
                    {item.rentPrice != null ? `$${item.rentPrice}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-violet-400 hover:text-violet-700 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl border-violet-100 shadow-xl">
                        <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-violet-50">Ver detalle</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-violet-50">Editar</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer rounded-lg focus:bg-violet-50">Movimientos</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && !error && items.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <Card key={item.id} className="overflow-hidden bg-white border-violet-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-32 bg-violet-50 flex items-center justify-center border-b border-violet-100 relative">
                <Package className="w-10 h-10 text-violet-200" />
                <div className="absolute top-2 right-2">
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-violet-950 truncate" title={item.name}>{item.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-violet-500">{item.sku}</p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-700">
                      {item.categoryName}
                    </span>
                  </div>
                </div>
                <StockIndicator total={item.stock.total} available={item.stock.available} reserved={item.stock.reserved} />
                <div className="flex justify-between items-center pt-2 border-t border-violet-50">
                  <span className="text-xs text-violet-600 truncate max-w-[60%]">{item.locationName ?? '—'}</span>
                  <span className="font-semibold text-violet-900">{item.rentPrice != null ? `$${item.rentPrice}` : ''}</span>
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
      />
    </div>
  );
}

// Helper para obtener el color hex de una categoría por ID
function getCategoryColor(categories: InventoryCategory[], categoryId: string): string {
  return categories.find(c => c.id === categoryId)?.color ?? '#7c3aed';
}
