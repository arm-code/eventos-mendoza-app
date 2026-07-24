'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, LogIn, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { loginUser } from '@/actions/auth/login'
import { cn } from '@/lib/utils'

/* ────────────────────────────────────────────────────────────────────────────
   COMPONENTE: LoginPage
   Diseñado mobile-first con targets táctiles amplios, feedback visual
   inmediato, y estados de carga claros.
   ─────────────────────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: '',
  })

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!email.trim() || !password.trim()) {
        setMessage({ type: 'error', text: 'Ingresa tu email y contraseña' })
        return
      }

      setLoading(true)
      setMessage({ type: null, text: '' })

      try {
        await loginUser(email.trim(), password)
        setMessage({ type: 'success', text: '¡Bienvenido de vuelta!' })
        // Pequeño delay para que el usuario vea el mensaje de éxito
        setTimeout(() => router.push('/dashboard'), 600)
      } catch (err: any) {
        setMessage({
          type: 'error',
          text: err?.message || 'Credenciales incorrectas. Intenta de nuevo.',
        })
      } finally {
        setLoading(false)
      }
    },
    [email, password, router]
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-violet-50/50 px-4 py-6 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25"
          >
            <ShieldCheck className="h-8 w-8" />
          </motion.div>
          <h1 className="text-xl font-bold tracking-tight text-violet-950 sm:text-2xl">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-sm text-violet-500">
            Accede a tu panel de gestión
          </p>
        </div>

        {/* ── Formulario ── */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-violet-100 bg-white p-5 shadow-xl shadow-violet-900/5 sm:p-6"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-violet-600"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                autoFocus
                required
                className={cn(
                  'h-12 w-full rounded-xl border bg-white px-4 text-base text-violet-950',
                  'placeholder:text-violet-300',
                  'focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20',
                  'transition-all',
                  message.type === 'error' && !email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-violet-100'
                )}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-violet-600"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className={cn(
                  'h-12 w-full rounded-xl border bg-white px-4 pr-12 text-base text-violet-950',
                  'placeholder:text-violet-300',
                  'focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20',
                  'transition-all',
                  message.type === 'error' && !password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-violet-100'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-violet-400 hover:text-violet-600 active:text-violet-700 transition-colors rounded-lg hover:bg-violet-50"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de estado */}
          <AnimatePresence mode="wait">
            {message.text && (
              <motion.div
                key={message.type + message.text}
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm',
                  message.type === 'error'
                    ? 'border border-red-200 bg-red-50 text-red-800'
                    : message.type === 'success'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border border-violet-200 bg-violet-50 text-violet-800'
                )}
              >
                {message.type === 'error' ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                ) : message.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : null}
                <span className="font-medium">{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold text-sm',
              'bg-violet-600 text-white shadow-lg shadow-violet-600/20',
              'hover:bg-violet-700 active:bg-violet-800',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Ingresar</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-violet-400">
          Eventos Mendoza · Panel de administración
        </p>
      </motion.div>
    </div>
  )
}