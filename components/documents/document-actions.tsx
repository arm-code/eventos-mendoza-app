'use client'

import { useRef, useState } from 'react'
import { Download, ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { exportNodeToImage, exportNodeToPdf } from '@/lib/export-document'

interface DocumentActionsProps {
  filename: string
  children: React.ReactNode
}

// Renderiza el documento (children) dentro de un contenedor con scroll
// y ofrece los botones de exportar a imagen / PDF.
export function DocumentActions({ filename, children }: DocumentActionsProps) {
  const docRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null)

  async function handleExport(type: 'png' | 'pdf') {
    const node = docRef.current?.firstElementChild as HTMLElement | undefined
    if (!node) return
    setExporting(type)
    try {
      if (type === 'png') {
        await exportNodeToImage(node, filename)
        toast.success('Imagen descargada')
      } else {
        await exportNodeToPdf(node, filename)
        toast.success('PDF descargado')
      }
    } catch (err) {
      console.error('[v0] export error', err)
      toast.error('No se pudo exportar el documento')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="flex-1 sm:flex-none"
          onClick={() => handleExport('png')}
          disabled={exporting !== null}
        >
          {exporting === 'png' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          Exportar imagen
        </Button>
        <Button
          className="flex-1 sm:flex-none"
          onClick={() => handleExport('pdf')}
          disabled={exporting !== null}
        >
          {exporting === 'pdf' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportar PDF
        </Button>
      </div>

      {/* Vista previa con scroll horizontal en móvil */}
      <div className="overflow-auto rounded-lg border bg-muted/40 p-4">
        <div ref={docRef} style={{ width: 794 }} className="mx-auto shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
