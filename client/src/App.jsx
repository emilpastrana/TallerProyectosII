"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Proyectos from "./pages/Proyectos"
import Tablero from "./pages/Tablero"
import TareasPage from "./pages/TareasPage"
import EquiposPage from "./pages/EquiposPage"
import MensajesPage from "./pages/MensajesPage"
import NotificacionesPage from "./pages/NotificacionesPage"
import IAAsistentePage from "./pages/IAAsistentePage"
import ConfiguracionPage from "./pages/ConfiguracionPage"
import "./index.css"

// Componente protegido que verifica si hay un token válido
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un token en localStorage
    const token = localStorage.getItem("token")
    if (!token) {
      setIsAuthenticated(false)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="loading">Verificando autenticación...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Ruta principal siempre redirige al dashboard si está autenticado, o al login si no */}
        <Route
          path="/"
          element={localStorage.getItem("token") ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />

        {/* Rutas de proyectos */}
        <Route
          path="/proyectos"
          element={
            <ProtectedRoute>
              <Proyectos />
            </ProtectedRoute>
          }
        />

        {/* Rutas de tableros */}
        <Route
          path="/tableros/proyecto/:proyectoId"
          element={
            <ProtectedRoute>
              <Tablero />
            </ProtectedRoute>
          }
        />

        {/* Otras rutas protegidas */}
        <Route
          path="/equipos"
          element={
            <ProtectedRoute>
              <EquiposPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tareas"
          element={
            <ProtectedRoute>
              <TareasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mensajes"
          element={
            <ProtectedRoute>
              <MensajesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <ProtectedRoute>
              <NotificacionesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ia-asistente"
          element={
            <ProtectedRoute>
              <IAAsistentePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracion"
          element={
            <ProtectedRoute>
              <ConfiguracionPage />
            </ProtectedRoute>
          }
        />

        {/* Cualquier otra ruta redirige al dashboard si está autenticado, o al login si no */}
        <Route
          path="*"
          element={localStorage.getItem("token") ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  )
}

export default App
