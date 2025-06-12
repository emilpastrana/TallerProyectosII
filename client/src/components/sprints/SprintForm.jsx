"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import axios from "axios"

const SprintForm = ({ sprint, proyecto, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    objetivo: "",
    fechaInicio: "",
    fechaFin: "",
    historiasSeleccionadas: [],
  })
  const [historiasDisponibles, setHistoriasDisponibles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (sprint) {
      setFormData({
        nombre: sprint.nombre || "",
        objetivo: sprint.objetivo || "",
        fechaInicio: sprint.fechaInicio ? new Date(sprint.fechaInicio).toISOString().split("T")[0] : "",
        fechaFin: sprint.fechaFin ? new Date(sprint.fechaFin).toISOString().split("T")[0] : "",
        historiasSeleccionadas: sprint.historias ? sprint.historias.map((h) => h._id) : [],
      })
    } else {
      // Para nuevo sprint, establecer fechas por defecto
      const hoy = new Date()
      const enDosSemanasDate = new Date(hoy.getTime() + 14 * 24 * 60 * 60 * 1000)

      setFormData({
        nombre: "",
        objetivo: "",
        fechaInicio: hoy.toISOString().split("T")[0],
        fechaFin: enDosSemanasDate.toISOString().split("T")[0],
        historiasSeleccionadas: [],
      })
    }
  }, [sprint])

  useEffect(() => {
    const fetchHistoriasDisponibles = async () => {
      if (!proyecto?._id) return

      try {
        setLoading(true)

        // Obtener historias sin asignar
        const response = await axios.get(`/api/sprints/proyecto/${proyecto._id}/historias-disponibles`)

        // Si estamos editando un sprint, también incluir las historias ya asignadas a este sprint
        let todasHistorias = response.data.historias || []

        if (sprint && sprint._id) {
          const sprintResponse = await axios.get(`/api/sprints/${sprint._id}`)
          if (sprintResponse.data.sprint.historias) {
            // Combinar historias disponibles con las ya asignadas a este sprint
            const historiasDelSprint = sprintResponse.data.sprint.historias

            // Filtrar para evitar duplicados
            const idsDisponibles = new Set(todasHistorias.map((h) => h._id))
            const historiasAdicionales = historiasDelSprint.filter((h) => !idsDisponibles.has(h._id))

            todasHistorias = [...todasHistorias, ...historiasAdicionales]
          }
        }

        setHistoriasDisponibles(todasHistorias)
      } catch (err) {
        console.error("Error al obtener historias disponibles:", err)
        setError("Error al cargar las historias disponibles")
      } finally {
        setLoading(false)
      }
    }

    fetchHistoriasDisponibles()
  }, [proyecto, sprint])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleHistoriaToggle = (historiaId) => {
    setFormData((prev) => ({
      ...prev,
      historiasSeleccionadas: prev.historiasSeleccionadas.includes(historiaId)
        ? prev.historiasSeleccionadas.filter((id) => id !== historiaId)
        : [...prev.historiasSeleccionadas, historiaId],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (!formData.nombre.trim()) {
      setError("El nombre del sprint es obligatorio")
      return
    }

    if (!formData.fechaInicio || !formData.fechaFin) {
      setError("Las fechas de inicio y fin son obligatorias")
      return
    }

    if (new Date(formData.fechaInicio) >= new Date(formData.fechaFin)) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio")
      return
    }

    onSubmit({
      ...formData,
      proyecto: proyecto._id,
    })
  }

  const calcularPuntosSeleccionados = () => {
    return historiasDisponibles
      .filter((historia) => formData.historiasSeleccionadas.includes(historia._id))
      .reduce((total, historia) => total + (historia.puntos || 0), 0)
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

  const puedeModificarHistorias = !sprint || sprint.estado === "pendiente"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{sprint ? "Editar Sprint" : "Crear Nuevo Sprint"}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica del sprint */}
            <div className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Sprint *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Sprint 1 - Funcionalidades básicas"
                  required
                />
              </div>

              <div>
                <label htmlFor="objetivo" className="block text-sm font-medium text-gray-700 mb-1">
                  Objetivo del Sprint
                </label>
                <textarea
                  id="objetivo"
                  name="objetivo"
                  value={formData.objetivo}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el objetivo principal de este sprint..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    id="fechaInicio"
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin *
                  </label>
                  <input
                    type="date"
                    id="fechaFin"
                    name="fechaFin"
                    value={formData.fechaFin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {sprint && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Estado:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sprint.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-800"
                          : sprint.estado === "en progreso"
                            ? "bg-blue-100 text-blue-800"
                            : sprint.estado === "completado"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sprint.estado === "pendiente"
                        ? "Pendiente"
                        : sprint.estado === "en progreso"
                          ? "En Progreso"
                          : sprint.estado === "completado"
                            ? "Completado"
                            : "Cancelado"}
                    </span>
                  </p>
                  {sprint.numero && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Sprint #{sprint.numero}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Selección de historias */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Historias del Sprint</h3>
                <div className="text-sm text-gray-600">
                  {formData.historiasSeleccionadas.length} historias seleccionadas
                  {formData.historiasSeleccionadas.length > 0 && (
                    <span className="ml-2 font-medium">({calcularPuntosSeleccionados()} puntos)</span>
                  )}
                </div>
              </div>

              {!puedeModificarHistorias && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    No se pueden modificar las historias de un sprint que ya está en progreso o completado.
                  </p>
                </div>
              )}

              <div className="border border-gray-200 rounded-md max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Cargando historias disponibles...</div>
                ) : historiasDisponibles.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No hay historias disponibles para asignar</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {historiasDisponibles.map((historia) => (
                      <div key={historia._id} className="p-3">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.historiasSeleccionadas.includes(historia._id)}
                            onChange={() => handleHistoriaToggle(historia._id)}
                            disabled={!puedeModificarHistorias}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 truncate">{historia.titulo}</h4>
                              <div className="flex items-center space-x-2 ml-2">
                                {historia.puntos > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {historia.puntos} pts
                                  </span>
                                )}
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(
                                    historia.prioridad,
                                  )}`}
                                >
                                  {historia.prioridad}
                                </span>
                              </div>
                            </div>
                            {historia.descripcion && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{historia.descripcion}</p>
                            )}
                            {historia.epicaId && (
                              <p className="text-xs text-gray-400 mt-1">Épica: {historia.epicaId.titulo}</p>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Guardando..." : sprint ? "Actualizar Sprint" : "Crear Sprint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SprintForm
