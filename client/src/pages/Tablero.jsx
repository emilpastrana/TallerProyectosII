"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import KanbanBoard from "../components/tablero/KanbanBoard"

const Tablero = () => {
  const { proyectoId } = useParams()
  const navigate = useNavigate()
  const [tablero, setTablero] = useState(null)
  const [columnas, setColumnas] = useState([])
  const [proyecto, setProyecto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTablero = async () => {
      try {
        setLoading(true)
        setError(null)

        // Datos simulados para el proyecto
        let proyectoData = null
        let tableroData = null
        let columnasData = []

        // Intentar obtener datos reales
        try {
          // Obtener el proyecto
          const proyectoRes = await axios.get(`/api/proyectos/${proyectoId}`)
          proyectoData = proyectoRes.data.proyecto

          // Obtener tableros del proyecto
          const tablerosRes = await axios.get(`/api/tableros/proyecto/${proyectoId}`)

          if (tablerosRes.data.tableros.length === 0) {
            // Si no hay tableros, crear uno
            const nuevoTableroRes = await axios.post("/api/tableros", {
              nombre: `Tablero de ${proyectoData.nombre}`,
              descripcion: `Tablero principal para el proyecto ${proyectoData.nombre}`,
              proyecto: proyectoId,
            })

            tableroData = nuevoTableroRes.data.tablero
            columnasData = nuevoTableroRes.data.columnas
          } else {
            // Usar el primer tablero
            const tableroId = tablerosRes.data.tableros[0]._id

            // Obtener tablero con columnas y tareas
            const tableroRes = await axios.get(`/api/tableros/${tableroId}`)
            tableroData = tableroRes.data.tablero
            columnasData = tableroRes.data.columnas
          }
        } catch (err) {
          console.error("Error al obtener datos reales:", err)

          // Si hay error, usar datos simulados
          proyectoData = {
            _id: proyectoId,
            nombre:
              proyectoId === "1"
                ? "Desarrollo de Aplicación Web"
                : proyectoId === "2"
                  ? "Rediseño de Marca"
                  : proyectoId === "3"
                    ? "Campaña de Marketing Digital"
                    : "Proyecto",
            clave: proyectoId === "1" ? "DAW" : proyectoId === "2" ? "RDM" : proyectoId === "3" ? "CMD" : "PRO",
          }

          tableroData = {
            _id: "tablero-" + proyectoId,
            nombre: `Tablero de ${proyectoData.nombre}`,
            descripcion: `Tablero principal para el proyecto ${proyectoData.nombre}`,
            proyecto: proyectoId,
          }

          // Columnas simuladas
          const columnasSimuladas = [
            {
              _id: "col1-" + proyectoId,
              nombre: "Por hacer",
              orden: 1,
              tableroId: tableroData._id,
              tareas: [
                {
                  _id: "tarea1-" + proyectoId,
                  titulo: "Diseñar interfaz de usuario",
                  descripcion: "Crear wireframes y mockups para la aplicación",
                  estado: "pendiente",
                  prioridad: "alta",
                  tipo: "diseño",
                  fechaLimite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                  asignado: {
                    _id: "u1",
                    nombre: "Ana Martínez",
                    avatar: "https://ui-avatars.com/api/?name=Ana+Martinez&background=random",
                  },
                },
                {
                  _id: "tarea2-" + proyectoId,
                  titulo: "Definir requerimientos",
                  descripcion: "Documentar los requerimientos funcionales y no funcionales",
                  estado: "pendiente",
                  prioridad: "crítica",
                  tipo: "documentación",
                  fechaLimite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                  asignado: {
                    _id: "u2",
                    nombre: "Carlos Gómez",
                    avatar: "https://ui-avatars.com/api/?name=Carlos+Gomez&background=random",
                  },
                },
              ],
            },
            {
              _id: "col2-" + proyectoId,
              nombre: "En progreso",
              orden: 2,
              tableroId: tableroData._id,
              tareas: [
                {
                  _id: "tarea3-" + proyectoId,
                  titulo: "Implementar autenticación",
                  descripcion: "Desarrollar sistema de login y registro",
                  estado: "en progreso",
                  prioridad: "alta",
                  tipo: "desarrollo",
                  fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  asignado: {
                    _id: "u3",
                    nombre: "Juan Pérez",
                    avatar: "https://ui-avatars.com/api/?name=Juan+Perez&background=random",
                  },
                },
              ],
            },
            {
              _id: "col3-" + proyectoId,
              nombre: "En revisión",
              orden: 3,
              tableroId: tableroData._id,
              tareas: [
                {
                  _id: "tarea4-" + proyectoId,
                  titulo: "Optimizar rendimiento",
                  descripcion: "Mejorar tiempos de carga y respuesta",
                  estado: "en revisión",
                  prioridad: "media",
                  tipo: "mejora",
                  fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                  asignado: {
                    _id: "u4",
                    nombre: "María López",
                    avatar: "https://ui-avatars.com/api/?name=Maria+Lopez&background=random",
                  },
                },
              ],
            },
            {
              _id: "col4-" + proyectoId,
              nombre: "Completado",
              orden: 4,
              tableroId: tableroData._id,
              tareas: [
                {
                  _id: "tarea5-" + proyectoId,
                  titulo: "Crear documentación API",
                  descripcion: "Documentar endpoints y modelos de datos",
                  estado: "completada",
                  prioridad: "baja",
                  tipo: "documentación",
                  fechaLimite: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                  asignado: {
                    _id: "u1",
                    nombre: "Ana Martínez",
                    avatar: "https://ui-avatars.com/api/?name=Ana+Martinez&background=random",
                  },
                },
              ],
            },
          ]

          columnasData = columnasSimuladas
        }

        setProyecto(proyectoData)
        setTablero(tableroData)
        setColumnas(columnasData)
        setLoading(false)
      } catch (err) {
        console.error("Error al cargar el tablero:", err)
        setError("Error al cargar el tablero. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
      }
    }

    if (proyectoId) {
      fetchTablero()
    }
  }, [proyectoId, navigate])

  // Función para mover una tarea entre columnas
  const handleMoveTask = async (tareaId, columnaDestinoId) => {
    try {
      // Si son IDs simulados, actualizar el estado local
      if (tareaId.startsWith("tarea") && columnaDestinoId.startsWith("col")) {
        const nuevasColumnas = [...columnas]

        // Encontrar la tarea en la columna actual
        let tareaEncontrada = null
        let columnaOrigenIndex = -1

        for (let i = 0; i < nuevasColumnas.length; i++) {
          const tareaIndex = nuevasColumnas[i].tareas.findIndex((t) => t._id === tareaId)
          if (tareaIndex !== -1) {
            tareaEncontrada = nuevasColumnas[i].tareas[tareaIndex]
            columnaOrigenIndex = i
            nuevasColumnas[i].tareas.splice(tareaIndex, 1)
            break
          }
        }

        if (tareaEncontrada && columnaOrigenIndex !== -1) {
          // Encontrar la columna destino
          const columnaDestinoIndex = nuevasColumnas.findIndex((c) => c._id === columnaDestinoId)
          if (columnaDestinoIndex !== -1) {
            // Actualizar el estado de la tarea según la columna
            switch (nuevasColumnas[columnaDestinoIndex].nombre.toLowerCase()) {
              case "por hacer":
                tareaEncontrada.estado = "pendiente"
                break
              case "en progreso":
                tareaEncontrada.estado = "en progreso"
                break
              case "en revisión":
                tareaEncontrada.estado = "en revisión"
                break
              case "completado":
                tareaEncontrada.estado = "completada"
                break
            }

            // Añadir la tarea a la columna destino
            nuevasColumnas[columnaDestinoIndex].tareas.push(tareaEncontrada)
            setColumnas(nuevasColumnas)
          }
        }
      } else {
        // Si son IDs reales, usar la API
        await axios.put(`/api/tableros/mover-tarea/${tareaId}`, {
          columnaDestinoId,
        })

        // Actualizar el tablero
        const tableroRes = await axios.get(`/api/tableros/${tablero._id}`)
        setColumnas(tableroRes.data.columnas)
      }
    } catch (err) {
      console.error("Error al mover la tarea:", err)
      setError("Error al mover la tarea. Por favor, intenta de nuevo más tarde.")
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>{loading ? "Cargando tablero..." : `Tablero: ${proyecto?.nombre || ""}`}</h1>
        </header>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando tablero...</p>
          </div>
        ) : (
          <KanbanBoard columnas={columnas} onMoveTask={handleMoveTask} />
        )}

        <Footer />
      </div>
    </div>
  )
}

export default Tablero
