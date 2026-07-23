'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import TransactionsTab from "@/components/finanzas/TransactionsTab";
import CategoriesTab from "@/components/finanzas/CategoriesTab";
import PaymentMethodsTab from "@/components/finanzas/PaymentMethodsTab";
import { ArrowLeftRight, Tags, CreditCard, LayoutDashboard } from "lucide-react";

const tabs = [
  { value: "transactions", label: "Movimientos", icon: ArrowLeftRight },
  { value: "categories", label: "Categorías", icon: Tags },
  { value: "methods", label: "Pagos", icon: CreditCard },
];

export default function FinanzasDashboard() {
  const [activeTab, setActiveTab] = useState("transactions");

  return (
    <div className="min-h-screen bg-gray-50/50 pb-safe">
      {/* Header móvil optimizado */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-violet-100/50 safe-area-top">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-600 shadow-lg shadow-violet-600/20 active:scale-95 transition-transform duration-150">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-violet-950 tracking-tight leading-tight">
                  Finanzas
                </h1>
                <p className="text-xs sm:text-sm text-violet-600/70 hidden sm:block">
                  Controla tus ingresos y gastos
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-6 pt-3 sm:pt-6 max-w-5xl mx-auto">
        {/* Tabs optimizados para touch */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="sticky top-[60px] sm:top-[73px] z-20 bg-gray-50/50 backdrop-blur-sm pb-2 pt-1 -mx-3 px-3 sm:-mx-6 sm:px-6">
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
                      min-h-[52px] sm:min-h-[44px] rounded-xl text-xs sm:text-sm font-medium
                      transition-all duration-200 ease-out
                      data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-violet-600/20
                      data-[state=inactive]:text-violet-400 data-[state=inactive]:hover:bg-violet-50
                      active:scale-[0.97] touch-manipulation
                    `}
                  >
                    <Icon className="h-4 w-4 sm:h-4 sm:w-4" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="truncate max-w-[80px] sm:max-w-none">{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-violet-600 rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="transactions" className="mt-4 sm:mt-6 focus-visible:outline-none">
                <TransactionsTab />
              </TabsContent>
              <TabsContent value="categories" className="mt-4 sm:mt-6 focus-visible:outline-none">
                <CategoriesTab />
              </TabsContent>
              <TabsContent value="methods" className="mt-4 sm:mt-6 focus-visible:outline-none">
                <PaymentMethodsTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
}