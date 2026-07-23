'use client'

import { useRef, useState } from 'react'
import { Download, ImageIcon, Loader2, Printer } from 'lucide-react'
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
    <div className="flex flex-col gap-4 pb-20 sm:pb-16">
      {/* Vista previa del documento con scroll horizontal en móvil */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="overflow-auto rounded-2xl border border-violet-100 bg-muted/30 p-3 sm:p-4 -mx-3 sm:mx-0">
            <div
              ref={docRef}
              style={{ minWidth: 320 }}
              className="mx-auto shadow-sm"
            >
              {children}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Barra de 3 acciones fijada en la parte inferior (arriba del AdminBottomNav en móvil) */}
      <div className="fixed bottom-[68px] sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-40 bg-white/95 backdrop-blur-xl border border-violet-100/90 p-2 rounded-2xl shadow-xl shadow-violet-900/10 print:hidden">
        <div className="flex items-center gap-2 justify-center max-w-md sm:max-w-none mx-auto">
          <motion.div whileTap={{ scale: 0.94 }} className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 active:bg-violet-100 touch-manipulation gap-2 text-xs sm:text-sm font-semibold",
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
                "w-full sm:w-auto h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 active:scale-[0.98] transition-all touch-manipulation gap-2 text-xs sm:text-sm font-bold",
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

          <motion.div whileTap={{ scale: 0.94 }} className="flex-1 sm:flex-none">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-11 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 active:bg-violet-100 touch-manipulation gap-2 text-xs sm:text-sm font-semibold"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 text-violet-600" />
              <span>Imprimir</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}