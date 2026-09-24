// hooks/useDebouncedValue.ts
'use client'

import { useEffect, useState } from 'react'

/** Devuelve `value` solo después de que deja de cambiar durante `delay` ms. */
export function useDebouncedValue<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(id)
    }, [value, delay])

    return debounced
}