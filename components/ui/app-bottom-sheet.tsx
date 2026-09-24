// components/ui/app-bottom-sheet.tsx
'use client'

import { X } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/utils'

interface AppBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: string
  children: React.ReactNode
  /** Barra fija inferior (ej. DocumentActions con placement="inline"). */
  footer?: React.ReactNode
  contentClassName?: string
  mobileHeight?: string
  /** Acción extra en la cabecera (ej. botón de editar). */
  headerAction?: React.ReactNode
}

/**
 * Bottom sheet en móvil, diálogo en escritorio. Misma estructura en ambos:
 * cabecera fija · contenido con scroll · pie fijo opcional.
 * El padding lo pone este componente; el contenido no debe agregar padding lateral.
 */
export function AppBottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName,
  mobileHeight = 'max-h-[92dvh]',
  headerAction,
}: AppBottomSheetProps) {
  const isMobile = useIsMobile()
  const Title = isMobile ? SheetTitle : DialogTitle
  const Description = isMobile ? SheetDescription : DialogDescription

  const header = (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4">
      <div className="min-w-0 flex-1">
        {/* Radix exige un título accesible aunque no se muestre */}
        <Title className={cn('truncate text-lg font-semibold leading-tight', !title && 'sr-only')}>
          {title || 'Detalle'}
        </Title>
        {description && (
          <Description className="mt-0.5 text-sm text-muted-foreground">{description}</Description>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {headerAction}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="size-11 rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Cerrar"
        >
          <X className="size-5" aria-hidden />
        </Button>
      </div>
    </div>
  )

  const body = (
    <div className={cn('flex-1 overflow-y-auto overflow-x-hidden px-4 pb-8 pt-5 sm:px-6', contentClassName)}>
      {children}
    </div>
  )

  const foot = footer && (
    <div className="shrink-0 border-t bg-background px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
      {footer}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className={cn('flex h-auto flex-col gap-0 overflow-hidden rounded-t-3xl border-t bg-background p-0', mobileHeight)}
        >
          {header}
          {body}
          {foot}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl"
      >
        {header}
        {body}
        {foot}
      </DialogContent>
    </Dialog>
  )
}