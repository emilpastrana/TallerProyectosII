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
import BacklogPage from "./pages/BacklogPage"
import SprintsPage from "./pages/SprintsPage"
import ProyectoDashboard from "./pages/ProyectoDashboard" // Add the new route for project dashboard
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
    return (
      <div className="flex items-center justify-center h-screen bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-secondary-600">Verificando autenticación...</span>
      </div>
    )
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
    return (
      <div className="flex items-center justify-center h-screen bg-secondary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-secondary-600">Cargando...</span>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas de Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:proyectoId"
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

        {/* Rutas de backlog */}
        <Route
          path="/backlog/:proyectoId"
          element={
            <ProtectedRoute>
              <BacklogPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas de sprints */}
        <Route
          path="/sprints/:proyectoId"
          element={
            <ProtectedRoute>
              <SprintsPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas de tableros */}
        <Route
          path="/tableros/:proyectoId"
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
          path="/tareas/:proyectoId"
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
        <Route
          path="/proyecto/:id"
          element={
            <ProtectedRoute>
              <ProyectoDashboard />
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
