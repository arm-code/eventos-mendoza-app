'use client'

import { useApi } from '@/hooks/useApi'
import { useToast } from '@/hooks/useToast'
import { useState, useEffect } from 'react'

import { Tag, Plus, Edit2, Trash2, X, Save, Package, Check, X as XIcon } from 'lucide-react'
import { Loader } from '@/components/Loaders/Loader.component'

interface ProductType {
  id: number
  nombre: string
  descripcion?: string
  requiereStock: boolean
  permiteVenta: boolean
  permiteRenta: boolean
  createdAt: string
}

export default function TipoDeProductosPage() {
  const { request, loading } = useApi()
  const { showSuccess, showError } = useToast()
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState<ProductType | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    requiereStock: true,
    permiteVenta: true,
    permiteRenta: true
  })

  const fetchProductTypes = async () => {
    try {
      const res = await request('/tipos-producto')
      if (res?.data) setProductTypes(res.data)
    } catch (err) {
      showError('Error al cargar los tipos de producto')
    }
  }

  useEffect(() => {
    fetchProductTypes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
        requiereStock: formData.requiereStock,
        permiteVenta: formData.permiteVenta,
        permiteRenta: formData.permiteRenta
      }

      const url = editingType ? `/tipos-producto/${editingType.id}` : '/tipos-producto'
      const method = editingType ? 'PUT' : 'POST'

      const res = await request(url, {
        method,
        json: payload,
      })

      if (res?.data) {
        await fetchProductTypes()
        resetForm()
        showSuccess(editingType ? 'Tipo de producto actualizado' : 'Tipo de producto creado')
      }
    } catch (err) {
      showError('Error al guardar el tipo de producto')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este tipo de producto?')) return
    
    try {
      const res = await request(`/tipos-producto/${id}`, { method: 'DELETE' })
      if (res.status === 200) {
        setProductTypes(productTypes.filter((type) => type.id !== id))
        showSuccess('Tipo de producto eliminado')
      }
    } catch (err) {
      showError('Error al eliminar el tipo de producto')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingType(null)
    setFormData({
      nombre: '',
      descripcion: '',
      requiereStock: true,
      permiteVenta: true,
      permiteRenta: true
    })
  }

  const editType = (type: ProductType) => {
    setEditingType(type)
    setFormData({
      nombre: type.nombre,
      descripcion: type.descripcion || '',
      requiereStock: type.requiereStock,
      permiteVenta: type.permiteVenta,
      permiteRenta: type.permiteRenta
    })
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Cargando tipos de producto..." />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-violet-900">Tipos de Producto</h1>
          <p className="text-violet-600 mt-1">
            {productTypes.length} {productTypes.length === 1 ? 'tipo' : 'tipos'} de producto
          </p>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Tipo
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white border border-violet-100 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-600" />
              <h3 className="text-lg font-semibold text-violet-900">
                {editingType ? 'Editar Tipo' : 'Crear Tipo de Producto'}
              </h3>
            </div>
            <button 
              onClick={resetForm}
              className="p-1 text-violet-400 hover:text-violet-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-violet-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Ej: Mesas, Sillas, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-violet-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Descripción opcional"
                />
              </div>
            </div>

            {/* Configuraciones */}
            <div className="bg-violet-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-violet-900 mb-3">Configuraciones</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.requiereStock}
                      onChange={(e) => setFormData({ ...formData, requiereStock: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      formData.requiereStock ? 'bg-violet-600' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.requiereStock ? 'transform translate-x-5' : 'transform translate-x-1'
                      }`} />
                    </div>
                  </div>
                  <span className="text-sm text-violet-700">Requiere Stock</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.permiteVenta}
                      onChange={(e) => setFormData({ ...formData, permiteVenta: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      formData.permiteVenta ? 'bg-violet-600' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.permiteVenta ? 'transform translate-x-5' : 'transform translate-x-1'
                      }`} />
                    </div>
                  </div>
                  <span className="text-sm text-violet-700">Permite Venta</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.permiteRenta}
                      onChange={(e) => setFormData({ ...formData, permiteRenta: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      formData.permiteRenta ? 'bg-violet-600' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.permiteRenta ? 'transform translate-x-5' : 'transform translate-x-1'
                      }`} />
                    </div>
                  </div>
                  <span className="text-sm text-violet-700">Permite Renta</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingType ? 'Guardar cambios' : 'Crear tipo'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-violet-200 text-violet-700 rounded-lg hover:bg-violet-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Tipos de Producto */}
      {productTypes.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <div className="flex justify-center mb-4">
            <Package className="w-16 h-16 text-violet-300" />
          </div>
          <h3 className="text-lg font-medium text-violet-900 mb-2">
            {showForm ? 'Crea tu primer tipo de producto' : 'No hay tipos de producto'}
          </h3>
          <p className="text-violet-600 max-w-md mx-auto">
            {showForm ? 'Completa el formulario para crear un nuevo tipo' : 'Los tipos de producto te ayudarán a clasificar y organizar tu inventario'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {productTypes.map((type) => (
            <div 
              key={type.id} 
              className="bg-white border border-violet-100 rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-200"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-violet-900 text-lg leading-tight pr-2">
                  {type.nombre}
                </h3>
                <div className="flex items-center gap-1 text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-full border border-violet-200">
                  <Tag className="w-3 h-3" />
                  Tipo
                </div>
              </div>

              {/* Descripción */}
              {type.descripcion && (
                <p className="text-violet-600 text-sm mb-4">
                  {type.descripcion}
                </p>
              )}

              {/* Configuraciones */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-violet-600">Requiere Stock</span>
                  {type.requiereStock ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <XIcon className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-violet-600">Permite Venta</span>
                  {type.permiteVenta ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <XIcon className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-violet-600">Permite Renta</span>
                  {type.permiteRenta ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <XIcon className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex space-x-2">
                <button
                  onClick={() => editType(type)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Editar</span>
                </button>
                <button 
                  onClick={() => handleDelete(type.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}