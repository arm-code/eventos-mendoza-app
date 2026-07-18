'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionsTab from "@/components/finanzas/TransactionsTab";
import EventsTab from "@/components/finanzas/EventsTab";
import CategoriesTab from "@/components/finanzas/CategoriesTab";
import PaymentMethodsTab from "@/components/finanzas/PaymentMethodsTab";

export default function FinanzasDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Finanzas y Movimientos</h1>
        <p className="text-violet-900">
          Controla tus ingresos, gastos, eventos y catálogos financieros.
        </p>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-violet-100 text-violet-700">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-white data-[state=active]:text-violet-900">
            Transacciones
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:text-violet-900">
            Eventos
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:text-violet-900">
            Categorías
          </TabsTrigger>
          <TabsTrigger value="methods" className="data-[state=active]:bg-white data-[state=active]:text-violet-900">
            Métodos de Pago
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="mt-6">
          <TransactionsTab />
        </TabsContent>
        
        <TabsContent value="events" className="mt-6">
          <EventsTab />
        </TabsContent>
        
        <TabsContent value="categories" className="mt-6">
          <CategoriesTab />
        </TabsContent>
        
        <TabsContent value="methods" className="mt-6">
          <PaymentMethodsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
