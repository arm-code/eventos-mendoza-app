'use client';

import { useApi } from '@/hooks/useApi';
import { useState } from 'react';
import { Package, ArrowLeft, Save } from 'lucide-react';
import { Loader } from '@/components/Loaders/Loader.component';
import { useToast } from '@/hooks/useToast';

interface CreateProductForm {
  codigoBarra?: string;
  sku?: string;
  nombre: string;
  descripcion?: string;
  precioCompra: number;
  precioVenta: number;
  precioRentaDiario?: number;
  stock?: number;
  stockMinimo?: number;
  categoriaId?: number;
  tipoProductoId: number;
  activo?: boolean;
}

const CrearProductoPage = () => {
  const { error, loading, request } = useApi();  
  const { showSuccess } = useToast();

  const [formData, setFormData] = useState<CreateProductForm>({
    nombre: '',
    precioCompra: 0,
    precioVenta: 0,
    tipoProductoId: 1,
    stock: 0,
    stockMinimo: 0,
    precioRentaDiario: 0,
    activo: true,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();    

    try {
      const res = await request('/productos', {
        method: 'POST',
        json: formData,
      });

      if (res.data) {        
        showSuccess('Producto creado exitosamente')
        // Reset form
        setFormData({
          nombre: '',
          precioCompra: 0,
          precioVenta: 0,
          tipoProductoId: 1,
          stock: 0,
          stockMinimo: 0,
          precioRentaDiario: 0,
          activo: true,
        });
      }
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader size='lg' text='Creando producto...' />
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-4 md:p-6'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-6 md:mb-8'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-violet-900'>
            Nuevo Producto
          </h1>
          <p className='text-violet-600 mt-1'>
            Agrega un nuevo producto al inventario
          </p>
        </div>
      </div>      

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6'>
          Error: {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className='space-y-6 md:space-y-8'>
        {/* Información básica */}
        <div className='bg-white border border-violet-100 rounded-xl p-4 md:p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Package className='w-5 h-5 text-violet-600' />
            <h2 className='text-lg font-semibold text-violet-900'>
              Información básica
            </h2>
          </div>

          <div className='space-y-4'>
            <div>
              <label
                htmlFor='nombre'
                className='block text-sm font-medium text-violet-700 mb-2'
              >
                Nombre del producto *
              </label>
              <input
                type='text'
                id='nombre'
                name='nombre'
                required
                value={formData.nombre}
                onChange={handleChange}
                className='w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
                placeholder='Ej: Mesa grande plegable'
              />
            </div>

            <div>
              <label
                htmlFor='descripcion'
                className='block text-sm font-medium text-violet-700 mb-2'
              >
                Descripción
              </label>
              <textarea
                id='descripcion'
                name='descripcion'
                rows={3}
                value={formData.descripcion || ''}
                onChange={handleChange}
                className='w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
                placeholder='Ej: Mesa grande marca lifetime, tipo portafolios'
              />
            </div>
          </div>
        </div>

        {/* Códigos */}
        <div className='bg-white border border-violet-100 rounded-xl p-4 md:p-6'>
          <h2 className='text-lg font-semibold text-violet-900 mb-4'>
            Códigos
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='sku'
                className='block text-sm font-medium text-violet-700 mb-2'
              >
                SKU
              </label>
              <input
                type='text'
                id='sku'
                name='sku'
                value={formData.sku || ''}
                onChange={handleChange}
                className='w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
                placeholder='Ej: MG-8S'
              />
            </div>

            <div>
              <label
                htmlFor='codigoBarra'
                className='block text-sm font-medium text-violet-700 mb-2'
              >
                Código de barras
              </label>
              <input
                type='text'
                id='codigoBarra'
                name='codigoBarra'
                value={formData.codigoBarra || ''}
                onChange={handleChange}
                className='w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
                placeholder='Ej: 11231234342'
              />
            </div>
          </div>
        </div>

        {/* Precios */}
        <div className='bg-white border border-violet-100 rounded-xl p-4 md:p-6'>
          <h2 className='text-lg font-semibold text-violet-900 mb-4'>
            Precios
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label
                htmlFor='precioCompra'
                className='block text-sm font-medium text-violet-700 mb-2'
              >
                Precio de compra *
              </label>
              <input
                type='number'
                id='precioCompra'
                name='precioCompra'
                required
                min='0'
                step='0.01'
                value={formData.precioCompra}
                onChange={handleChange}
                className='w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='precioVenta'
                className='block text-sm font-medium text-violet-700 mb-2'
              >
                Precio de venta *
              </label>
              <input
                type='number'
                id='precioVenta'
                name='precioVenta'
                required
                min='0'
                step='0.01'
                value={formData.precioVenta}
                onChange={handleChange}
                className='w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='precioRentaDiario'
                className='block text-sm font-medium text-violet-700 mb-2'
              >
                Precio renta diario
              </label>
              <input
                type='number'
                id='precioRentaDiario'
                name='precioRentaDiario'
                min='0'
                step='0.01'
                value={formData.precioRentaDiario || 0}
                onChange={handleChange}
                className='w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
              />
            </div>
          </div>
        </div>

        {/* Stock */}
        <div className='bg-white border border-violet-100 rounded-xl p-4 md:p-6'>
          <h2 className='text-lg font-semibold text-violet-900 mb-4'>
            Inventario
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='stock'
                className='block text-sm font-medium text-violet-700 mb-2'
              >
                Stock inicial
              </label>
              <input
                type='number'
                id='stock'
                name='stock'
                min='0'
                value={formData.stock || 0}
                onChange={handleChange}
                className='w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='stockMinimo'
                className='block text-sm font-medium text-violet-700 mb-2'
              >
                Stock mínimo
              </label>
              <input
                type='number'
                id='stockMinimo'
                name='stockMinimo'
                min='0'
                value={formData.stockMinimo || 0}
                onChange={handleChange}
                className='w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
              />
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className='bg-white border border-violet-100 rounded-xl p-4 md:p-6'>
          <h2 className='text-lg font-semibold text-violet-900 mb-4'>
            Clasificación
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='categoriaId'
                className='block text-sm font-medium text-violet-700 mb-2'
              >
                Categoría
              </label>
              <select
                id='categoriaId'
                name='categoriaId'
                value={formData.categoriaId || ''}
                onChange={handleChange}
                className='w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
              >
                <option value=''>Seleccionar categoría</option>
                <option value='1'>Categoría 1</option>
                <option value='2'>Categoría 2</option>
              </select>
            </div>

            <div>
              <label
                htmlFor='tipoProductoId'
                className='block text-sm font-medium text-violet-700 mb-2'
              >
                Tipo de producto *
              </label>
              <select
                id='tipoProductoId'
                name='tipoProductoId'
                required
                value={formData.tipoProductoId}
                onChange={handleChange}
                className='w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent'
              >
                <option value='1'>Tipo 1</option>
                <option value='2'>Tipo 2</option>
                <option value='3'>Tipo 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className='bg-white border border-violet-100 rounded-xl p-4 md:p-6'>
          <div className='flex items-center'>
            <input
              type='checkbox'
              id='activo'
              name='activo'
              checked={formData.activo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, activo: e.target.checked }))
              }
              className='h-4 w-4 text-violet-600 border-violet-300 rounded focus:ring-violet-500'
            />
            <label
              htmlFor='activo'
              className='ml-2 block text-sm text-violet-700'
            >
              Producto activo
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className='flex flex-col sm:flex-row gap-3 pt-4'>
          <button
            type='submit'
            disabled={loading}
            className='flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white py-3 px-6 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 transition-colors cursor-pointer'
          >
            <Save className='w-4 h-4' />
            {loading ? 'Creando...' : 'Crear producto'}
          </button>

          <button
            type='button'
            onClick={() => window.history.back()}
            className='px-6 py-3 border border-violet-200 text-violet-700 rounded-lg hover:bg-violet-50 transition-colors cursor-pointer'
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearProductoPage;
