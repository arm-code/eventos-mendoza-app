// components/ui/search-input.tsx
'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string
  onChange: (value: string) => void
  containerClassName?: string
}

const isTouchDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/**
 * Buscador controlado. Responde al instante; si el valor dispara una petición
 * a la API, aplica debounce en la página (useDebouncedValue), no aquí.
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      value,
      onChange,
      onKeyDown,
      placeholder = 'Buscar',
      maxLength = 100,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, [])

    const clear = () => {
      onChange('')
      // Deja el cursor en el campo para escribir otra búsqueda
      inputRef.current?.focus()
    }

    return (
      <div className={cn('relative w-full', containerClassName)}>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          {...props}
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label={props['aria-label'] ?? placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            onKeyDown?.(e)
            if (e.defaultPrevented) return
            // Escape borra (escritorio); Enter cierra el teclado (celular)
            if (e.key === 'Escape' && value) {
              e.preventDefault()
              onChange('')
            } else if (e.key === 'Enter' && isTouchDevice()) {
              e.currentTarget.blur()
            }
          }}
          className={cn(
            'h-12 rounded-xl pl-11 pr-12 text-base',
            // Oculta la X nativa de Safari/Chrome para no tener dos
            '[&::-webkit-search-cancel-button]:appearance-none',
            className
          )}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clear}
            aria-label="Borrar búsqueda"
            className="absolute right-0.5 top-1/2 size-11 -translate-y-1/2 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" aria-hidden />
          </Button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'

export { SearchInput }