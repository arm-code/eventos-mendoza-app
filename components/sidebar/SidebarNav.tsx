import { View } from '@/types/View.types';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export type MenuItem = {
  id: View | string;
  label: string;
  icon: React.ReactNode;
  subItems?: { id: View; label: string; icon?: React.ReactNode }[];
};

export default function SidebarNav({
  items,
  currentView,
  onViewChange,
  isSidebarOpen,
  onOpenSidebar,
}: {
  items: MenuItem[];
  currentView: View;
  onViewChange: (view: View) => void;
  isSidebarOpen: boolean;
  onOpenSidebar?: () => void;
}) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isMenuPartiallyActive = (item: MenuItem) => {
    if (item.id === currentView) return true;
    if (item.subItems) {
      return item.subItems.some((subItem) => subItem.id === currentView);
    }
    return false;
  };

  return (
    <nav className="p-4">
      <ul className="space-y-2">
        {items.map((item) => {
          const isActive = currentView === item.id;
          const isPartiallyActive = isMenuPartiallyActive(item);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          // Abre el menú si el usuario lo abrió manualmente, o si la vista actual está dentro y está expandido
          const isOpen = openMenus[item.id] !== undefined ? openMenus[item.id] : isPartiallyActive;

          return (
            <li key={item.id} className="flex flex-col">
              <button
                onClick={() => {
                  if (hasSubItems) {
                    if (!isSidebarOpen && onOpenSidebar) {
                      onOpenSidebar();
                      setOpenMenus((prev) => ({ ...prev, [item.id]: true }));
                    } else {
                      toggleMenu(item.id);
                    }
                  } else {
                    onViewChange(item.id as View);
                  }
                }}
                className={`w-full cursor-pointer flex items-center justify-between transition-all duration-200 rounded-lg group
                  ${
                    isActive || (isPartiallyActive && !hasSubItems)
                      ? 'bg-violet-100 text-violet-700 shadow-sm border border-violet-200'
                      : isPartiallyActive
                      ? 'bg-violet-50 text-violet-700 border border-transparent font-medium'
                      : 'text-violet-600 hover:bg-violet-50 hover:text-violet-700'
                  }
                  ${isSidebarOpen ? 'px-4 py-3 space-x-3' : 'p-3 justify-center'}
                `}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <div className="flex items-center space-x-3">
                  <span className={`transition-transform ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}>
                    {item.icon}
                  </span>

                  {isSidebarOpen && (
                    <span className="font-medium text-sm transition-all duration-200 text-left">
                      {item.label}
                    </span>
                  )}
                </div>

                {isSidebarOpen && hasSubItems && (
                  <span className="transition-transform duration-200 text-violet-400 group-hover:text-violet-600">
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                )}
              </button>

              {/* Dropdown de sub-ítems */}
              {isSidebarOpen && hasSubItems && isOpen && (
                <ul className="mt-1 space-y-1 ml-4 border-l-2 border-violet-100 pl-2">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = currentView === subItem.id;
                    return (
                      <li key={subItem.id}>
                        <button
                          onClick={() => onViewChange(subItem.id)}
                          className={`w-full cursor-pointer flex items-center transition-all duration-200 rounded-lg group px-3 py-2
                            ${
                              isSubActive
                                ? 'bg-violet-100 text-violet-700 font-medium border border-violet-200 shadow-sm'
                                : 'text-violet-600 hover:bg-violet-50 hover:text-violet-700 text-sm'
                            }
                          `}
                        >
                          {subItem.icon && (
                            <span className={`mr-2 transition-transform duration-200 ${
                              isSubActive ? 'text-violet-700' : 'opacity-70 group-hover:opacity-100 group-hover:text-violet-600'
                            }`}>
                              {subItem.icon}
                            </span>
                          )}
                          <span className="text-sm">{subItem.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}