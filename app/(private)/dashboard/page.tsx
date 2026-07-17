'use client'

import { useApi } from '@/hooks/useApi'
import { useState, useEffect } from 'react'

import { Package, Tag, PlusCircle, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Loader } from '@/components/Loaders/Loader.component'

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  lowStockProducts: number
  totalValue: number
}

interface LowStockProduct {
  id: number
  nombre: string
  stock: number
  stockMinimo: number
}

export default function DashboardPage() {
  const { request, loading, error } = useApi()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    lowStockProducts: 0,
    totalValue: 0
  })
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [recentProducts, setRecentProducts] = useState<any[]>([])

  const fetchDashboardData = async () => {
    try {
      // Obtener estadísticas generales
      const productsRes = await request('/productos?limit=1000')
      const categoriesRes = await request('/categorias')
      
      if (productsRes?.data && categoriesRes?.data) {
        const products = productsRes.data.products || []
        const categories = categoriesRes.data || []
        
        // Calcular estadísticas
        const lowStock = products.filter((p: any) => p.stock <= p.stockMinimo && p.stock > 0)
        const criticalStock = products.filter((p: any) => p.stock === 0)
        const totalValue = products.reduce((sum: number, p: any) => sum + (p.precioVenta * p.stock), 0)
        
        setStats({
          totalProducts: products.length,
          totalCategories: categories.length,
          lowStockProducts: lowStock.length + criticalStock.length,
          totalValue
        })

        // Productos con stock bajo (los 5 más críticos)
        const lowStockList = [...lowStock, ...criticalStock]
          .sort((a: any, b: any) => a.stock - b.stock)
          .slice(0, 5)
          .map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            stock: p.stock,
            stockMinimo: p.stockMinimo
          }))
        
        setLowStockProducts(lowStockList)

        // Productos recientes (últimos 5 creados)
        const recent = products
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
        
        setRecentProducts(recent)
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Cargando dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error al cargar los datos</div>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-violet-900">Dashboard</h1>
        <p className="text-violet-600 mt-1">Resumen general de tu inventario</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Productos */}
        <div className="bg-white border border-violet-100 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-600 text-sm font-medium">Total Productos</p>
              <p className="text-2xl md:text-3xl font-bold text-violet-900 mt-1">
                {stats.totalProducts}
              </p>
            </div>
            <div className="p-3 bg-violet-100 rounded-lg">
              <Package className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </div>

        {/* Total Categorías */}
        <div className="bg-white border border-violet-100 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-600 text-sm font-medium">Categorías</p>
              <p className="text-2xl md:text-3xl font-bold text-violet-900 mt-1">
                {stats.totalCategories}
              </p>
            </div>
            <div className="p-3 bg-violet-100 rounded-lg">
              <Tag className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </div>

        {/* Stock Bajo */}
        <div className="bg-white border border-violet-100 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-600 text-sm font-medium">Stock Bajo</p>
              <p className="text-2xl md:text-3xl font-bold text-violet-900 mt-1">
                {stats.lowStockProducts}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Valor Total */}
        <div className="bg-white border border-violet-100 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-600 text-sm font-medium">Valor Inventario</p>
              <p className="text-2xl md:text-3xl font-bold text-violet-900 mt-1">
                ${stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Stock Bajo Section */}
        <div className="bg-white border border-violet-100 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-violet-900">Stock Bajo</h2>
            {stats.lowStockProducts > 0 && (
              <Link 
                href="/gestion-productos/productos/stock/bajo"
                className="flex items-center gap-1 text-violet-600 hover:text-violet-700 text-sm"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-violet-600">Todo el stock está en niveles óptimos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-violet-900">{product.nombre}</p>
                    <p className="text-sm text-orange-600">
                      Stock: {product.stock} / Mínimo: {product.stockMinimo}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock === 0 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {product.stock === 0 ? 'Agotado' : 'Bajo'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white border border-violet-100 rounded-xl p-4 md:p-6">
          <h2 className="text-lg font-semibold text-violet-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <Link 
              href="/gestion-productos/crear-producto"
              className="flex items-center gap-3 p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors group"
            >
              <div className="p-2 bg-violet-100 rounded-lg group-hover:bg-violet-200 transition-colors">
                <PlusCircle className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-violet-900">Nuevo Producto</p>
                <p className="text-sm text-violet-600">Agregar producto al inventario</p>
              </div>
            </Link>

            <Link 
              href="/gestion-productos/productos"
              className="flex items-center gap-3 p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors group"
            >
              <div className="p-2 bg-violet-100 rounded-lg group-hover:bg-violet-200 transition-colors">
                <Package className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-violet-900">Ver Productos</p>
                <p className="text-sm text-violet-600">Gestionar inventario</p>
              </div>
            </Link>

            <Link 
              href="/gestion-productos/categorias"
              className="flex items-center gap-3 p-4 border border-violet-200 rounded-lg hover:bg-violet-50 transition-colors group"
            >
              <div className="p-2 bg-violet-100 rounded-lg group-hover:bg-violet-200 transition-colors">
                <Tag className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-violet-900">Gestionar Categorías</p>
                <p className="text-sm text-violet-600">Organizar productos</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}