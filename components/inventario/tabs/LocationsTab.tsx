'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Loader2, MapPin, Warehouse, DoorOpen, Truck } from 'lucide-react';
import { inventarioApi } from '@/lib/inventario/api';
import type { InventoryLocation, InventoryLocationType } from '@/lib/inventario/types';
import CreateLocationModal from '@/components/inventario/modals/CreateLocationModal';
import EditLocationModal from '@/components/inventario/modals/EditLocationModal';

export default function LocationsTab() {
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<InventoryLocation | null>(null);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventarioApi.getLocations();
      setLocations(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las ubicaciones.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const getIconForType = (type: InventoryLocationType) => {
    switch (type) {
      case 'warehouse': return <Warehouse className="w-5 h-5" />;
      case 'room': return <DoorOpen className="w-5 h-5" />;
      case 'vehicle': return <Truck className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getLabelForType = (type: InventoryLocationType) => {
    switch (type) {
      case 'warehouse': return 'Bodega';
      case 'room': return 'Sala / Cuarto';
      case 'vehicle': return 'Vehículo';
      default: return 'Ubicación';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-violet-100">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500 mr-2" />
        <span className="text-violet-500 text-sm">Cargando ubicaciones...</span>
      </div>
    );
  }

  if (error) {
    return <div className="py-10 text-center bg-white rounded-2xl border border-red-100 text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-violet-100 shadow-sm">
        <h3 className="font-semibold text-violet-950 px-2">Ubicaciones de Inventario</h3>
        <Button 
          className="h-9 rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Nueva Ubicación</span>
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-violet-100">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-violet-200" />
          <p className="font-semibold text-violet-700 mb-1">Sin ubicaciones</p>
          <p className="text-sm text-violet-400">Crea tu primera ubicación para rastrear el stock físico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map(loc => (
            <Card key={loc.id} className="p-4 bg-white border-violet-100 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0 border border-violet-100">
                  {getIconForType(loc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-violet-950 truncate">{loc.name}</h4>
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-600 mt-1 uppercase tracking-wider">
                    {getLabelForType(loc.type)}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-violet-400 hover:text-violet-700 rounded-lg"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateLocationModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreated={() => {
          setIsCreateModalOpen(false);
          fetchLocations();
        }} 
      />

      <EditLocationModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLocation(null);
        }} 
        onUpdated={() => {
          setIsEditModalOpen(false);
          setSelectedLocation(null);
          fetchLocations();
        }} 
        location={selectedLocation}
      />
    </div>
  );
}
