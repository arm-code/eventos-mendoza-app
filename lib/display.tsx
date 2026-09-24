// lib/display.ts
// Utilidades de presentación compartidas (fechas, teléfonos, nombres de archivo).

const dateFmt = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
const dateWithYearFmt = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
})
const relativeFmt = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Convierte un valor de la API en Date.
 *
 * - dateOnly: true → fecha de calendario (fecha de un evento). Toma solo
 *   "YYYY-MM-DD" e ignora la hora, para que "2026-09-26T00:00:00Z" no se
 *   muestre como el 25 en México.
 * - dateOnly: false → instante real (createdAt). Respeta la zona horaria.
 */
export function parseDate(value?: string | null, { dateOnly = false } = {}): Date | null {
    if (!value) return null
    const m = dateOnly ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null
    const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Fecha legible + distancia ("Mañana", "En 3 días", "Hace 2 días").
 * Usa la fecha actual: llamar solo en el cliente (sheets, diálogos),
 * nunca en algo que se renderice en el servidor.
 */
export function describeDate(
    value?: string | null,
    options: { dateOnly?: boolean } = {}
): { label: string; relative: string; days: number } | null {
    const date = parseDate(value, options)
    if (!date) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
    // Math.round compensa los cambios de horario de verano
    const days = Math.round((target.getTime() - today.getTime()) / 86_400_000)

    const fmt = date.getFullYear() === today.getFullYear() ? dateFmt : dateWithYearFmt
    return {
        label: capitalize(fmt.format(date)),
        relative: capitalize(relativeFmt.format(days, 'day')),
        days,
    }
}

/**
 * Normaliza un teléfono mexicano a 10 dígitos.
 * Acepta "656 123 4567", "+52 656…", "52656…" y el antiguo "521…".
 * Devuelve null si no es válido (así no se generan enlaces rotos).
 */
export function toMxPhone(raw?: string | null): string | null {
    if (!raw) return null
    let digits = raw.replace(/\D/g, '')
    if (digits.length === 13 && digits.startsWith('521')) digits = digits.slice(3)
    else if (digits.length === 12 && digits.startsWith('52')) digits = digits.slice(2)
    return digits.length === 10 ? digits : null
}

export function formatMxPhone(digits: string): string {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

/** Nombre de archivo seguro: sin acentos, espacios ni caracteres especiales. */
export function toSlug(value?: string | null, fallback = 'documento'): string {
    const slug = (value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60)
    return slug || fallback
}

/** Número seguro a partir de un valor de la API. */
export function toNumber(value: unknown): number {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
}

/** Texto comparable para búsquedas: sin acentos y en minúsculas ("José" → "jose"). */
export function normalizeSearch(value?: string | null): string {
    return (value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
}