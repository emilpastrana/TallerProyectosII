"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import ProyectoForm from "../components/proyectos/ProyectoForm"

const Proyectos = () => {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [currentProyecto, setCurrentProyecto] = useState(null)

  // Cargar proyectos
  const fetchProyectos = async () => {
    try {
      setLoading(true)
      setError(null)

      try {
        const res = await axios.get("/api/proyectos")
        setProyectos(res.data.proyectos)
      } catch (err) {
        console.error("Error al cargar proyectos:", err)

        // Si hay un error, usar datos simulados
        const proyectosSimulados = [
          {
            _id: "1",
            nombre: "Desarrollo de Aplicación Web",
            clave: "DAW",
            descripcion: "Desarrollo de una aplicación web para gestión de proyectos",
            estado: "activo",
            prioridad: "alta",
            fechaInicio: new Date(),
            fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            equipo: { _id: "1", nombre: "Equipo de Desarrollo" },
          },
          {
            _id: "2",
            nombre: "Rediseño de Marca",
            clave: "RDM",
            descripcion: "Rediseño de la marca corporativa",
            estado: "pausado",
            prioridad: "media",
            fechaInicio: new Date(),
            fechaFin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            equipo: { _id: "2", nombre: "Equipo de Diseño" },
          },
          {
            _id: "3",
            nombre: "Campaña de Marketing Digital",
            clave: "CMD",
            descripcion: "Campaña de marketing en redes sociales",
            estado: "activo",
            prioridad: "crítica",
            fechaInicio: new Date(),
            fechaFin: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
            equipo: { _id: "3", nombre: "Equipo de Marketing" },
          },
        ]

        setProyectos(proyectosSimulados)
      }

      setLoading(false)
    } catch (err) {
      console.error("Error general al cargar proyectos:", err)
      setError("Error al cargar los proyectos. Por favor, intenta de nuevo más tarde.")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProyectos()
  }, [])

  // Función para abrir el formulario de creación
  const handleCreateProyecto = () => {
    setCurrentProyecto(null)
    setShowForm(true)
  }

  // Función para abrir el formulario de edición
  const handleEditProyecto = (proyecto) => {
    setCurrentProyecto(proyecto)
    setShowForm(true)
  }

  // Función para eliminar un proyecto
  const handleDeleteProyecto = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.")) {
      try {
        // Si es un ID simulado, simplemente actualizar el estado local
        if (id === "1" || id === "2" || id === "3") {
          setProyectos(proyectos.filter((p) => p._id !== id))
          return
        }

        await axios.delete(`/api/proyectos/${id}`)
        // Actualizar la lista de proyectos
        fetchProyectos()
      } catch (err) {
        console.error("Error al eliminar el proyecto:", err)
        setError("Error al eliminar el proyecto. Por favor, intenta de nuevo más tarde.")
      }
    }
  }

  // Función para manejar el envío del formulario
  const handleFormSubmit = async (formData) => {
    try {
      if (currentProyecto) {
        // Actualizar proyecto existente
        if (currentProyecto._id === "1" || currentProyecto._id === "2" || currentProyecto._id === "3") {
          // Si es un ID simulado, actualizar el estado local
          setProyectos(
            proyectos.map((p) =>
              p._id === currentProyecto._id
                ? {
                    ...p,
                    ...formData,
                    equipo: {
                      _id: formData.equipo,
                      nombre:
                        formData.equipo === "1"
                          ? "Equipo de Desarrollo"
                          : formData.equipo === "2"
                            ? "Equipo de Diseño"
                            : "Equipo de Marketing",
                    },
                  }
                : p,
            ),
          )
        } else {
          await axios.put(`/api/proyectos/${currentProyecto._id}`, formData)
          fetchProyectos()
        }
      } else {
        // Crear nuevo proyecto
        const response = await axios.post("/api/proyectos", formData)

        // Actualizar la lista de proyectos
        fetchProyectos()
      }

      // Cerrar el formulario
      setShowForm(false)
    } catch (err) {
      console.error("Error al guardar el proyecto:", err)
      throw err // Propagar el error para que el formulario pueda manejarlo
    }
  }

  // Función para obtener el color según la prioridad
  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case "baja":
        return "#4caf50" // Verde
      case "media":
        return "#2196f3" // Azul
      case "alta":
        return "#ff9800" // Naranja
      case "crítica":
        return "#ef4444" // Rojo
      default:
        return "#9e9e9e" // Gris
    }
  }

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Proyectos</h1>
          <button className="btn-primary" onClick={handleCreateProyecto}>
            Nuevo Proyecto
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{currentProyecto ? "Editar Proyecto" : "Nuevo Proyecto"}</h2>
                <button className="close-button" onClick={() => setShowForm(false)}>
                  ×
                </button>
              </div>
              <ProyectoForm
                proyecto={currentProyecto}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando proyectos...</p>
          </div>
        ) : (
          <div className="proyectos-grid">
            {proyectos.length === 0 ? (
              <div className="no-data">
                <p>No hay proyectos disponibles</p>
                <button className="btn-primary" onClick={handleCreateProyecto}>
                  Crear Primer Proyecto
                </button>
              </div>
            ) : (
              proyectos.map((proyecto) => (
                <div key={proyecto._id} className="proyecto-card">
                  <div className="proyecto-header">
                    <h2 className="proyecto-title">{proyecto.nombre}</h2>
                    <span
                      className="proyecto-priority"
                      style={{ backgroundColor: getPriorityColor(proyecto.prioridad) }}
                    >
                      {proyecto.prioridad}
                    </span>
                  </div>

                  <div className="proyecto-meta">
                    <span className="proyecto-key">{proyecto.clave}</span>
                    <span className="proyecto-status">{proyecto.estado}</span>
                  </div>

                  <p className="proyecto-description">{proyecto.descripcion}</p>

                  <div className="proyecto-dates">
                    <div>Inicio: {formatDate(proyecto.fechaInicio)}</div>
                    {proyecto.fechaFin && <div>Fin: {formatDate(proyecto.fechaFin)}</div>}
                  </div>

                  <div className="proyecto-actions">
                    <Link to={`/tableros/proyecto/${proyecto._id}`} className="btn-secondary">
                      Ver Tablero
                    </Link>
                    <button className="btn-edit" onClick={() => handleEditProyecto(proyecto)}>
                      Editar
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteProyecto(proyecto._id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}


      </div>
    </div>
  )
}

export default Proyectos
