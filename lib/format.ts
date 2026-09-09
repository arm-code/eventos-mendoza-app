// Utilidades de formato compartidas.

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatDate(iso: string): string {
  try {
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
    // Si es solo fecha, agregamos T12:00:00 para forzar mediodía local y evitar desfases
    const dateToFormat = isDateOnly ? new Date(`${iso}T12:00:00`) : new Date(iso);

    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(dateToFormat)
  } catch {
    return iso
  }
}

export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

// Genera un id simple para datos mock en el cliente.
export function genId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function toDateInputValue(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10)
  } catch {
    return ''
  }
}
