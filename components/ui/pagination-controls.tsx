// components/ui/pagination-controls.tsx
'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TOUCH } from '@/components/ui/detail'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNextPage?: boolean
  hasPreviousPage?: boolean
}

/**
 * Anterior · Página X de Y · Siguiente.
 * Sin números de página: para listas cortas y usuarios no técnicos es más claro.
 */
export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
}: PaginationControlsProps) {
  const total = Math.max(1, Math.floor(Number(totalPages)) || 1)
  const page = Math.min(Math.max(1, Math.floor(Number(currentPage)) || 1), total)

  if (total <= 1) return null

  const canPrev = hasPreviousPage ?? page > 1
  const canNext = hasNextPage ?? page < total

  return (
    <nav aria-label="Paginación" className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <Button
        variant="outline"
        className={cn(TOUCH, 'justify-self-start px-3')}
        disabled={!canPrev}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden />
        Anterior
      </Button>
      <p className="text-sm tabular-nums text-muted-foreground" aria-live="polite">
        Página {page} de {total}
      </p>
      <Button
        variant="outline"
        className={cn(TOUCH, 'justify-self-end px-3')}
        disabled={!canNext}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
        <ChevronRight aria-hidden />
      </Button>
    </nav>
  )
}