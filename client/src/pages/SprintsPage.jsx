"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  Calendar,
  Clock,
  Target,
  Plus,
  Edit,
  Trash2,
  Play,
  Square,
  CheckCircle,
  AlertCircle,
  MoreVertical,
} from "lucide-react"
import axios from "axios"
import SprintForm from "../components/sprints/SprintForm"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"

const SprintsPage = () => {
  const { proyectoId } = useParams()
  const [sprints, setSprints] = useState([])
  const [proyecto, setProyecto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSprint, setEditingSprint] = useState(null)
  const [selectedSprint, setSelectedSprint] = useState(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  useEffect(() => {
    fetchSprints()
    fetchProyecto()
  }, [proyectoId])

  const fetchSprints = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/sprints/proyecto/${proyectoId}`)
      setSprints(response.data.sprints || [])
    } catch (err) {
      console.error("Error al obtener sprints:", err)
      setError("Error al cargar los sprints")
    } finally {
      setLoading(false)
    }
  }

  const fetchProyecto = async () => {
    try {
      const response = await axios.get(`/api/proyectos/${proyectoId}`)
      setProyecto(response.data.proyecto)
    } catch (err) {
      console.error("Error al obtener proyecto:", err)
    }
  }

  const handleCreateSprint = () => {
    setEditingSprint(null)
    setShowForm(true)
  }

  const handleEditSprint = (sprint) => {
    setEditingSprint(sprint)
    setShowForm(true)
  }

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true)
      if (editingSprint) {
        await axios.put(`/api/sprints/${editingSprint._id}`, formData)
      } else {
        await axios.post("/api/sprints", formData)
      }
      setShowForm(false)
      setEditingSprint(null)
      await fetchSprints()
    } catch (err) {
      console.error("Error al guardar sprint:", err)
      setError("Error al guardar el sprint")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSprint = async (sprintId) => {
    setConfirmAction({
      type: "delete",
      sprintId,
      title: "Eliminar Sprint",
      message: "¿Estás seguro de que deseas eliminar este sprint? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      confirmClass: "bg-red-600 hover:bg-red-700",
    })
    setShowConfirmDialog(true)
  }

  const handleStartSprint = async (sprintId) => {
    // Verificar si se puede iniciar el sprint
    try {
      const response = await axios.get(`/api/sprints/${sprintId}/verificar-inicio`)
      if (!response.data.puedeIniciar) {
        setError(response.data.mensaje)
        return
      }
    } catch (err) {
      setError("Error al verificar el sprint")
      return
    }

    setConfirmAction({
      type: "start",
      sprintId,
      title: "Iniciar Sprint",
      message:
        "¿Estás seguro de que deseas iniciar este sprint? Una vez iniciado, no podrás modificar las historias asignadas.",
      confirmText: "Iniciar Sprint",
      confirmClass: "bg-green-600 hover:bg-green-700",
    })
    setShowConfirmDialog(true)
  }

  const handleFinishSprint = async (sprintId) => {
    // Verificar si se puede finalizar el sprint
    try {
      const response = await axios.get(`/api/sprints/${sprintId}/verificar-finalizacion`)
      if (!response.data.puedeFinalizar) {
        setError(response.data.mensaje)
        return
      }
    } catch (err) {
      setError("Error al verificar el sprint")
      return
    }

    setConfirmAction({
      type: "finish",
      sprintId,
      title: "Finalizar Sprint",
      message:
        "¿Estás seguro de que deseas finalizar este sprint? Todas las historias deben estar en la columna 'Terminadas'.",
      confirmText: "Finalizar Sprint",
      confirmClass: "bg-blue-600 hover:bg-blue-700",
    })
    setShowConfirmDialog(true)
  }

  const handleCancelSprint = async (sprintId) => {
    setConfirmAction({
      type: "cancel",
      sprintId,
      title: "Cancelar Sprint",
      message: "¿Estás seguro de que deseas cancelar este sprint?",
      confirmText: "Cancelar Sprint",
      confirmClass: "bg-red-600 hover:bg-red-700",
    })
    setShowConfirmDialog(true)
  }

  const executeConfirmAction = async () => {
    try {
      setLoading(true)
      const { type, sprintId } = confirmAction

      switch (type) {
        case "delete":
          await axios.delete(`/api/sprints/${sprintId}`)
          break
        case "start":
          await axios.post(`/api/sprints/${sprintId}/iniciar`)
          break
        case "finish":
          await axios.post(`/api/sprints/${sprintId}/finalizar`)
          break
        case "cancel":
          await axios.post(`/api/sprints/${sprintId}/cancelar`)
          break
      }

      setShowConfirmDialog(false)
      setConfirmAction(null)
      await fetchSprints()
    } catch (err) {
      console.error("Error al ejecutar acción:", err)
      setError(err.response?.data?.message || "Error al ejecutar la acción")
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "en progreso":
        return "bg-blue-100 text-blue-800"
      case "completado":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "pendiente":
        return <Clock className="h-4 w-4" />
      case "en progreso":
        return <Play className="h-4 w-4" />
      case "completado":
        return <CheckCircle className="h-4 w-4" />
      case "cancelado":
        return <Square className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calcularDuracion = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    const diffTime = Math.abs(fin - inicio)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calcularPuntosTotales = (historias) => {
    return historias.reduce((total, historia) => total + (historia.puntos || 0), 0)
  }

  if (loading && sprints.length === 0) {
    return (
      <div className="flex min-h-screen bg-secondary-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sprints</h1>
              {proyecto && (
                <p className="text-gray-600 mt-1">
                  Proyecto: <span className="font-medium">{proyecto.nombre}</span>
                </p>
              )}
            </div>
            <button
              onClick={handleCreateSprint}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Sprint
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                  <span className="sr-only">Cerrar</span>×
                </button>
              </div>
            </div>
          )}

          {/* Sprints Grid */}
          {sprints.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay sprints</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer sprint.</p>
              <div className="mt-6">
                <button
                  onClick={handleCreateSprint}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Sprint
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sprints.map((sprint) => (
                <div
                  key={sprint._id}
                  className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                    selectedSprint?._id === sprint._id ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  <div className="p-6">
                    {/* Header del Sprint */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{sprint.nombre}</h3>
                          <span className="text-sm text-gray-500">#{sprint.numero}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(
                              sprint.estado,
                            )}`}
                          >
                            {getEstadoIcon(sprint.estado)}
                            <span className="ml-1">
                              {sprint.estado === "pendiente"
                                ? "Pendiente"
                                : sprint.estado === "en progreso"
                                  ? "En Progreso"
                                  : sprint.estado === "completado"
                                    ? "Completado"
                                    : "Cancelado"}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setSelectedSprint(selectedSprint?._id === sprint._id ? null : sprint)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Objetivo */}
                    {sprint.objetivo && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{sprint.objetivo}</p>
                      </div>
                    )}

                    {/* Fechas */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {formatDate(sprint.fechaInicio)} - {formatDate(sprint.fechaFin)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{calcularDuracion(sprint.fechaInicio, sprint.fechaFin)} días</span>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-md">
                        <div className="text-2xl font-bold text-gray-900">{sprint.historias?.length || 0}</div>
                        <div className="text-xs text-gray-600">Historias</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-md">
                        <div className="text-2xl font-bold text-blue-600">
                          {calcularPuntosTotales(sprint.historias || [])}
                        </div>
                        <div className="text-xs text-gray-600">Puntos</div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex space-x-2">
                      {sprint.estado === "pendiente" && (
                        <>
                          <button
                            onClick={() => handleStartSprint(sprint._id)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Iniciar
                          </button>
                          <button
                            onClick={() => handleEditSprint(sprint)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSprint(sprint._id)}
                            className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {sprint.estado === "en progreso" && (
                        <>
                          <button
                            onClick={() => handleFinishSprint(sprint._id)}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Finalizar
                          </button>
                          <button
                            onClick={() => handleCancelSprint(sprint._id)}
                            className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-md hover:bg-red-200"
                          >
                            <Square className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {(sprint.estado === "completado" || sprint.estado === "cancelado") && (
                        <button
                          onClick={() => setSelectedSprint(sprint)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
                        >
                          Ver Detalles
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Historias expandidas */}
                  {selectedSprint?._id === sprint._id && sprint.historias && sprint.historias.length > 0 && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Historias del Sprint ({sprint.historias.length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {sprint.historias.map((historia) => (
                          <div key={historia._id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{historia.titulo}</p>
                              {historia.epicaId && (
                                <p className="text-xs text-gray-500">Épica: {historia.epicaId.titulo}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              {historia.puntos > 0 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {historia.puntos}
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  historia.estado === "completada"
                                    ? "bg-green-100 text-green-800"
                                    : historia.estado === "en progreso"
                                      ? "bg-blue-100 text-blue-800"
                                      : historia.estado === "en revisión"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {historia.estado}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sprint Form Modal */}
          {showForm && (
            <SprintForm
              sprint={editingSprint}
              proyecto={proyecto}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingSprint(null)
              }}
            />
          )}

          {/* Confirmation Dialog */}
          {showConfirmDialog && confirmAction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{confirmAction.title}</h3>
                  <p className="text-sm text-gray-600 mb-6">{confirmAction.message}</p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowConfirmDialog(false)
                        setConfirmAction(null)
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={executeConfirmAction}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmAction.confirmClass}`}
                    >
                      {confirmAction.confirmText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SprintsPage
