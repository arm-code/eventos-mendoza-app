'use client'

import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="w-full py-6 mt-auto border-t border-violet-100 bg-violet-50/80">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-violet-400">
        <p className="mb-2 md:mb-0">&copy; {new Date().getFullYear()} Eventos Mendoza. Todos los derechos reservados.</p>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/auth/login" 
            className="opacity-50 hover:opacity-100 hover:text-violet-600 transition-all duration-200"
            title="Acceso Administrativo"
          >
            Administración
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
