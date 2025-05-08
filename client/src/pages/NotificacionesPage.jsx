"use client"

import { useState, useEffect } from "react"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"

const NotificacionesPage = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState("todas")

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        setLoading(true)
        setError(null)

        // Datos simulados para notificaciones
        const notificacionesSimuladas = [
          {
            _id: "n1",
            tipo: "tarea",
            titulo: "Nueva tarea asignada",
            mensaje: "Se te ha asignado la tarea 'Diseñar interfaz de usuario'",
            origen: {
              entidadId: "t1",
              tipoEntidad: "tarea",
            },
            leida: false,
            accion: {
              ruta: "/tareas/t1",
            },
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
          },
          {
            _id: "n2",
            tipo: "proyecto",
            titulo: "Proyecto actualizado",
            mensaje: "El proyecto 'Desarrollo de Aplicación Web' ha sido actualizado",
            origen: {
              entidadId: "p1",
              tipoEntidad: "proyecto",
            },
            leida: true,
            accion: {
              ruta: "/proyectos/p1",
            },
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
          },
          {
            _id: "n3",
            tipo: "mencion",
            titulo: "Te han mencionado en un comentario",
            mensaje: "Juan Pérez te ha mencionado en un comentario: '@admin ¿Puedes revisar esto?'",
            origen: {
              entidadId: "c1",
              tipoEntidad: "comentario",
            },
            leida: false,
            accion: {
              ruta: "/tareas/t2",
            },
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
          },
          {
            _id: "n4",
            tipo: "equipo",
            titulo: "Nuevo miembro en el equipo",
            mensaje: "Ana Martínez se ha unido al equipo 'Equipo de Desarrollo'",
            origen: {
              entidadId: "e1",
              tipoEntidad: "equipo",
            },
            leida: true,
            accion: {
              ruta: "/equipos/e1",
            },
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
          },
          {
            _id: "n5",
            tipo: "sistema",
            titulo: "Mantenimiento programado",
            mensaje: "El sistema estará en mantenimiento el próximo domingo de 2:00 AM a 4:00 AM",
            origen: {
              tipoEntidad: "sistema",
            },
            leida: false,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
          },
        ]

        setNotificaciones(notificacionesSimuladas)
        setLoading(false)
      } catch (err) {
        console.error("Error al cargar notificaciones:", err)
        setError("Error al cargar las notificaciones. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
      }
    }

    fetchNotificaciones()
  }, [])

  const marcarComoLeida = (id) => {
    setNotificaciones(
      notificaciones.map((notificacion) => (notificacion._id === id ? { ...notificacion, leida: true } : notificacion)),
    )
  }

  const marcarTodasComoLeidas = () => {
    setNotificaciones(notificaciones.map((notificacion) => ({ ...notificacion, leida: true })))
  }

  const eliminarNotificacion = (id) => {
    setNotificaciones(notificaciones.filter((notificacion) => notificacion._id !== id))
  }

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case "tarea":
        return "✓"
      case "proyecto":
        return "📁"
      case "mencion":
        return "📣"
      case "equipo":
        return "👥"
      case "sistema":
        return "⚙️"
      default:
        return "🔔"
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

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter((notificacion) => {
    if (filtro === "todas") return true
    if (filtro === "no-leidas") return !notificacion.leida
    return notificacion.tipo === filtro
  })

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Notificaciones</h1>
          <button className="btn-primary" onClick={marcarTodasComoLeidas}>
            Marcar todas como leídas
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando notificaciones...</p>
          </div>
        ) : (
          <div className="notificaciones-container">
            <div className="notificaciones-filtros">
              <button className={`filtro-btn ${filtro === "todas" ? "active" : ""}`} onClick={() => setFiltro("todas")}>
                Todas
              </button>
              <button
                className={`filtro-btn ${filtro === "no-leidas" ? "active" : ""}`}
                onClick={() => setFiltro("no-leidas")}
              >
                No leídas
              </button>
              <button className={`filtro-btn ${filtro === "tarea" ? "active" : ""}`} onClick={() => setFiltro("tarea")}>
                Tareas
              </button>
              <button
                className={`filtro-btn ${filtro === "proyecto" ? "active" : ""}`}
                onClick={() => setFiltro("proyecto")}
              >
                Proyectos
              </button>
              <button
                className={`filtro-btn ${filtro === "equipo" ? "active" : ""}`}
                onClick={() => setFiltro("equipo")}
              >
                Equipos
              </button>
              <button
                className={`filtro-btn ${filtro === "mencion" ? "active" : ""}`}
                onClick={() => setFiltro("mencion")}
              >
                Menciones
              </button>
              <button
                className={`filtro-btn ${filtro === "sistema" ? "active" : ""}`}
                onClick={() => setFiltro("sistema")}
              >
                Sistema
              </button>
            </div>

            <div className="notificaciones-lista">
              {notificacionesFiltradas.length === 0 ? (
                <div className="no-notificaciones">
                  <div className="no-notificaciones-icon">🔔</div>
                  <h2>No hay notificaciones</h2>
                  <p>No tienes notificaciones que coincidan con el filtro seleccionado.</p>
                </div>
              ) : (
                notificacionesFiltradas.map((notificacion) => (
                  <div
                    key={notificacion._id}
                    className={`notificacion-item ${!notificacion.leida ? "no-leida" : ""}`}
                    onClick={() => marcarComoLeida(notificacion._id)}
                  >
                    <div className={`notificacion-icono tipo-${notificacion.tipo}`}>
                      {getIconoTipo(notificacion.tipo)}
                    </div>
                    <div className="notificacion-content">
                      <div className="notificacion-header">
                        <h3 className="notificacion-titulo">{notificacion.titulo}</h3>
                        <span className="notificacion-fecha">{formatearFecha(notificacion.timestamp)}</span>
                      </div>
                      <p className="notificacion-mensaje">{notificacion.mensaje}</p>
                      {notificacion.accion && <button className="notificacion-accion">Ver detalles</button>}
                    </div>
                    <button
                      className="notificacion-eliminar"
                      onClick={(e) => {
                        e.stopPropagation()
                        eliminarNotificacion(notificacion._id)
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  )
}

export default NotificacionesPage
