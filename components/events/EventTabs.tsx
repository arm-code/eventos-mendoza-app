// components/eventos/event-tabs.tsx
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const EVENT_TABS = [
  { key: 'upcoming', label: 'Próximos' },
  { key: 'finished', label: 'Terminados' },
  { key: 'cancelled', label: 'Cancelados' },
] as const

export type TabKey = (typeof EVENT_TABS)[number]['key']

const TAB_KEYS = new Set<string>(EVENT_TABS.map((t) => t.key))
const isTabKey = (value: string): value is TabKey => TAB_KEYS.has(value)

interface EventTabsProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  tabCounts: Partial<Record<TabKey, number>>
}

export function EventTabs({ activeTab, onTabChange, tabCounts }: EventTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => isTabKey(value) && onTabChange(value)}>
      <TabsList
        aria-label="Filtrar eventos"
        className="grid h-12 w-full grid-cols-3 rounded-xl bg-muted p-1"
      >
        {EVENT_TABS.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className="h-full gap-1.5 rounded-lg px-1 text-sm font-medium text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-card"
          >
            {tab.label}
            <span className="tabular-nums text-muted-foreground max-[359px]:hidden">
              {tabCounts[tab.key] ?? 0}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}