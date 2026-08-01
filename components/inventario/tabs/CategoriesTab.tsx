'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { inventarioApi } from '@/lib/inventario/api';
import type { InventoryCategory } from '@/lib/inventario/types';
import CreateCategoryModal from '@/components/inventario/modals/CreateCategoryModal';
import { Edit2, Loader2, Plus, Settings2, Tags, Trash2 } from 'lucide-react';

export default function CategoriesTab() {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventarioApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las categorías.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-violet-100">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500 mr-2" />
        <span className="text-violet-500 text-sm">Cargando categorías...</span>
      </div>
    );
  }

  if (error) {
    return <div className="py-10 text-center bg-white rounded-2xl border border-red-100 text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-violet-100 shadow-sm">
        <h3 className="font-semibold text-violet-950 px-2">Categorías de Inventario</h3>
        <Button
          className="h-9 rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Nueva Categoría</span>
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-violet-100">
          <Tags className="w-12 h-12 mx-auto mb-3 text-violet-200" />
          <p className="font-semibold text-violet-700 mb-1">Sin categorías</p>
          <p className="text-sm text-violet-400">Crea tu primera categoría para organizar el inventario.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <Card key={cat.id} className="p-4 bg-white border-violet-100 shadow-sm flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-4">
                <span
                  className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold text-white"
                  style={{ backgroundColor: cat.color ?? '#7c3aed' }}
                >
                  {cat.name}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-violet-400 hover:text-violet-700 rounded-lg">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-violet-400 hover:text-violet-700 rounded-lg">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-violet-400 hover:text-red-600 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-auto space-y-2">
                <p className="text-xs text-violet-500">Atributos dinámicos ({cat.attributes.length}):</p>
                {cat.attributes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {cat.attributes.map((attr, idx) => (
                      <span key={idx} className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded text-[10px] font-medium border border-violet-100">
                        {attr.name}
                        {attr.required && <span className="text-red-400 ml-0.5">*</span>}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-violet-400 italic">Sin atributos configurados</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          setIsCreateModalOpen(false);
          fetchCategories();
        }}
      />
    </div>
  );
}
