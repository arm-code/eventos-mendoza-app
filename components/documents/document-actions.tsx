'use client'

import { useRef, useState } from 'react'
import { Download, ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { exportNodeToImage, exportNodeToPdf } from '@/lib/export-document'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DocumentActionsProps {
  filename: string
  // El nodo visible en pantalla (responsive, adapta al viewport)
  children: React.ReactNode
  // El nodo que se captura al exportar (siempre 794px desktop)
  exportNode: React.ReactNode
  // Botones adicionales junto a Imagen/PDF (ej. Editar)
  extraActions?: React.ReactNode
}

export function DocumentActions({ filename, children, exportNode, extraActions }: DocumentActionsProps) {
  // Ref apunta al nodo off-screen de exportación (siempre 794px)
  const exportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null)

  async function handleExport(type: 'png' | 'pdf') {
    const node = exportRef.current as HTMLElement | null
    if (!node) return
    setExporting(type)
    try {
      if (type === 'png') {
        await exportNodeToImage(node, filename)
        toast.success('Imagen descargada exitosamente')
      } else {
        await exportNodeToPdf(node, filename)
        toast.success('PDF descargado exitosamente')
      }
    } catch (err) {
      console.error('[export error]', err)
      toast.error('No se pudo exportar el documento')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Nodo off-screen de 794px fijo — solo para exportar, nunca visible */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          zIndex: -1,
          width: 794,
          minWidth: 794,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div ref={exportRef} style={{ width: 794, backgroundColor: '#ffffff' }}>
          {exportNode}
        </div>
      </div>

      {/* Vista previa visible — responsive en mobile, sin restricción de ancho */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="w-full rounded-2xl border border-violet-100 bg-muted/30 p-2 sm:p-4">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Barra de acciones (Imagen y PDF) */}
      <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-xl border border-violet-100/90 p-2.5 rounded-2xl shadow-xl shadow-violet-900/10 print:hidden">
        <div className="flex items-center gap-2 justify-center flex-wrap max-w-xs sm:max-w-none mx-auto">
          {extraActions}
          <motion.div whileTap={{ scale: 0.94 }} className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 active:bg-violet-100 touch-manipulation gap-2 text-xs sm:text-sm font-semibold px-5",
                exporting === 'png' && "opacity-70"
              )}
              onClick={() => handleExport('png')}
              disabled={exporting !== null}
            >
              {exporting === 'png' ? (
                <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
              ) : (
                <ImageIcon className="h-4 w-4 text-violet-600" />
              )}
              <span>Imagen</span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.94 }} className="flex-1 sm:flex-none">
            <Button
              className={cn(
                "w-full sm:w-auto h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 active:scale-[0.98] transition-all touch-manipulation gap-2 text-xs sm:text-sm font-bold px-6",
                exporting === 'pdf' && "opacity-70"
              )}
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
            >
              {exporting === 'pdf' ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Download className="h-4 w-4 text-white" />
              )}
              <span>PDF</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}