// Tipos de dominio de la aplicación.
// Diseñados para mapear 1:1 con la futura API de NestJS.

export interface Customer {
  name: string
  phone?: string
  address?: string
  email?: string
}

// ---------- Notas de venta ----------

export interface NoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  // importe = quantity * unitPrice (calculado)
}

export type NoteStatus = 'quote' | 'issued'

export interface Note {
  id: string
  folio: string
  customer: Customer
  items: NoteItem[]
  applyIva: boolean
  ivaRate: number // ej. 0.16
  notes?: string
  status: NoteStatus
  eventId?: string | null // vínculo opcional a un evento
  createdAt: string // ISO date
}

export interface NoteTotals {
  subtotal: number
  iva: number
  total: number
}

// ---------- Eventos ----------

export type EventStatus = 'pending' | 'delivered' | 'collected' | 'cancelled'

export interface EventContractInfo {
  guaranteeDocument?: string // ej. "INE / Credencial de elector"
  requiresSignature: boolean
  terms?: string
}

export interface BusinessEvent {
  id: string
  folio: string
  date: string // ISO date del evento
  serviceDescription: string
  cost: number
  customer: Customer
  eventAddress: string
  status: EventStatus
  noteId?: string | null // vínculo opcional a una nota de venta
  contract: EventContractInfo
  createdAt: string
  notes?: string
}

// ---------- Finanzas ----------

export type TransactionType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  type: TransactionType
}

export type PaymentMethodType = 'cash' | 'debit' | 'credit' | 'transfer' | 'other'

export interface PaymentMethod {
  id: string
  name: string
  type: PaymentMethodType
  initialBalance: number
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  paymentMethodId: string
  description: string
  date: string // ISO date
  eventId?: string | null // vínculo opcional a un evento
}

// ---------- Configuración del negocio (fase pública) ----------

export interface PaymentCard {
  id: string
  bank: string
  cardNumber: string
  clabe: string
  beneficiary: string
}

export interface BusinessConfig {
  name: string
  logoUrl?: string
  services: string[]
  phone?: string
  whatsapp?: string
  paymentCards: PaymentCard[]
  coverageAreas: string[]
}
