'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
                className
            )}
        >
            <div className="space-y-1 min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-violet-950 text-balance leading-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm leading-relaxed text-violet-600/80 text-pretty max-w-2xl">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div className="flex shrink-0 items-center gap-2 sm:pt-1">
                    {action}
                </div>
            )}
        </motion.div>
    )
}