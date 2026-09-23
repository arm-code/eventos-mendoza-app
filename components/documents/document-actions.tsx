// components/documents/document-actions.tsx
'use client'

import { useRef, useState, useCallback } from 'react'
import { Download, Image as ImageIcon, Loader2, AlertCircle, Share2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { exportNodeToImage, exportNodeToPdf } from '@/lib/export-document'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface DocumentActionsProps {
  filename: string
  children?: React.ReactNode
  exportNode: React.ReactNode
  title?: string
}

export function DocumentActions({ filename, children, exportNode, title }: DocumentActionsProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState<{ format: 'png' | 'pdf', action: 'share' | 'download' } | null>(null)
  const [showConfirm, setShowConfirm] = useState<'share' | 'download' | null>(null)

  const handleExport = useCallback(async (format: 'png' | 'pdf', action: 'share' | 'download') => {
    const node = exportRef.current
    if (!node) {
      toast.error('Ocurrió un problema al preparar el documento.')
      return
    }

    setExporting({ format, action })
    setShowConfirm(null)

    await new Promise((resolve) => setTimeout(resolve, 150))

    try {
      if (format === 'png') {
        await exportNodeToImage(node, filename, action)
        toast.success('Imagen lista', { description: `Se guardó como ${filename}.png` })
      } else {
        await exportNodeToPdf(node, filename, action)
        toast.success('Documento listo', { description: `Se guardó como ${filename}.pdf` })
      }
    } catch (err) {
      console.error('[export error]', err)
      toast.error('No se pudo procesar el documento', {
        description: 'Revisa tu conexión o intenta de nuevo.',
        icon: <AlertCircle aria-hidden />,
      })
    } finally {
      setExporting(null)
    }
  }, [filename])

  return (
    <div className={cn("relative", children ? "flex flex-col gap-4 pb-28 sm:pb-0" : "")}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          zIndex: -1,
          width: 794,
          minWidth: 794,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div ref={exportRef} className="bg-background text-foreground" style={{ width: 794 }}>
          {exportNode}
        </div>
      </div>

      {children && (
        <div className="pt-2">
          {children}
        </div>
      )}

      {/* ── Barra de acciones inferior ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:rounded-xl sm:border sm:p-5 sm:shadow-none">
        {title && (
          <div className="mb-3 text-center">
            <span className="text-xs font-semibold text-muted-foreground">{title}</span>
          </div>
        )}

        <div className="mx-auto flex w-full max-w-lg gap-3">
          <Button
            variant="outline"
            className="h-12 flex-1 text-[15px]"
            onClick={() => setShowConfirm('download')}
            disabled={exporting !== null}
          >
            {exporting?.action === 'download' ? (
              <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
            ) : (
              <Download className="mr-2 size-5" aria-hidden />
            )}
            Descargar
          </Button>

          <Button
            className="h-12 flex-1 text-[15px]"
            onClick={() => setShowConfirm('share')}
            disabled={exporting !== null}
          >
            {exporting?.action === 'share' ? (
              <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
            ) : (
              <Share2 className="mr-2 size-5" aria-hidden />
            )}
            Compartir
          </Button>
        </div>
      </div>

      {exporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 shadow-lg">
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
            <p className="text-base font-semibold">
              Preparando {exporting.format === 'pdf' ? 'documento' : 'imagen'}...
            </p>
          </div>
        </div>
      )}

      <Dialog open={showConfirm !== null} onOpenChange={(open) => !open && setShowConfirm(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-xl sm:w-full">
          <DialogHeader>
            <DialogTitle>
              ¿Cómo quieres {showConfirm === 'share' ? 'compartir' : 'descargar'}?
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="h-11 flex-1" onClick={() => handleExport('png', showConfirm!)}>
              <ImageIcon className="mr-2 size-4" aria-hidden />
              Imagen
            </Button>
            <Button className="h-11 flex-1" onClick={() => handleExport('pdf', showConfirm!)}>
              <FileText className="mr-2 size-4" aria-hidden />
              Documento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}