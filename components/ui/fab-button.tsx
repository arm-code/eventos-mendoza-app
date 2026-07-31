'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FabButtonProps {
  /** Icono a mostrar dentro del botón (ej. <PlusCircle className="h-6 w-6" />) */
  icon: React.ReactNode
  /** Texto que orienta al usuario sobre qué hace el botón */
  title: string
  /** Acción al pulsar el botón (onClick). Exclusivo con `href`. */
  onClick?: () => void
  /** Si el botón es un enlace de navegación. Exclusivo con `onClick`. */
  href?: string
  /** aria-label para accesibilidad */
  ariaLabel?: string
  /** Clases extra para el botón */
  className?: string
}

/**
 * Floating Action Button (FAB) reutilizable para mobile.
 * Solo visible en pantallas pequeñas (< sm).
 * Muestra un tooltip tipo "pill" a la izquierda del botón al hacer hover/focus,
 * y también al montar brevemente (3 seg) para orientar al usuario la primera vez.
 */
export function FabButton({ icon, title, onClick, href, ariaLabel, className }: FabButtonProps) {
  const [labelVisible, setLabelVisible] = useState(true)

  // Ocultar automáticamente la etiqueta tras 3 segundos al montar
  useEffect(() => {
    const t = setTimeout(() => setLabelVisible(false), 3000)
    return () => clearTimeout(t)
  }, [])

  const buttonClass = cn(
    'flex items-center justify-center w-14 h-14 rounded-full',
    'bg-violet-600 text-white shadow-xl shadow-violet-600/30',
    'active:bg-violet-700 touch-manipulation',
    className
  )

  const handleMouseEnter = () => setLabelVisible(true)
  const handleMouseLeave = () => setLabelVisible(false)
  const handleFocus = () => setLabelVisible(true)
  const handleBlur = () => setLabelVisible(false)

  const label = (
    <AnimatePresence>
      {labelVisible && (
        <motion.span
          key="fab-label"
          initial={{ opacity: 0, x: 8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 8, scale: 0.95 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={cn(
            'absolute right-16 top-1/2 -translate-y-1/2',
            'bg-violet-900/90 backdrop-blur-sm text-white text-xs font-semibold',
            'px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg',
            'pointer-events-none select-none'
          )}
        >
          {title}
        </motion.span>
      )}
    </AnimatePresence>
  )

  const content = (
    <div
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label={ariaLabel ?? title}
        className={buttonClass}
        type="button"
      >
        {icon}
      </motion.button>
    </div>
  )

  return (
    <div className="sm:hidden fixed bottom-[72px] right-4 z-30">
      {href ? (
        <Link href={href} aria-label={ariaLabel ?? title}>
          <div
            className="relative flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {label}
            <motion.div
              whileTap={{ scale: 0.88 }}
              className={buttonClass}
            >
              {icon}
            </motion.div>
          </div>
        </Link>
      ) : (
        content
      )}
    </div>
  )
}
