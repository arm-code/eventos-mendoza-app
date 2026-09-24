// app/tools/finanzas/page.tsx
'use client'

import { useState } from 'react'
import { ArrowLeftRight, CreditCard, Tags } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TransactionsTab from '@/components/finanzas/TransactionsTab'
import CategoriesTab from '@/components/finanzas/CategoriesTab'
import PaymentMethodsTab from '@/components/finanzas/PaymentMethodsTab'

export default function FinanzasDashboard() {
  const [activeTab, setActiveTab] = useState('transactions')

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      <PageHeader
        title="Movimientos"
        description="Controla tus ingresos, gastos y catálogos."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        <TabsList className="grid h-auto w-full grid-cols-3 p-1">
          <TabsTrigger
            value="transactions"
            className="flex h-12 flex-col items-center justify-center gap-1 rounded-lg text-sm sm:flex-row sm:gap-2"
          >
            <ArrowLeftRight className="size-4" aria-hidden />
            <span>Movimientos</span>
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex h-12 flex-col items-center justify-center gap-1 rounded-lg text-sm sm:flex-row sm:gap-2"
          >
            <Tags className="size-4" aria-hidden />
            <span>Categorías</span>
          </TabsTrigger>
          <TabsTrigger
            value="methods"
            className="flex h-12 flex-col items-center justify-center gap-1 rounded-lg text-sm sm:flex-row sm:gap-2"
          >
            <CreditCard className="size-4" aria-hidden />
            <span>Pagos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="transactions"
          className="m-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <TransactionsTab />
        </TabsContent>
        <TabsContent
          value="categories"
          className="m-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <CategoriesTab />
        </TabsContent>
        <TabsContent
          value="methods"
          className="m-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <PaymentMethodsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}