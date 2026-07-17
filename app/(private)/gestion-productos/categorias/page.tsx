'use client'

import { useApi } from '@/hooks/useApi'
import { useToast } from '@/hooks/useToast'
import { useState, useEffect } from 'react'

import { Tag, Plus, Edit2, Trash2, X, Save } from 'lucide-react'
import { Loader } from '@/components/Loaders/Loader.component'

interface Category {
  id: number
  nombre: string
  descripcion?: string
  productosCount: number
}

export default function CategoriesPage() {
  const { request, loading } = useApi()
  const { showSuccess, showError } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' })

  const fetchCategories = async () => {
    try {
      const res = await request('/categorias')
      if (res?.data) setCategories(res.data)
    } catch (err) {
      showError('Error al cargar las categorías')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || undefined,
      }

      const url = editingCategory ? `/categorias/${editingCategory.id}` : '/categorias'
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await request(url, {
        method,
        json: payload,
      })

      if (res?.data) {
        await fetchCategories()
        setShowForm(false)
        setEditingCategory(null)
        setFormData({ nombre: '', descripcion: '' })
        showSuccess(editingCategory ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente')
      }
    } catch (err) {
      showError('Error al guardar la categoría')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return
    
    try {
      const res = await request(`/categorias/${id}`, { method: 'DELETE' })
      if (res.status === 200) {
        setCategories(categories.filter((c) => c.id !== id))
        showSuccess('Categoría eliminada correctamente')
      }
    } catch (err) {
      showError('Error al eliminar la categoría')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({ nombre: '', descripcion: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Cargando categorías..." />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-violet-900">Categorías</h1>
          <p className="text-violet-600 mt-1">
            {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'} encontradas
          </p>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white border border-violet-100 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-violet-600" />
              <h3 className="text-lg font-semibold text-violet-900">
                {editingCategory ? 'Editar Categoría' : 'Crear Categoría'}
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
                placeholder="Nombre de la categoría"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
                className="w-full border border-violet-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                placeholder="Descripción opcional de la categoría"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
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

      {/* Grid de Categorías */}
      {categories.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <div className="flex justify-center mb-4">
            <Tag className="w-16 h-16 text-violet-300" />
          </div>
          <h3 className="text-lg font-medium text-violet-900 mb-2">
            {showForm ? 'Crea tu primera categoría' : 'No hay categorías'}
          </h3>
          <p className="text-violet-600 max-w-md mx-auto">
            {showForm ? 'Completa el formulario para crear una nueva categoría' : 'Las categorías te ayudarán a organizar tus productos'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="bg-white border border-violet-100 rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-200"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-violet-900 text-lg leading-tight pr-2">
                  {cat.nombre}
                </h3>
                <span className="bg-violet-100 text-violet-800 text-xs px-2 py-1 rounded-full border border-violet-200 min-w-[70px] text-center">
                  {cat.productosCount || 0} {cat.productosCount === 1 ? 'producto' : 'productos'}
                </span>
              </div>

              {/* Descripción */}
              <p className="text-violet-600 text-sm mb-4">
                {cat.descripcion || 'Sin descripción'}
              </p>

              {/* Acciones */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingCategory(cat)
                    setFormData({ nombre: cat.nombre, descripcion: cat.descripcion || '' })
                    setShowForm(true)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Editar</span>
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)}
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