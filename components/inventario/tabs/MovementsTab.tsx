'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowDown, ArrowUp, RefreshCcw, AlertTriangle, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { inventarioApi } from '@/lib/inventario/api';
import type { InventoryMovement, InventoryItem, InventoryLocation } from '@/lib/inventario/types';
import CreateMovementModal from '@/components/inventario/modals/CreateMovementModal';

export default function MovementsTab() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [movRes, itemsRes, locRes] = await Promise.all([
        inventarioApi.getMovements({ limit: 50 }),
        inventarioApi.getItems({ limit: 100 }), // Podría cambiarse a autocompletado en un futuro si son miles
        inventarioApi.getLocations()
      ]);
      setMovements(movRes.items);
      setItems(itemsRes.items);
      setLocations(locRes);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los movimientos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'in': return <ArrowDown className="w-4 h-4 text-emerald-600" />;
      case 'out': return <ArrowUp className="w-4 h-4 text-blue-600" />;
      case 'transfer': return <RefreshCcw className="w-4 h-4 text-violet-600" />;
      case 'adjustment': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default: return null;
    }
  };

  const getBadge = (type: string) => {
    switch (type) {
      case 'in': return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">Entrada</span>;
      case 'out': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Salida</span>;
      case 'transfer': return <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-xs">Traspaso</span>;
      case 'adjustment': return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">Ajuste</span>;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-violet-100">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500 mr-2" />
        <span className="text-violet-500 text-sm">Cargando movimientos...</span>
      </div>
    );
  }

  if (error) {
    return <div className="py-10 text-center bg-white rounded-2xl border border-red-100 text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-violet-100 shadow-sm">
        <h3 className="font-semibold text-violet-950 px-2">Historial de Movimientos</h3>
        <Button 
          className="h-9 rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Nuevo Movimiento</span>
        </Button>
      </div>

      {movements.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-violet-100">
          <RefreshCcw className="w-12 h-12 mx-auto mb-3 text-violet-200" />
          <p className="font-semibold text-violet-700 mb-1">Sin movimientos registrados</p>
          <p className="text-sm text-violet-400">Los movimientos de inventario aparecerán aquí.</p>
        </div>
      ) : (
        <Card className="bg-white rounded-2xl border-violet-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-violet-50/50 text-violet-700 font-semibold border-b border-violet-100">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Artículo</th>
            <th className="px-4 py-3">Cant.</th>
            <th className="px-4 py-3 hidden md:table-cell">Origen → Destino</th>
            <th className="px-4 py-3 hidden lg:table-cell">Motivo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-violet-50">
          {movements.map(mov => (
            <tr key={mov.id} className="hover:bg-violet-50/30 transition-colors">
              <td className="px-4 py-3 text-xs text-violet-500 whitespace-nowrap">
                {new Date(mov.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {getIcon(mov.type)}
                  {getBadge(mov.type)}
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-violet-950">{mov.itemName}</td>
              <td className="px-4 py-3 font-bold text-violet-900">{mov.quantity}</td>
              <td className="px-4 py-3 text-violet-600 text-xs hidden md:table-cell">
                {mov.originLocationName ?? '—'} → {mov.destinationLocationName ?? '—'}
              </td>
              <td className="px-4 py-3 text-violet-500 text-xs hidden lg:table-cell">{mov.reason}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </Card>
      )}

      <CreateMovementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          setIsCreateModalOpen(false);
          fetchMovements();
        }}
        items={items}
        locations={locations}
      />
    </div>
  );
}
