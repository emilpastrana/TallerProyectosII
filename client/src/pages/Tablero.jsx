"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Plus, MoreVertical, User, Target, ChevronRight, ChevronLeft } from "lucide-react"
import axios from "axios"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"

const Tablero = () => {
  const { proyectoId } = useParams()
  const [tablero, setTablero] = useState(null)
  const [columnas, setColumnas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sprintActivo, setSprintActivo] = useState(null)

  useEffect(() => {
    fetchTablero()
    fetchSprintActivo()
  }, [proyectoId])

  // Solo mostrar las columnas: Por hacer, En progreso, Completado
  const filtrarColumnas = (todas) => {
    return todas.filter((col) =>
      ["Por hacer", "En progreso", "Completado"].includes(col.nombre)
    )
  }

  const fetchTablero = async () => {
    try {
      setLoading(true)
      // Obtener los tableros del proyecto
      const tablerosResponse = await axios.get(`/api/tableros/proyecto/${proyectoId}`)
      const tableros = tablerosResponse.data.tableros

      if (tableros.length === 0) {
        // Si no hay tableros, crear uno por defecto
        const nuevoTableroResponse = await axios.post("/api/tableros", {
          nombre: "Tablero Principal",
          descripcion: "Tablero principal del proyecto",
          proyecto: proyectoId,
        })
        const tableroId = nuevoTableroResponse.data.tablero._id
        const tableroResponse = await axios.get(`/api/tableros/${tableroId}`)
        setTablero(tableroResponse.data.tablero)
        setColumnas(filtrarColumnas(tableroResponse.data.columnas || []))
      } else {
        const tableroId = tableros[0]._id
        const tableroResponse = await axios.get(`/api/tableros/${tableroId}`)
        setTablero(tableroResponse.data.tablero)
        setColumnas(filtrarColumnas(tableroResponse.data.columnas || []))
      }
    } catch (err) {
      console.error("Error al obtener tablero:", err)
      setError("Error al cargar el tablero")
    } finally {
      setLoading(false)
    }
  }

  const fetchSprintActivo = async () => {
    try {
      const response = await axios.get(`/api/sprints/proyecto/${proyectoId}`)
      const sprints = response.data.sprints || []
      const activo = sprints.find((sprint) => sprint.estado === "en progreso")
      setSprintActivo(activo)
    } catch (err) {
      console.error("Error al obtener sprint activo:", err)
    }
  }

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    
    // Solo permitir mover historias
    if (type === "historia") {
      try {
        // Actualizar el estado local primero para feedback inmediato
        const nuevasColumnas = columnas.map((col) => ({
          ...col,
          historias: [...col.historias],
        }))
        const columnaOrigen = nuevasColumnas.find((col) => col._id === source.droppableId)
        const columnaDestino = nuevasColumnas.find((col) => col._id === destination.droppableId)
        const historia = columnaOrigen.historias[source.index]

        // Determinar el nuevo estado basado en la columna destino
        let nuevoEstado = "pendiente"
        if (columnaDestino.nombre === "En progreso") nuevoEstado = "en progreso"
        if (columnaDestino.nombre === "Completado") nuevoEstado = "completada"

        // Actualizar el estado de la historia localmente
        historia.estado = nuevoEstado

        // Mover la historia en el estado local
        columnaOrigen.historias.splice(source.index, 1)
        columnaDestino.historias.splice(destination.index, 0, historia)
        setColumnas(nuevasColumnas)

        // Actualizar en el backend
        await axios.put(`/api/tableros/mover-historia/${draggableId}`, {
          columnaDestinoId: destination.droppableId,
          estado: nuevoEstado
        })
      } catch (err) {
        console.error("Error al mover la historia:", err)
        setError("No se pudo mover la historia. Por favor, inténtalo de nuevo.")
        // Mostrar el error en un toast o notificación más visible
        setTimeout(() => setError(null), 3000) // Limpiar el error después de 3 segundos
        fetchTablero() // Recargar el estado original
      }
    }
  }

  const moverHistoria = async (historia, columnaOrigenId, columnaDestinoId) => {
    try {
      // Encontrar las columnas
      const columnaOrigen = columnas.find((col) => col._id === columnaOrigenId)
      const columnaDestino = columnas.find((col) => col._id === columnaDestinoId)
      
      if (!columnaOrigen || !columnaDestino) return

      // Determinar el nuevo estado basado en la columna destino
      let nuevoEstado = "pendiente"
      if (columnaDestino.nombre === "En progreso") nuevoEstado = "en progreso"
      if (columnaDestino.nombre === "Completado") nuevoEstado = "completada"

      // Actualizar el estado local primero
      const nuevasColumnas = columnas.map((col) => {
        if (col._id === columnaOrigenId) {
          return {
            ...col,
            historias: col.historias.filter((h) => h._id !== historia._id)
          }
        }
        if (col._id === columnaDestinoId) {
          return {
            ...col,
            historias: [...col.historias, { ...historia, estado: nuevoEstado }]
          }
        }
        return col
      })

      setColumnas(nuevasColumnas)

      // Actualizar en el backend
      await axios.put(`/api/tableros/mover-historia/${historia._id}`, {
        columnaDestinoId: columnaDestinoId,
        estado: nuevoEstado
      })
    } catch (err) {
      console.error("Error al mover la historia:", err)
      setError("No se pudo mover la historia. Por favor, inténtalo de nuevo.")
      setTimeout(() => setError(null), 3000)
      fetchTablero()
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "completada":
        return "bg-green-100 text-green-800 border-green-200"
      case "en progreso":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "en revisión":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pendiente":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "crítica":
        return "bg-red-100 text-red-800"
      case "alta":
        return "bg-orange-100 text-orange-800"
      case "media":
        return "bg-yellow-100 text-yellow-800"
      case "baja":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-secondary-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-secondary-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <div className="container mx-auto px-6 py-8 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tablero?.nombre || "Tablero Kanban"}</h1>
              {sprintActivo && (
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <Target className="h-4 w-4 mr-2" />
                  <span>
                    Sprint Activo: <strong>{sprintActivo.nombre}</strong> (#{sprintActivo.numero})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sprint Info */}
          {!sprintActivo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">No hay sprint activo</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Para ver historias en el tablero, necesitas tener un sprint activo. Ve a la página de Sprints para
                    iniciar uno.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tablero Kanban */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex space-x-6 h-full min-w-max pb-6">
              {columnas.map((columna, colIndex) => (
                <div key={columna._id} className="flex-shrink-0 w-80">
                  <div className="bg-gray-50 rounded-lg h-full flex flex-col">
                    {/* Header de la columna */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{columna.nombre}</h3>
                        <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                          {columna.historias?.length || 0}
                        </span>
                      </div>
                    </div>

                    {/* Contenido de la columna */}
                    <div className="flex-1 p-4">
                      <div className="space-y-3">
                        {columna.historias?.map((historia) => (
                          <div
                            key={historia._id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative group"
                          >
                            {/* Botones de navegación */}
                            <div className="absolute inset-y-0 -left-2 hidden group-hover:flex items-center">
                              {colIndex > 0 && (
                                <button
                                  onClick={() => moverHistoria(historia, columna._id, columnas[colIndex - 1]._id)}
                                  className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                  <ChevronLeft className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                            <div className="absolute inset-y-0 -right-2 hidden group-hover:flex items-center">
                              {colIndex < columnas.length - 1 && (
                                <button
                                  onClick={() => moverHistoria(historia, columna._id, columnas[colIndex + 1]._id)}
                                  className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </button>
                              )}
                            </div>

                            {/* Contenido de la historia */}
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                {historia.titulo}
                              </h4>
                              <div className="ml-2 flex-shrink-0">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(historia.prioridad)}`}>
                                  {historia.prioridad}
                                </span>
                              </div>
                            </div>

                            {/* Descripción */}
                            {historia.descripcion && (
                              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{historia.descripcion}</p>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {historia.epicaId && (
                                  <span className="text-xs text-gray-500">{historia.epicaId.titulo}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {historia.puntos > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {historia.puntos} pts
                                  </span>
                                )}
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(historia.estado)}`}>
                                  {historia.estado}
                                </span>
                              </div>
                            </div>

                            {/* Sprint info */}
                            {historia.sprintId && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-500">
                                  Sprint: {historia.sprintId.nombre}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Componente de error flotante */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 shadow-lg">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tablero
