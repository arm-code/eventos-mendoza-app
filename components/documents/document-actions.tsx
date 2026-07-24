'use client'

import { useRef, useState, useCallback } from 'react'
import { Download, ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { exportNodeToImage, exportNodeToPdf } from '@/lib/export-document'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DocumentActionsProps {
  filename: string
  /** El nodo visible en pantalla (responsive, adapta al viewport) */
  children?: React.ReactNode
  /** El nodo que se captura al exportar (siempre 794px desktop) */
  exportNode: React.ReactNode
  /** Botones adicionales junto a Imagen/PDF (ej. Editar) */
  extraActions?: React.ReactNode
}

export function DocumentActions({ filename, children, exportNode, extraActions }: DocumentActionsProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null)
  const [showConfirm, setShowConfirm] = useState<'png' | 'pdf' | null>(null)

  // ── Export Handler ──
  const handleExport = useCallback(async (type: 'png' | 'pdf') => {
    const node = exportRef.current
    if (!node) {
      toast.error('Error interno: nodo de exportación no disponible')
      return
    }

    setExporting(type)
    setShowConfirm(null)

    // Pequeño delay para permitir que el UI se actualice antes del proceso pesado
    await new Promise((resolve) => setTimeout(resolve, 100))

    try {
      if (type === 'png') {
        await exportNodeToImage(node, filename)
        toast.success('Imagen descargada exitosamente', {
          description: `${filename}.png`,
          duration: 3000,
        })
      } else {
        await exportNodeToPdf(node, filename)
        toast.success('PDF descargado exitosamente', {
          description: `${filename}.pdf`,
          duration: 3000,
        })
      }
    } catch (err) {
      console.error('[export error]', err)
      toast.error('No se pudo exportar el documento', {
        description: 'Verifica tu conexión o intenta de nuevo.',
        icon: <AlertCircle className="h-4 w-4" />,
      })
    } finally {
      setExporting(null)
    }
  }, [filename])

  // ── Confirm Dialog for Mobile ──
  const ExportConfirmDialog = () => {
    if (!showConfirm) return null
    const isPdf = showConfirm === 'pdf'

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={() => setShowConfirm(null)}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-violet-950 mb-1">
            {isPdf ? 'Descargar PDF' : 'Descargar Imagen'}
          </h3>
          <p className="text-sm text-violet-600 mb-5">
            Se generará un archivo de alta calidad listo para imprimir o compartir.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold"
              onClick={() => setShowConfirm(null)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-600/20"
              onClick={() => handleExport(showConfirm)}
            >
              <Download className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className={cn("relative", children ? "flex flex-col gap-4 pb-24 sm:pb-0" : "")}>
      {/* ── Off-screen Export Node ── */}
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
        <div ref={exportRef} className="bg-white" style={{ width: 794 }}>
          {exportNode}
        </div>
      </div>

      {/* ── Visible Preview ── */}
      <AnimatePresence mode="wait">
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="w-full rounded-2xl border border-violet-100 bg-violet-50/30 p-2 sm:p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Action Bar (Mobile-Optimized) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:relative sm:bottom-auto sm:left-auto sm:right-auto">
        {/* Safe area padding for iOS */}
        <div className="bg-white/95 backdrop-blur-xl border-t border-violet-100/90 p-3 sm:p-4 pb-[max(12px,env(safe-area-inset-bottom))] sm:pb-4 shadow-[0_-4px_20px_rgba(124,58,237,0.08)] sm:shadow-none sm:border sm:rounded-2xl sm:bg-white/80">
          <div className="flex items-center gap-2 sm:gap-3 justify-center max-w-lg mx-auto">
            {extraActions}

            {/* PNG Export Button */}
            <motion.div whileTap={{ scale: 0.96 }} className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 sm:h-11 rounded-xl border-violet-200 text-violet-700",
                  "hover:bg-violet-50 active:bg-violet-100 active:scale-[0.98]",
                  "touch-manipulation gap-2 text-sm font-semibold px-5",
                  "transition-all duration-150",
                  exporting === 'png' && "opacity-60 pointer-events-none"
                )}
                onClick={() => setShowConfirm('png')}
                disabled={exporting !== null}
                style={{ touchAction: 'manipulation' }}
              >
                {exporting === 'png' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-violet-600" />
                )}
                <span className="hidden sm:inline">Imagen</span>
                <span className="sm:hidden">IMG</span>
              </Button>
            </motion.div>

            {/* PDF Export Button */}
            <motion.div whileTap={{ scale: 0.96 }} className="flex-1 sm:flex-none">
              <Button
                className={cn(
                  "w-full h-12 sm:h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white",
                  "shadow-lg shadow-violet-600/20 active:scale-[0.98]",
                  "touch-manipulation gap-2 text-sm font-bold px-6",
                  "transition-all duration-150",
                  exporting === 'pdf' && "opacity-60 pointer-events-none"
                )}
                onClick={() => setShowConfirm('pdf')}
                disabled={exporting !== null}
                style={{ touchAction: 'manipulation' }}
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

      {/* ── Loading Overlay ── */}
      <AnimatePresence>
        {exporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-2xl border border-violet-100 flex flex-col items-center gap-3"
            >
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              <p className="text-sm font-semibold text-violet-900">
                Generando {exporting === 'pdf' ? 'PDF' : 'imagen'}...
              </p>
              <p className="text-xs text-violet-500">Esto puede tomar unos segundos</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm Dialog ── */}
      <AnimatePresence>
        {showConfirm && <ExportConfirmDialog />}
      </AnimatePresence>
    </div>
  )
}