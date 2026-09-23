import {
  Dialog,
  DialogContent,
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
  confirmText = 'Continuar',
  onConfirm,
  isPending = false,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[360px] gap-5 rounded-2xl p-5">

        {/* Reemplazamos DialogHeader por un div para garantizar la alineación a la izquierda */}
        <div className="flex flex-col space-y-1.5 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-[15px] text-muted-foreground text-pretty">
              {description}
            </DialogDescription>
          )}
        </div>

        {/* Botones lado a lado para quitar peso visual al color */}
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-11 w-full text-[15px]"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            className="h-11 w-full text-[15px]"
            onClick={onConfirm}
            disabled={isPending}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}