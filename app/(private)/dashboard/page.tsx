'use client'

import { Info } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-violet-900">Dashboard</h1>
        <p className="text-violet-600 mt-1">Bienvenido a Eventos Mendoza</p>
      </div>

      <div className="bg-white border border-violet-100 rounded-xl p-8 text-center max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="w-8 h-8 text-violet-600" />
        </div>
        <h2 className="text-xl font-bold text-violet-900 mb-2">Sistema en Mantenimiento</h2>
        <p className="text-violet-600">
          La gestión de productos y estadísticas globales están temporalmente deshabilitadas mientras actualizamos nuestra base de datos y sistema central.
        </p>
        <p className="text-violet-600 mt-4 font-medium">
          Aún puedes utilizar las herramientas como el generador de Notas de Venta libremente.
        </p>
      </div>
    </div>
  )
}