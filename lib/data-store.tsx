'use client'

// Fuente única de verdad para los datos mock en memoria.
// Toda la lógica CRUD vive aquí; cuando se conecte la API NestJS,
// basta con reemplazar el cuerpo de cada método por una llamada HTTP.

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { genId } from './format'
import {
  seedCategories,
  seedEvents,
  seedNotes,
  seedPaymentMethods,
  seedTransactions,
} from './mock-data'
import type {
  BusinessEvent,
  Category,
  Note,
  PaymentMethod,
  Transaction,
} from './types'

interface DataStore {
  notes: Note[]
  events: BusinessEvent[]
  transactions: Transaction[]
  categories: Category[]
  paymentMethods: PaymentMethod[]

  // Notas
  createNote: (note: Omit<Note, 'id' | 'folio' | 'createdAt'>) => Note
  updateNote: (id: string, patch: Partial<Note>) => void
  deleteNote: (id: string) => void

  // Eventos
  createEvent: (event: Omit<BusinessEvent, 'id' | 'folio' | 'createdAt'>) => BusinessEvent
  updateEvent: (id: string, patch: Partial<BusinessEvent>) => void

  // Transacciones
  createTransaction: (tx: Omit<Transaction, 'id'>) => Transaction
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Categorías
  createCategory: (cat: Omit<Category, 'id'>) => Category
  updateCategory: (id: string, patch: Partial<Category>) => void
  deleteCategory: (id: string) => void

  // Métodos de pago
  createPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => PaymentMethod
  updatePaymentMethod: (id: string, patch: Partial<PaymentMethod>) => void
  deletePaymentMethod: (id: string) => void
}

const DataContext = createContext<DataStore | null>(null)

function nextFolio(prefix: string, existing: { folio: string }[]): string {
  const nums = existing
    .map((e) => Number.parseInt(e.folio.replace(/\D/g, ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `${prefix}-${String(max + 1).padStart(4, '0')}`
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(seedNotes)
  const [events, setEvents] = useState<BusinessEvent[]>(seedEvents)
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions)
  const [categories, setCategories] = useState<Category[]>(seedCategories)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(seedPaymentMethods)

  // ---- Notas ----
  const createNote = useCallback<DataStore['createNote']>((data) => {
    const note: Note = {
      ...data,
      id: genId('note'),
      folio: nextFolio('NV', notes),
      createdAt: new Date().toISOString(),
    }
    setNotes((prev) => [note, ...prev])
    return note
  }, [notes])

  const updateNote = useCallback<DataStore['updateNote']>((id, patch) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  }, [])

  const deleteNote = useCallback<DataStore['deleteNote']>((id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // ---- Eventos ----
  const createEvent = useCallback<DataStore['createEvent']>((data) => {
    const event: BusinessEvent = {
      ...data,
      id: genId('evt'),
      folio: nextFolio('EV', events),
      createdAt: new Date().toISOString(),
    }
    setEvents((prev) => [event, ...prev])
    return event
  }, [events])

  const updateEvent = useCallback<DataStore['updateEvent']>((id, patch) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }, [])

  // ---- Transacciones ----
  const createTransaction = useCallback<DataStore['createTransaction']>((data) => {
    const tx: Transaction = { ...data, id: genId('tx') }
    setTransactions((prev) => [tx, ...prev])
    return tx
  }, [])

  const updateTransaction = useCallback<DataStore['updateTransaction']>((id, patch) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  const deleteTransaction = useCallback<DataStore['deleteTransaction']>((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ---- Categorías ----
  const createCategory = useCallback<DataStore['createCategory']>((data) => {
    const cat: Category = { ...data, id: genId('cat') }
    setCategories((prev) => [...prev, cat])
    return cat
  }, [])

  const updateCategory = useCallback<DataStore['updateCategory']>((id, patch) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const deleteCategory = useCallback<DataStore['deleteCategory']>((id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // ---- Métodos de pago ----
  const createPaymentMethod = useCallback<DataStore['createPaymentMethod']>((data) => {
    const pm: PaymentMethod = { ...data, id: genId('pm') }
    setPaymentMethods((prev) => [...prev, pm])
    return pm
  }, [])

  const updatePaymentMethod = useCallback<DataStore['updatePaymentMethod']>((id, patch) => {
    setPaymentMethods((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const deletePaymentMethod = useCallback<DataStore['deletePaymentMethod']>((id) => {
    setPaymentMethods((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const value = useMemo<DataStore>(
    () => ({
      notes,
      events,
      transactions,
      categories,
      paymentMethods,
      createNote,
      updateNote,
      deleteNote,
      createEvent,
      updateEvent,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      createCategory,
      updateCategory,
      deleteCategory,
      createPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
    }),
    [
      notes,
      events,
      transactions,
      categories,
      paymentMethods,
      createNote,
      updateNote,
      deleteNote,
      createEvent,
      updateEvent,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      createCategory,
      updateCategory,
      deleteCategory,
      createPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataStore {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>')
  return ctx
}
