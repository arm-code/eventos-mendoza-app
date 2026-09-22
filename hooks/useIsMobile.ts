'use client'

import { useCallback, useSyncExternalStore } from 'react'

const DEFAULT_BREAKPOINT = 640 // mismo valor que el breakpoint `sm` de Tailwind

/**
 * Devuelve true cuando el viewport es menor al breakpoint.
 *
 * - Usa matchMedia: solo notifica cuando se cruza el breakpoint,
 *   no en cada píxel de resize como `window.resize`.
 * - useSyncExternalStore evita estados intermedios inconsistentes.
 * - En servidor devuelve false (no hay window).
 *
 * Nota: para mostrar/ocultar elementos prefiere clases CSS (`sm:hidden`,
 * `hidden sm:block`). Usa este hook solo cuando la lógica en JS lo requiera,
 * porque en el primer render del cliente siempre arranca en false.
 */
export function useIsMobile(breakpoint: number = DEFAULT_BREAKPOINT): boolean {
  // Valida el input: si llega algo raro, usa el valor por defecto
  const bp = Number.isFinite(breakpoint) && breakpoint > 0 ? Math.floor(breakpoint) : DEFAULT_BREAKPOINT
  const query = `(max-width: ${bp - 1}px)`

  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query]
  )

  const getSnapshot = () => window.matchMedia(query).matches
  const getServerSnapshot = () => false

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}