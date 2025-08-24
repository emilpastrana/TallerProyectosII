import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import ErrorBoundary from "./components/common/ErrorBoundary"
import "./index.css"

// Configurar axios para peticiones al backend
import axios from "axios"

// Configurar la URL base para el servidor desplegado en Render
axios.defaults.baseURL = "https://gestor-de-proyectos-p8rm.onrender.com"

// Configurar interceptor para añadir el token a cada petición
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Configurar interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // No redirigir automáticamente al login para evitar ciclos infinitos
    if (error.response && error.response.status === 401) {
      console.log("Error de autenticación:", error.response.data.message)
      // Solo limpiar el token si no estamos en la página de login
      if (!window.location.pathname.includes("/login")) {
        console.log("Sesión expirada o token inválido")
      }
    }
    return Promise.reject(error)
  },
)

// Configurar un manejador global de errores para capturar errores no controlados
window.addEventListener("error", (event) => {
  console.error("Error no controlado:", event.error)
})

// Configurar un manejador para promesas rechazadas no controladas
window.addEventListener("unhandledrejection", (event) => {
  console.error("Promesa rechazada no controlada:", event.reason)
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
