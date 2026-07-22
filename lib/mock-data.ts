import type {
  BusinessConfig,
  BusinessEvent,
  Category,
  Note,
  PaymentMethod,
  Transaction,
} from './types'

// Datos de prueba en memoria. Se sustituirán por la API de NestJS.

export const seedCategories: Category[] = [
  { id: 'cat-1', name: 'Renta de mobiliario', type: 'income' },
  { id: 'cat-2', name: 'Servicio de montaje', type: 'income' },
  { id: 'cat-3', name: 'Anticipos de clientes', type: 'income' },
  { id: 'cat-4', name: 'Combustible', type: 'expense' },
  { id: 'cat-5', name: 'Mantenimiento', type: 'expense' },
  { id: 'cat-6', name: 'Sueldos', type: 'expense' },
  { id: 'cat-7', name: 'Compra de inventario', type: 'expense' },
]

export const seedPaymentMethods: PaymentMethod[] = [
  { id: 'pm-1', name: 'Efectivo', type: 'cash', initialBalance: 5000 },
  { id: 'pm-2', name: 'Tarjeta Débito BBVA', type: 'debit', initialBalance: 18500 },
  { id: 'pm-3', name: 'Transferencia Santander', type: 'transfer', initialBalance: 9200 },
]

export const seedEvents: BusinessEvent[] = [
  {
    id: 'evt-1',
    folio: 'EV-0001',
    date: futureDate(6),
    serviceDescription: 'Boda jardín: 120 sillas Tiffany, 12 mesas redondas, carpa 6x12, pista.',
    cost: 18500,
    customer: {
      name: 'María Fernanda López',
      phone: '55 1234 5678',
      address: 'Av. Reforma 123, Col. Centro',
    },
    eventAddress: 'Jardín Los Encinos, Carr. Federal km 4',
    status: 'pending',
    noteId: null,
    contract: { requiresSignature: true, guaranteeDocument: 'INE / Credencial de elector' },
    createdAt: pastDate(3),
    notes: 'Entregar un día antes a las 5pm.',
  },
  {
    id: 'evt-2',
    folio: 'EV-0002',
    date: futureDate(12),
    serviceDescription: 'XV años: 80 sillas plegables acojinadas, 8 mesas, mantelería blanca.',
    cost: 9800,
    customer: { name: 'Jorge Ramírez', phone: '55 8765 4321' },
    eventAddress: 'Salón Cristal, Calle 5 de Mayo 45',
    status: 'pending',
    noteId: null,
    contract: { requiresSignature: true, guaranteeDocument: 'INE' },
    createdAt: pastDate(1),
  },
  {
    id: 'evt-3',
    folio: 'EV-0003',
    date: pastDate(8),
    serviceDescription: 'Evento corporativo: 200 sillas, templete, sonido básico.',
    cost: 24000,
    customer: { name: 'Corporativo Delta SA', phone: '55 2222 1111' },
    eventAddress: 'Centro de Convenciones, Local 3',
    status: 'collected',
    noteId: null,
    contract: { requiresSignature: true, guaranteeDocument: 'Acta constitutiva' },
    createdAt: pastDate(20),
  },
]

export const seedNotes: Note[] = [
  {
    id: 'note-1',
    folio: 'NV-0001',
    customer: { name: 'María Fernanda López', phone: '55 1234 5678' },
    items: [
      { id: 'it-1', description: 'Renta silla Tiffany', quantity: 120, unitPrice: 35 },
      { id: 'it-2', description: 'Renta mesa redonda 1.5m', quantity: 12, unitPrice: 120 },
      { id: 'it-3', description: 'Carpa 6x12m con instalación', quantity: 1, unitPrice: 7500 },
    ],
    applyIva: false,
    ivaRate: 0.16,
    status: 'quote',
    eventId: null,
    createdAt: pastDate(4),
    notes: 'Cotización sujeta a disponibilidad de fecha.',
  },
  {
    id: 'note-2',
    folio: 'NV-0002',
    customer: { name: 'Jorge Ramírez', phone: '55 8765 4321' },
    items: [
      { id: 'it-4', description: 'Renta silla acojinada', quantity: 80, unitPrice: 25 },
      { id: 'it-5', description: 'Mantelería blanca', quantity: 8, unitPrice: 90 },
    ],
    applyIva: true,
    ivaRate: 0.16,
    status: 'issued',
    eventId: null,
    createdAt: pastDate(2),
  },
]

export const seedTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 9000,
    categoryId: 'cat-3',
    paymentMethodId: 'pm-3',
    description: 'Anticipo boda María Fernanda',
    date: pastDate(3),
    eventId: 'evt-1',
  },
  {
    id: 'tx-2',
    type: 'income',
    amount: 24000,
    categoryId: 'cat-1',
    paymentMethodId: 'pm-2',
    description: 'Liquidación evento corporativo Delta',
    date: pastDate(8),
    eventId: 'evt-3',
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 1200,
    categoryId: 'cat-4',
    paymentMethodId: 'pm-1',
    description: 'Gasolina camioneta de reparto',
    date: pastDate(7),
    eventId: null,
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 3500,
    categoryId: 'cat-7',
    paymentMethodId: 'pm-2',
    description: 'Compra de 20 sillas nuevas',
    date: pastDate(5),
    eventId: null,
  },
  {
    id: 'tx-5',
    type: 'income',
    amount: 4500,
    categoryId: 'cat-2',
    paymentMethodId: 'pm-1',
    description: 'Servicio de montaje XV años',
    date: pastDate(1),
    eventId: 'evt-2',
  },
]

export const seedBusinessConfig: BusinessConfig = {
  name: 'Renta de Mobiliario El Encanto',
  services: ['Sillas y mesas', 'Carpas', 'Mantelería', 'Pistas de baile', 'Montaje'],
  phone: '55 1234 5678',
  whatsapp: '5215512345678',
  paymentCards: [
    {
      id: 'card-1',
      bank: 'BBVA',
      cardNumber: '4152 3138 1234 5678',
      clabe: '012180012345678901',
      beneficiary: 'Renta de Mobiliario El Encanto SA de CV',
    },
  ],
  coverageAreas: ['Ciudad principal', 'Zona metropolitana', 'Municipios aledaños'],
}

// Helpers de fechas relativas
function futureDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function pastDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}
