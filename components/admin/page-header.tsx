interface PageHeaderProps {
    title: string
    description?: string
    action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-violet-950 sm:text-3xl text-balance">{title}</h1>
                {description && (
                    <p className="text-sm leading-relaxed text-violet-600/80 text-pretty">
                        {description}
                    </p>
                )}
            </div>
            {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
    )
}
