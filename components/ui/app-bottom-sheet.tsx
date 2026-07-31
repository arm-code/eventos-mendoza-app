'use client'

import { X } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/utils'

interface AppBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Título que aparece en el header del sheet/dialog */
  title?: React.ReactNode
  /** Subtítulo/descripción debajo del título */
  description?: string
  /** Contenido variable de cada sección */
  children: React.ReactNode
  /** Clases extra para el wrapper del contenido */
  contentClassName?: string
  /** Altura del sheet en móvil. Default: "max-h-[92dvh]" */
  mobileHeight?: string
}

/**
 * Cascarón reutilizable para Sheet (móvil) + Dialog (desktop).
 * Incluye: handle iOS-style, header con título/descripción, botón X para cerrar,
 * y slot `children` para el contenido variable de cada sección.
 */
export function AppBottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  contentClassName,
  mobileHeight = 'max-h-[92dvh]',
}: AppBottomSheetProps) {
  const isMobile = useIsMobile()

  const header = (title || description) && (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 pt-3 pb-2 border-b border-violet-100/50 flex-shrink-0">
      {/* Handle iOS-style */}
      <div className="w-10 h-1 rounded-full bg-violet-200 mx-auto mb-3" />

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {title && (
            <h2 className="text-lg font-bold text-violet-950 leading-tight truncate">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-violet-500 mt-0.5">{description}</p>
          )}
        </div>

        {/* Botón cerrar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="h-9 w-9 shrink-0 rounded-full hover:bg-violet-50 active:bg-violet-100 transition-colors text-violet-400 hover:text-violet-600"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            'h-auto rounded-t-3xl border-t border-violet-100 bg-white p-0 flex flex-col overflow-hidden',
            mobileHeight
          )}
        >
          {header}
          <div className={cn('flex-1 overflow-y-auto px-4 py-4 overflow-x-hidden', contentClassName)}>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto rounded-2xl border-violet-100 bg-white p-5 sm:p-6">
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle className="text-xl font-bold text-violet-950">
                {title}
              </DialogTitle>
            )}
            {description && (
              <p className="text-sm text-violet-500">{description}</p>
            )}
          </DialogHeader>
        )}
        <div className={cn('overflow-x-hidden', contentClassName)}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
