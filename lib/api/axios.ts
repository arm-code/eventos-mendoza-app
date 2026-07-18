import axios from 'axios';
import { supabaseBrowser } from '../supabase/supabaseBrowser';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de Supabase
axiosInstance.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabaseBrowser.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para desempaquetar la respuesta de la API de ARM Solutions
axiosInstance.interceptors.response.use(
  (response) => {
    // La API responde con { success: true, message: "...", data: { ... } }
    if (response.data && typeof response.data.success !== 'undefined') {
      // Si la respuesta indica éxito, devolvemos el payload real en "data"
      if (response.data.success) {
        response.data = response.data.data;
      } else {
        // En caso de que success sea false pero status 200 (poco común, pero por si acaso)
        return Promise.reject(new Error(response.data.message || 'Error en la petición'));
      }
    }
    return response;
  },
  (error) => {
    // Manejo de errores estándar de la API
    if (error.response && error.response.data) {
      const apiError = error.response.data;
      
      // Construir mensaje de error
      let errorMessage = apiError.message || 'Ocurrió un error inesperado.';
      
      if (apiError.error && Array.isArray(apiError.error)) {
        errorMessage += ' Detalles: ' + apiError.error.join(', ');
      }
      
      return Promise.reject(new Error(errorMessage));
    }
    return Promise.reject(error);
  }
);
