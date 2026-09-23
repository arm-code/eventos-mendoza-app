import { CheckCircle2, XCircle, Filter, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const EVENT_TABS = [
  { key: 'upcoming' as const, label: 'Próximos', short: 'Próx.', icon: Clock },
  { key: 'finished' as const, label: 'Terminados', short: 'Fin.', icon: CheckCircle2 },
  { key: 'cancelled' as const, label: 'Cancelados', short: 'Canc.', icon: XCircle },
  { key: 'all' as const, label: 'Todos', short: 'Todos', icon: Filter },
] as const

export type TabKey = typeof EVENT_TABS[number]['key']

interface EventTabsProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  tabCounts: Record<TabKey, number>
}

export function EventTabs({ activeTab, onTabChange, tabCounts }: EventTabsProps) {
  return (
    <div className="relative">
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 no-scrollbar">
        {EVENT_TABS.map((tab) => {
          const count = tabCounts[tab.key]
          const isActive = activeTab === tab.key

          return (
            <Button
              key={tab.key}
              variant={isActive ? 'default' : 'outline'}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'flex shrink-0 snap-start items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-all duration-150',
                'min-h-[44px] active:scale-95',
                isActive ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.short}</span>
              <span
                className={cn(
                  'ml-1 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums',
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {count}
              </span>
            </Button>
          )
        })}
      </div>
      <div className="pointer-events-none absolute bottom-1 right-0 top-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden" aria-hidden="true" />
    </div>
  )
}
