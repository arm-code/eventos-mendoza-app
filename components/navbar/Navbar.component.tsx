'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'

const items = [
  { title: 'Inicio', route: '/' },
  // { title: 'Productos y servicios', route: '/products-services' },
  // { title: 'Equipo de trabajo', route: '/about-owners' },
  { title: 'Datos bancarios', route: '/payment-info' },
  { title: 'Desarrollador', route: '/about-me' },
]

const Navbar = () => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const isActive = (route: string) => pathname === route

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-4 lg:gap-6">
        {items.map((item) => (
          <Link
            href={item.route}
            className={`
              text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg
              ${isActive(item.route)
                ? 'text-violet-700 bg-violet-100 font-semibold'
                : 'text-violet-600 hover:text-violet-700 hover:bg-violet-50'
              }
            `}
            key={item.title}
          >
            {item.title}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 right-4 bg-white border border-violet-200 rounded-xl shadow-lg py-2 min-w-48 z-50">
            {items.map((item) => (
              <Link
                href={item.route}
                onClick={toggleMenu}
                className={`
                  block px-4 py-3 text-sm font-medium transition-colors
                  ${isActive(item.route)
                    ? 'text-violet-700 bg-violet-50'
                    : 'text-violet-600 hover:bg-violet-50'
                  }
                `}
                key={item.title}
              >
                {item.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Navbar