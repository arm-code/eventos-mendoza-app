import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  cancelText?: string
  confirmText?: string
  onConfirm: () => void
  isPending?: boolean
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = 'Cancelar',
  confirmText = 'Confirmar',
  onConfirm,
  isPending = false,
  variant = 'destructive',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl sm:w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {description && (
          <p className="text-[15px] text-muted-foreground text-pretty">
            {description}
          </p>
        )}
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="h-11 sm:h-10"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            className="h-11 sm:h-10"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Cargando...' : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
