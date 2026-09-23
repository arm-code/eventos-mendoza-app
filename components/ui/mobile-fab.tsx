'use client'

import * as React from "react"
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MobileFabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  title?: string
  href?: string
}

export const MobileFab = React.forwardRef<HTMLButtonElement, MobileFabProps>(
  ({ className, icon, title, href, onClick, 'aria-label': ariaLabel, ...props }, ref) => {
    const [labelVisible, setLabelVisible] = React.useState(true)

    // Ocultar automáticamente la etiqueta tras 3 segundos al montar
    React.useEffect(() => {
      const t = setTimeout(() => setLabelVisible(false), 3000)
      return () => clearTimeout(t)
    }, [])

    const handleMouseEnter = () => setLabelVisible(true)
    const handleMouseLeave = () => setLabelVisible(false)
    const handleFocus = () => setLabelVisible(true)
    const handleBlur = () => setLabelVisible(false)

    const label = title ? (
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
              'bg-foreground/90 backdrop-blur-sm text-background text-xs font-semibold',
              'px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg',
              'pointer-events-none select-none'
            )}
          >
            {title}
          </motion.span>
        )}
      </AnimatePresence>
    ) : null

    const buttonClass = cn(
      'flex size-14 items-center justify-center rounded-full',
      'bg-primary text-primary-foreground shadow-lg shadow-primary/25',
      'transition-transform active:scale-95 motion-reduce:transition-none',
      'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 cursor-pointer',
      className
    )

    const innerContent = icon || <Plus className="size-6" strokeWidth={2.5} aria-hidden />

    return (
      <div
        className={cn(
          'fixed right-4 z-40 sm:hidden',
          'bottom-[calc(5rem+env(safe-area-inset-bottom))]'
        )}
      >
        <div
          className="relative flex items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {label}
          {href ? (
            <Link
              href={href}
              aria-label={ariaLabel ?? title}
              className={buttonClass}
              {...(props as any)}
            >
              {innerContent}
            </Link>
          ) : (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onClick}
              onFocus={handleFocus}
              onBlur={handleBlur}
              aria-label={ariaLabel ?? title}
              className={buttonClass}
              type="button"
              ref={ref}
              {...(props as any)}
            >
              {innerContent}
            </motion.button>
          )}
        </div>
      </div>
    )
  }
)
MobileFab.displayName = "MobileFab"
