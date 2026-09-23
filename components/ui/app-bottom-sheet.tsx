// components/ui/app-bottom-sheet.tsx
'use client'

import { X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/utils'

interface AppBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: string
  children: React.ReactNode
  contentClassName?: string
  mobileHeight?: string
  /** Acción extra para la cabecera (ej. Botón de Editar) */
  headerAction?: React.ReactNode
}

export function AppBottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  contentClassName,
  mobileHeight = 'max-h-[92dvh]',
  headerAction,
}: AppBottomSheetProps) {
  const isMobile = useIsMobile()

  const mobileHeader = (title || description) && (
    <div className="sticky top-0 z-10 shrink-0 border-b bg-background/95 px-4 pb-3 pt-3 backdrop-blur-md">
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" aria-hidden />

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {title && (
            <SheetTitle className="truncate text-lg font-semibold leading-tight text-foreground">
              {title}
            </SheetTitle>
          )}
          {description && (
            <SheetDescription className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </SheetDescription>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {headerAction}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="size-11 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Cerrar"
          >
            <X className="size-5" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            'flex h-auto flex-col overflow-hidden rounded-t-3xl border-t bg-background p-0',
            mobileHeight
          )}
        >
          {mobileHeader}
          <div className={cn('flex-1 overflow-y-auto overflow-x-hidden p-4', contentClassName)}>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto p-6 sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          {(title || description) && (
            <DialogHeader className="text-left">
              {title && (
                <DialogTitle className="text-xl font-semibold text-foreground">
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription className="text-[15px] text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
          )}
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
        <div className={cn('overflow-x-hidden', contentClassName)}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}