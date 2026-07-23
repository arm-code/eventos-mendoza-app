'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import TransactionsTab from "@/components/finanzas/TransactionsTab";
import CategoriesTab from "@/components/finanzas/CategoriesTab";
import PaymentMethodsTab from "@/components/finanzas/PaymentMethodsTab";
import { ArrowLeftRight, Tags, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";

const tabs = [
  { value: "transactions", label: "Movimientos", icon: ArrowLeftRight },
  { value: "categories", label: "Categorías", icon: Tags },
  { value: "methods", label: "Pagos", icon: CreditCard },
];

export default function FinanzasDashboard() {
  const [activeTab, setActiveTab] = useState("transactions");

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* PageHeader reutilizable del layout */}
      <PageHeader
        title="Finanzas y Movimientos"
        description="Controla tus ingresos, gastos y catálogos financieros."
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        {/* Tabs sticky debajo del header del layout */}
        <div className="sticky top-[49px] sm:top-[57px] z-20 bg-gray-50/50 backdrop-blur-sm pb-2 pt-1 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-8 lg:px-8">
          <TabsList className="w-full h-auto p-1.5 bg-white rounded-2xl shadow-sm border border-violet-100/60 grid grid-cols-3 gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`
                    relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 
                    min-h-[48px] sm:min-h-[40px] rounded-xl text-xs sm:text-sm font-medium
                    transition-all duration-200 ease-out
                    data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-violet-600/20
                    data-[state=inactive]:text-violet-400 data-[state=inactive]:hover:bg-violet-50
                    active:scale-[0.97] touch-manipulation select-none
                  `}
                >
                  <Icon className="h-4 w-4 sm:h-4 sm:w-4" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="truncate max-w-[80px] sm:max-w-none">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <TabsContent value="transactions" className="mt-3 sm:mt-4 focus-visible:outline-none">
              <TransactionsTab />
            </TabsContent>
            <TabsContent value="categories" className="mt-3 sm:mt-4 focus-visible:outline-none">
              <CategoriesTab />
            </TabsContent>
            <TabsContent value="methods" className="mt-3 sm:mt-4 focus-visible:outline-none">
              <PaymentMethodsTab />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}