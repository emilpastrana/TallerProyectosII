"use client"

import { useState, useEffect } from "react"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"

const TareasPage = () => {
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTareas = async () => {
      try {
        setLoading(true)
        setError(null)

        // Datos simulados para tareas
        const tareasSimuladas = [
          {
            _id: "t1",
            titulo: "Diseñar interfaz de usuario",
            descripcion: "Crear wireframes y mockups para la aplicación",
            estado: "en progreso",
            prioridad: "alta",
            tipo: "diseño",
            fechaLimite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            asignado: {
              _id: "u1",
              nombre: "Ana Martínez",
              avatar: "https://ui-avatars.com/api/?name=Ana+Martinez&background=random",
            },
            proyecto: {
              _id: "p1",
              nombre: "Desarrollo de Aplicación Web",
              clave: "DAW",
            },
          },
          {
            _id: "t2",
            titulo: "Implementar autenticación",
            descripcion: "Desarrollar sistema de login y registro",
            estado: "pendiente",
            prioridad: "alta",
            tipo: "desarrollo",
            fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            asignado: {
              _id: "u2",
              nombre: "Carlos Gómez",
              avatar: "https://ui-avatars.com/api/?name=Carlos+Gomez&background=random",
            },
            proyecto: {
              _id: "p1",
              nombre: "Desarrollo de Aplicación Web",
              clave: "DAW",
            },
          },
          {
            _id: "t3",
            titulo: "Crear documentación API",
            descripcion: "Documentar endpoints y modelos de datos",
            estado: "completada",
            prioridad: "media",
            tipo: "documentación",
            fechaLimite: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            asignado: {
              _id: "u3",
              nombre: "Juan Pérez",
              avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random",
            },
            proyecto: {
              _id: "p2",
              nombre: "Desarrollo de API REST",
              clave: "API",
            },
          },
          {
            _id: "t4",
            titulo: "Optimizar rendimiento",
            descripcion: "Mejorar tiempos de carga y respuesta",
            estado: "en revisión",
            prioridad: "crítica",
            tipo: "mejora",
            fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            asignado: {
              _id: "u4",
              nombre: "María López",
              avatar: "https://ui-avatars.com/api/?name=Maria+Lopez&background=random",
            },
            proyecto: {
              _id: "p1",
              nombre: "Desarrollo de Aplicación Web",
              clave: "DAW",
            },
          },
          {
            _id: "t5",
            titulo: "Corregir bug en formulario",
            descripcion: "Solucionar error de validación en formulario de contacto",
            estado: "pendiente",
            prioridad: "crítica",
            tipo: "bug",
            fechaLimite: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            asignado: {
              _id: "u1",
              nombre: "Ana Martínez",
              avatar: "https://ui-avatars.com/api/?name=Ana+Martinez&background=random",
            },
            proyecto: {
              _id: "p3",
              nombre: "Rediseño de Marca",
              clave: "RDM",
            },
          },
        ]

        // Intentar obtener tareas reales
        try {
          // Aquí iría la llamada a la API para obtener tareas reales
          // const response = await axios.get("/api/tareas");
          // setTareas(response.data.tareas);

          // Por ahora, usamos datos simulados
          setTareas(tareasSimuladas)
        } catch (err) {
          console.error("Error al obtener tareas reales:", err)
          setTareas(tareasSimuladas)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error al cargar tareas:", err)
        setError("Error al cargar las tareas. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
      }
    }

    fetchTareas()
  }, [])

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
          <h1>Tareas</h1>
          <button className="btn-primary">Nueva Tarea</button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando tareas...</p>
          </div>
        ) : (
          <div className="tareas-container">
            <div className="filtros-tareas">
              <div className="filtro-grupo">
                <label>Estado:</label>
                <select>
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en progreso">En Progreso</option>
                  <option value="en revisión">En Revisión</option>
                  <option value="completada">Completada</option>
                </select>
              </div>
              <div className="filtro-grupo">
                <label>Prioridad:</label>
                <select>
                  <option value="">Todas</option>
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="crítica">Crítica</option>
                </select>
              </div>
              <div className="filtro-grupo">
                <label>Proyecto:</label>
                <select>
                  <option value="">Todos</option>
                  <option value="DAW">Desarrollo de Aplicación Web</option>
                  <option value="API">Desarrollo de API REST</option>
                  <option value="RDM">Rediseño de Marca</option>
                </select>
              </div>
            </div>

            <div className="lista-tareas">
              <table className="tabla-tareas">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Proyecto</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Asignado a</th>
                    <th>Fecha Límite</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tareas.map((tarea) => (
                    <tr key={tarea._id}>
                      <td>{tarea.titulo}</td>
                      <td>
                        <span className="proyecto-badge">{tarea.proyecto.clave}</span>
                      </td>
                      <td>
                        <span className={`estado-badge estado-${tarea.estado.replace(" ", "-")}`}>{tarea.estado}</span>
                      </td>
                      <td>
                        <span
                          className="prioridad-badge"
                          style={{ backgroundColor: getPriorityColor(tarea.prioridad) }}
                        >
                          {tarea.prioridad}
                        </span>
                      </td>
                      <td>
                        <div className="asignado-info">
                          {tarea.asignado ? (
                            <>
                              <img
                                src={tarea.asignado.avatar || "/placeholder.svg"}
                                alt={tarea.asignado.nombre}
                                className="asignado-avatar"
                              />
                              <span>{tarea.asignado.nombre}</span>
                            </>
                          ) : (
                            <span className="sin-asignar">Sin asignar</span>
                          )}
                        </div>
                      </td>
                      <td>{formatDate(tarea.fechaLimite)}</td>
                      <td>
                        <div className="acciones-tarea">
                          <button className="btn-icon" title="Ver detalles">
                            👁️
                          </button>
                          <button className="btn-icon" title="Editar">
                            ✏️
                          </button>
                          <button className="btn-icon" title="Eliminar">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  )
}

export default TareasPage
