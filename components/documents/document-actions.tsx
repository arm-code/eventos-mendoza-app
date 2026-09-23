// components/documents/document-actions.tsx
'use client'

import { useCallback, useRef, useState } from 'react'
import { AlertCircle, Download, FileText, Image as ImageIcon, Loader2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { exportNodeToImage, exportNodeToPdf } from '@/lib/export-document'

type ExportFormat = 'png' | 'pdf'
type ExportAction = 'share' | 'download'

interface DocumentActionsProps {
  filename: string
  /** Contenido que va antes de la barra (se conserva por compatibilidad). */
  children?: React.ReactNode
  exportNode: React.ReactNode
  title?: string
}

const TOUCH = 'h-12 rounded-xl text-[15px]'

/**
 * Barra para descargar o compartir un documento.
 * En móvil queda fija abajo; por eso DEBE ser el último elemento de la pantalla
 * o del sheet. El espaciador reserva exactamente su altura para que nada
 * quede escondido debajo.
 */
export function DocumentActions({ filename, children, exportNode, title }: DocumentActionsProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState<{ format: ExportFormat; action: ExportAction } | null>(null)
  const [pendingAction, setPendingAction] = useState<ExportAction | null>(null)

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      const action = pendingAction
      const node = exportRef.current
      if (!action) return
      if (!node) {
        toast.error('No se pudo preparar el documento. Intenta de nuevo.')
        return
      }

      setExporting({ format, action })
      setPendingAction(null)

      // Da tiempo a que cierre el diálogo antes de capturar
      await new Promise((resolve) => setTimeout(resolve, 150))

      try {
        const ext = format === 'png' ? 'png' : 'pdf'
        if (format === 'png') await exportNodeToImage(node, filename, action)
        else await exportNodeToPdf(node, filename, action)

        const what = format === 'png' ? 'Imagen lista' : 'Documento listo'
        toast.success(what, {
          description: action === 'download' ? `Se guardó como ${filename}.${ext}` : undefined,
        })
      } catch (err) {
        // Cancelar el menú de compartir del teléfono no es un error
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('[DocumentActions] export', err)
        toast.error('No se pudo preparar el documento', {
          description: 'Revisa tu conexión e intenta de nuevo.',
          icon: <AlertCircle aria-hidden />,
        })
      } finally {
        setExporting(null)
      }
    },
    [filename, pendingAction]
  )

  const busy = exporting !== null

  return (
    <>
      {/* Documento fuera de pantalla para exportar. Siempre en claro: es para imprimir/enviar. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          zIndex: -1,
          width: 794,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div ref={exportRef} className="bg-white text-neutral-950" style={{ width: 794 }}>
          {exportNode}
        </div>
      </div>

      {children}

      {/* Reserva el alto de la barra fija en móvil */}
      <div aria-hidden className="h-[calc(7rem+max(1rem,env(safe-area-inset-bottom)))] sm:hidden" />

      <div
        className={
          'fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-3 backdrop-blur-xl ' +
          'pb-[max(1rem,env(safe-area-inset-bottom))] ' +
          'sm:static sm:rounded-xl sm:border sm:bg-transparent sm:p-4 sm:backdrop-blur-none'
        }
      >
        {title && <p className="mb-2 text-center text-sm font-medium text-muted-foreground">{title}</p>}

        <div className="mx-auto grid w-full max-w-lg grid-cols-2 gap-2">
          <Button variant="outline" className={TOUCH} onClick={() => setPendingAction('download')} disabled={busy}>
            {exporting?.action === 'download' ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />}
            Descargar
          </Button>
          <Button className={TOUCH} onClick={() => setPendingAction('share')} disabled={busy}>
            {exporting?.action === 'share' ? <Loader2 className="animate-spin" aria-hidden /> : <Share2 aria-hidden />}
            Compartir
          </Button>
        </div>
      </div>

      {exporting && (
        <div
          role="status"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6">
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
            <p className="text-base font-medium">
              Preparando {exporting.format === 'pdf' ? 'documento' : 'imagen'}…
            </p>
          </div>
        </div>
      )}

      <Dialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-xl sm:w-full">
          <DialogHeader>
            <DialogTitle>¿Cómo quieres {pendingAction === 'share' ? 'compartirlo' : 'descargarlo'}?</DialogTitle>
          </DialogHeader>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="outline" className={TOUCH} onClick={() => handleExport('png')}>
              <ImageIcon aria-hidden />
              Imagen
            </Button>
            <Button className={TOUCH} onClick={() => handleExport('pdf')}>
              <FileText aria-hidden />
              Documento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}