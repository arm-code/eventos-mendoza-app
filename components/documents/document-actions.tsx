'use client'

import { useRef, useState } from 'react'
import { Download, ImageIcon, Loader2, FileText, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { exportNodeToImage, exportNodeToPdf } from '@/lib/export-document'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DocumentActionsProps {
  filename: string
  children: React.ReactNode
}

export function DocumentActions({ filename, children }: DocumentActionsProps) {
  const docRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null)
  const [showPreview, setShowPreview] = useState(true)

  async function handleExport(type: 'png' | 'pdf') {
    const node = docRef.current?.firstElementChild as HTMLElement | undefined
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

  function handlePrint() {
    window.print()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de acciones sticky en móvil */}
      <div className="sticky top-[49px] sm:top-0 z-20 -mx-3 px-3 sm:mx-0 sm:px-0 py-2 bg-gray-50/80 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none">
        <div className="flex flex-wrap gap-2">
          <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 active:bg-violet-100 touch-manipulation gap-2",
                exporting === 'png' && "opacity-70"
              )}
              onClick={() => handleExport('png')}
              disabled={exporting !== null}
            >
              {exporting === 'png' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Exportar imagen</span>
              <span className="sm:hidden">Imagen</span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
            <Button
              className={cn(
                "w-full sm:w-auto h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 active:scale-[0.98] transition-all touch-manipulation gap-2",
                exporting === 'pdf' && "opacity-70"
              )}
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
            >
              {exporting === 'pdf' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Exportar PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none sm:hidden">
            <Button
              variant="ghost"
              className="w-full h-11 rounded-xl text-violet-600 hover:bg-violet-50 active:bg-violet-100 touch-manipulation gap-2"
              onClick={() => setShowPreview(!showPreview)}
            >
              <FileText className="h-4 w-4" />
              {showPreview ? 'Ocultar' : 'Ver'}
            </Button>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }} className="hidden sm:flex">
            <Button
              variant="ghost"
              className="h-11 rounded-xl text-violet-600 hover:bg-violet-50 active:bg-violet-100 touch-manipulation gap-2"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Vista previa con scroll horizontal en móvil */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="overflow-auto rounded-xl border border-violet-100 bg-muted/30 p-3 sm:p-4 -mx-3 sm:mx-0">
              <div
                ref={docRef}
                style={{ minWidth: 320 }}
                className="mx-auto shadow-sm"
              >
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}