// lib/bank.ts
// Validación y formato de CLABE y tarjetas (México).

export const digitsOnly = (value?: string | null) => (value ?? '').replace(/\D/g, '')

/** Dígito verificador de la CLABE: pesos 3-7-1 sobre los primeros 17 dígitos. */
export function isValidClabe(clabe: string): boolean {
    if (!/^\d{18}$/.test(clabe)) return false
    const weights = [3, 7, 1]
    let sum = 0
    for (let i = 0; i < 17; i++) sum += (Number(clabe[i]) * weights[i % 3]) % 10
    return (10 - (sum % 10)) % 10 === Number(clabe[17])
}

/** Algoritmo de Luhn para números de tarjeta. */
export function isValidCardNumber(card: string): boolean {
    if (!/^\d{15,16}$/.test(card)) return false
    let sum = 0
    for (let i = 0; i < card.length; i++) {
        let d = Number(card[card.length - 1 - i])
        if (i % 2 === 1) {
            d *= 2
            if (d > 9) d -= 9
        }
        sum += d
    }
    return sum % 10 === 0
}

// Primeros 3 dígitos de la CLABE → banco. Solo los más comunes; si no está, el usuario lo escribe.
const BANKS_BY_CODE: Record<string, string> = {
    '002': 'Banamex',
    '012': 'BBVA',
    '014': 'Santander',
    '021': 'HSBC',
    '030': 'BanBajío',
    '036': 'Inbursa',
    '044': 'Scotiabank',
    '058': 'Banregio',
    '062': 'Afirme',
    '072': 'Banorte',
    '127': 'Banco Azteca',
    '130': 'Compartamos',
    '137': 'BanCoppel',
    '166': 'Banco del Bienestar',
    '638': 'Nu',
    '646': 'STP',
    '722': 'Mercado Pago',
}

export function bankFromClabe(clabe: string): string | null {
    return clabe.length >= 3 ? BANKS_BY_CODE[clabe.slice(0, 3)] ?? null : null
}

/** Grupos de 4 para leer o dictar: "0121 8000 1234 5678 90". */
export const formatInGroups = (digits: string) => digits.replace(/(\d{4})(?=\d)/g, '$1 ')