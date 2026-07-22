import type { Note, NoteItem, NoteTotals, Transaction } from './types'

export function itemAmount(item: Pick<NoteItem, 'quantity' | 'unitPrice'>): number {
  return (item.quantity || 0) * (item.unitPrice || 0)
}

export function computeNoteTotals(
  items: NoteItem[],
  applyIva: boolean,
  ivaRate: number,
): NoteTotals {
  const subtotal = items.reduce((acc, it) => acc + itemAmount(it), 0)
  const iva = applyIva ? subtotal * ivaRate : 0
  return { subtotal, iva, total: subtotal + iva }
}

export function noteTotal(note: Note): number {
  return computeNoteTotals(note.items, note.applyIva, note.ivaRate).total
}

export interface FinanceSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  byMethod: Record<string, number>
}

export function summarizeTransactions(
  transactions: Transaction[],
  methodInitialBalances: Record<string, number>,
): FinanceSummary {
  const byMethod: Record<string, number> = { ...methodInitialBalances }
  let totalIncome = 0
  let totalExpense = 0

  for (const tx of transactions) {
    const signed = tx.type === 'income' ? tx.amount : -tx.amount
    byMethod[tx.paymentMethodId] = (byMethod[tx.paymentMethodId] || 0) + signed
    if (tx.type === 'income') totalIncome += tx.amount
    else totalExpense += tx.amount
  }

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    byMethod,
  }
}
