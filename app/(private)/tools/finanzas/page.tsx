'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpRight, ArrowDownRight, Wallet, CalendarDays } from "lucide-react";
import { financeApi } from '@/lib/api/finance';
import { Transaction, TransactionCategory, PaymentMethod, BusinessEvent } from '@/types/finance';
import { useToast } from "@/hooks/useToast";

export default function FinanzasDashboard() {
  const { showError } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    setIsLoading(true);
    const res = await financeApi.getTransactions();
    if (res.data) {
      setTransactions(res.data);
    } else {
      showError(res.error || "No se pudieron cargar las transacciones.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalInputs = transactions
    .filter(t => t.type === 'INPUT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalOutputs = transactions
    .filter(t => t.type === 'OUTPUT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalInputs - totalOutputs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Control Financiero</h1>
          <p className="text-violet-900">
            Gestiona tus ingresos, gastos y movimientos de los eventos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-violet-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-900">Balance Total</CardTitle>
            <Wallet className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-950">${balance.toFixed(2)}</div>
            <p className="text-xs text-violet-500">
              Balance actual disponible
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Ingresos Totales</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">${totalInputs.toFixed(2)}</div>
            <p className="text-xs text-green-600/70">
              Histórico de ingresos
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Gastos Totales</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">${totalOutputs.toFixed(2)}</div>
            <p className="text-xs text-red-600/70">
              Histórico de gastos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-violet-100">
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
          <CardDescription>
            Últimas transacciones registradas en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-violet-500">Cargando movimientos...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-violet-400">
              <CalendarDays className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No hay movimientos registrados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.type === 'INPUT' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {tx.type === 'INPUT' ? (
                        <ArrowUpRight className={`h-4 w-4 text-green-600`} />
                      ) : (
                        <ArrowDownRight className={`h-4 w-4 text-red-600`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-950">
                        {tx.description || tx.category?.name || 'Movimiento'}
                      </p>
                      <p className="text-xs text-violet-500">
                        {new Date(tx.transactionDate).toLocaleDateString()} • {tx.paymentMethod?.name || 'Otro'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${tx.type === 'INPUT' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'INPUT' ? '+' : '-'}${Number(tx.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
