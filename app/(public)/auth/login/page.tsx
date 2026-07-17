"use client"

import { loginUser } from "@/actions/auth/login"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      setLoading(true)
      await loginUser(formData.get("email") as string, formData.get("password") as string)
      setMessage("Se ha iniciado sesión correctamente")
      setLoading(false)
      router.push("/dashboard")
    } catch (err: any) {
      setMessage("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-6 w-full max-w-sm space-y-4 border border-gray-200"
      >
        <h1 className="text-1xl font-semibold text-gray-800 text-center">Ingresa tus credenciales de acceso</h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Ingresar"}
        </button>

        <p className="text-center text-sm text-gray-600">{message}</p>
      </form>
    </div>
  )
}
