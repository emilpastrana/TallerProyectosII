"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import useSocket from "../hooks/useSocket"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import { Bell, Check, CheckCheck, Trash2, Filter, RefreshCw } from "lucide-react"

const NotificacionesPage = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState("todas")
  const [contadorNoLeidas, setContadorNoLeidas] = useState(0)
  const [actualizando, setActualizando] = useState(false)

  const socket = useSocket()

  // Configurar axios
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

    }
  }, [])

  // Cargar notificaciones
  useEffect(() => {
    fetchNotificaciones()
    fetchContadorNoLeidas()
  }, [filtro])

  // Configurar Socket.IO para notificaciones en tiempo real
  useEffect(() => {
    if (!socket) return

    const handleNuevaNotificacion = (notificacion) => {
      setNotificaciones((prev) => [notificacion, ...prev])
      setContadorNoLeidas((prev) => prev + 1)
    }

    socket.on("nueva_notificacion", handleNuevaNotificacion)

    return () => {
      socket.off("nueva_notificacion", handleNuevaNotificacion)
    }
  }, [socket])

  const fetchNotificaciones = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get("/api/notificaciones", {
        params: { filtro, limit: 50 },
      })

      setNotificaciones(response.data.notificaciones)
      setContadorNoLeidas(response.data.noLeidas)
    } catch (err) {
      console.error("Error al cargar notificaciones:", err)
      setError("Error al cargar las notificaciones. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const fetchContadorNoLeidas = async () => {
    try {
      const response = await axios.get("/api/notificaciones/contador")
      setContadorNoLeidas(response.data.contador)
    } catch (err) {
      console.error("Error al obtener contador:", err)
    }
  }

  const marcarComoLeida = async (id) => {
    try {
      await axios.put(`/api/notificaciones/${id}/leer`)
      setNotificaciones((prev) =>
        prev.map((notificacion) => (notificacion._id === id ? { ...notificacion, leida: true } : notificacion)),
      )
      setContadorNoLeidas((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Error al marcar como leída:", err)
    }
  }

  const marcarTodasComoLeidas = async () => {
    try {
      setActualizando(true)
      await axios.put("/api/notificaciones/marcar-todas-leidas")
      setNotificaciones((prev) => prev.map((notificacion) => ({ ...notificacion, leida: true })))
      setContadorNoLeidas(0)
    } catch (err) {
      console.error("Error al marcar todas como leídas:", err)
      setError("Error al marcar todas las notificaciones como leídas")
    } finally {
      setActualizando(false)
    }
  }

  const eliminarNotificacion = async (id) => {
    try {
      await axios.delete(`/api/notificaciones/${id}`)
      setNotificaciones((prev) => prev.filter((notificacion) => notificacion._id !== id))

      // Actualizar contador si la notificación eliminada no estaba leída
      const notificacionEliminada = notificaciones.find((n) => n._id === id)
      if (notificacionEliminada && !notificacionEliminada.leida) {
        setContadorNoLeidas((prev) => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error("Error al eliminar notificación:", err)
      setError("Error al eliminar la notificación")
    }
  }

  const actualizarNotificaciones = async () => {
    setActualizando(true)
    await fetchNotificaciones()
    setActualizando(false)
  }

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case "tarea":
        return "✓"
      case "proyecto":
        return "📁"
      case "mencion":
        return "💬"
      case "equipo":
        return "👥"
      case "sistema":
        return "⚙️"
      default:
        return "🔔"
    }
  }

  const getColorTipo = (tipo) => {
    switch (tipo) {
      case "tarea":
        return "bg-green-100 text-green-600"
      case "proyecto":
        return "bg-blue-100 text-blue-600"
      case "mencion":
        return "bg-purple-100 text-purple-600"
      case "equipo":
        return "bg-orange-100 text-orange-600"
      case "sistema":
        return "bg-gray-100 text-gray-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const ahora = new Date()
    const fechaNotificacion = new Date(fecha)
    const diferencia = ahora - fechaNotificacion

    // Menos de 1 hora
    if (diferencia < 60 * 60 * 1000) {
      const minutos = Math.floor(diferencia / (60 * 1000))
      return `hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`
    }

    // Menos de 24 horas
    if (diferencia < 24 * 60 * 60 * 1000) {
      const horas = Math.floor(diferencia / (60 * 60 * 1000))
      return `hace ${horas} ${horas === 1 ? "hora" : "horas"}`
    }

    // Menos de 7 días
    if (diferencia < 7 * 24 * 60 * 60 * 1000) {
      const dias = Math.floor(diferencia / (24 * 60 * 60 * 1000))
      return `hace ${dias} ${dias === 1 ? "día" : "días"}`
    }

    // Más de 7 días
    return fechaNotificacion.toLocaleDateString()
  }

  const filtros = [
    { key: "todas", label: "Todas", count: notificaciones.length },
    { key: "no-leidas", label: "No leídas", count: contadorNoLeidas },
    { key: "mencion", label: "Mensajes", count: notificaciones.filter((n) => n.tipo === "mencion").length },
    { key: "equipo", label: "Equipos", count: notificaciones.filter((n) => n.tipo === "equipo").length },
    { key: "tarea", label: "Tareas", count: notificaciones.filter((n) => n.tipo === "tarea").length },
    { key: "proyecto", label: "Proyectos", count: notificaciones.filter((n) => n.tipo === "proyecto").length },
    { key: "sistema", label: "Sistema", count: notificaciones.filter((n) => n.tipo === "sistema").length },
  ]

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        {/* Header */}
        <header className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Bell size={24} className="text-gray-700" />
              <h1 className="text-2xl font-semibold text-gray-900">Notificaciones</h1>
              {contadorNoLeidas > 0 && (
                <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                  {contadorNoLeidas}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={actualizarNotificaciones}
              disabled={actualizando}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={actualizando ? "animate-spin" : ""} />
              Actualizar
            </button>
            <button
              onClick={marcarTodasComoLeidas}
              disabled={actualizando || contadorNoLeidas === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCheck size={16} />
              Marcar todas como leídas
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filtros */}
        <div className="mx-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filtros.map((filtroItem) => (
              <button
                key={filtroItem.key}
                onClick={() => setFiltro(filtroItem.key)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  filtro === filtroItem.key
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{filtroItem.label}</span>
                {filtroItem.count > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-white rounded-full">{filtroItem.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="mx-6 mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando notificaciones...</p>
              </div>
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No hay notificaciones</h2>
              <p className="text-gray-600 mb-6">
                {filtro === "todas"
                  ? "No tienes notificaciones en este momento."
                  : `No tienes notificaciones que coincidan con el filtro "${filtros.find((f) => f.key === filtro)?.label}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificaciones.map((notificacion) => (
                <div
                  key={notificacion._id}
                  className={`p-4 bg-white rounded-lg border transition-all hover:shadow-md ${
                    !notificacion.leida ? "border-l-4 border-l-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getColorTipo(notificacion.tipo)}`}
                    >
                      {getIconoTipo(notificacion.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{notificacion.titulo}</h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatearFecha(notificacion.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{notificacion.mensaje}</p>

                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        {notificacion.accion && (
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            Ver detalles
                          </button>
                        )}
                        {!notificacion.leida && (
                          <button
                            onClick={() => marcarComoLeida(notificacion._id)}
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
                          >
                            <Check size={12} />
                            Marcar como leída
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => eliminarNotificacion(notificacion._id)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar notificación"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificacionesPage
