"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import { Plus, AlertCircle, Calendar, CheckCircle, ArrowRight, BarChart2 } from "lucide-react"

const SprintsPage = () => {
  const { proyectoId } = useParams()
  const [sprints, setSprints] = useState([])
  const [proyecto, setProyecto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSprintForm, setShowSprintForm] = useState(false)
  const [currentSprint, setCurrentSprint] = useState(null)
  const [historiasSinAsignar, setHistoriasSinAsignar] = useState([])

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obtener datos del proyecto
        let proyectoData = null
        try {
          const proyectoRes = await axios.get(`/api/proyectos/${proyectoId}`)
          proyectoData = proyectoRes.data.proyecto
          setProyecto(proyectoData)
        } catch (err) {
          console.error("Error al obtener proyecto:", err)
          setError(`Error al obtener proyecto: ${err.message}`)
          setLoading(false)
          return
        }

        // Obtener sprints del proyecto
        try {
          const sprintsRes = await axios.get(`/api/sprints/proyecto/${proyectoId}`)
          setSprints(sprintsRes.data.sprints)
        } catch (err) {
          console.error("Error al obtener sprints:", err)

          // Si hay un error específico, mostrarlo
          if (err.response && err.response.data && err.response.data.message) {
            setError(`Error al obtener sprints: ${err.response.data.message}`)
          } else {
            setError(`Error al obtener sprints: ${err.message}`)
          }

          // Usar datos simulados solo si es un error de "no encontrado"
          if (err.response && err.response.status === 404) {
            // Datos simulados para sprints
            const sprintsSimulados = [
              {
                _id: "s1",
                nombre: "Sprint 1",
                objetivo: "Implementar funcionalidades básicas de usuarios",
                fechaInicio: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                fechaFin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                estado: "completado",
                historias: [
                  {
                    _id: "h1",
                    titulo: "Registro de usuarios",
                    estado: "completada",
                    puntos: 5,
                  },
                  {
                    _id: "h2",
                    titulo: "Inicio de sesión",
                    estado: "completada",
                    puntos: 3,
                  },
                ],
              },
              {
                _id: "s2",
                nombre: "Sprint 2",
                objetivo: "Implementar gestión de proyectos",
                fechaInicio: new Date(),
                fechaFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                estado: "en progreso",
                historias: [
                  {
                    _id: "h3",
                    titulo: "Crear proyectos",
                    estado: "en progreso",
                    puntos: 8,
                  },
                  {
                    _id: "h4",
                    titulo: "Editar proyectos",
                    estado: "pendiente",
                    puntos: 5,
                  },
                ],
              },
            ]
            setSprints(sprintsSimulados)
          }
        }

        // Obtener historias sin asignar a sprint
        try {
          const historiasRes = await axios.get(`/api/historias/proyecto/${proyectoId}/sin-sprint`)
          setHistoriasSinAsignar(historiasRes.data.historias)
        } catch (err) {
          console.error("Error al obtener historias sin asignar:", err)

          // Historias sin asignar a sprint (simuladas)
          const historiasSinAsignarSimuladas = [
            {
              _id: "h5",
              titulo: "Eliminar proyectos",
              descripcion: "Como administrador, quiero poder eliminar proyectos para mantener organizada la plataforma",
              estado: "pendiente",
              puntos: 3,
              epicaId: "e1",
              epicaNombre: "Gestión de proyectos",
            },
            {
              _id: "h6",
              titulo: "Filtrar proyectos",
              descripcion: "Como usuario, quiero poder filtrar proyectos para encontrar rápidamente lo que busco",
              estado: "pendiente",
              puntos: 5,
              epicaId: "e1",
              epicaNombre: "Gestión de proyectos",
            },
          ]
          setHistoriasSinAsignar(historiasSinAsignarSimuladas)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error general:", err)
        setError(`Error al cargar los datos: ${err.message}`)
        setLoading(false)
      }
    }

    if (proyectoId) {
      fetchSprints()
    }
  }, [proyectoId])

  const handleCreateSprint = () => {
    setCurrentSprint(null)
    setShowSprintForm(true)
  }

  const handleEditSprint = (sprint) => {
    setCurrentSprint(sprint)
    setShowSprintForm(true)
  }

  const handleDeleteSprint = (sprintId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este sprint? Esta acción no se puede deshacer.")) {
      setSprints(sprints.filter((s) => s._id !== sprintId))
    }
  }

  const handleSprintSubmit = (formData) => {
    try {
      if (currentSprint) {
        // Actualizar sprint existente
        setSprints(
          sprints.map((s) =>
            s._id === currentSprint._id
              ? {
                  ...s,
                  ...formData,
                }
              : s,
          ),
        )
      } else {
        // Crear nuevo sprint
        const nuevoSprint = {
          _id: `s${Date.now()}`,
          ...formData,
          estado: "pendiente",
          historias: [],
        }
        setSprints([...sprints, nuevoSprint])
      }

      // Cerrar el formulario
      setShowSprintForm(false)
    } catch (err) {
      console.error("Error al guardar el sprint:", err)
      setError("Error al guardar el sprint. Por favor, intenta de nuevo más tarde.")
    }
  }

  const handleAddHistoriaToSprint = (sprintId, historiaId) => {
    // Encontrar la historia
    const historia = historiasSinAsignar.find((h) => h._id === historiaId)
    if (!historia) return

    // Actualizar sprints
    setSprints(
      sprints.map((s) => {
        if (s._id === sprintId) {
          return {
            ...s,
            historias: [...s.historias, historia],
          }
        }
        return s
      }),
    )

    // Eliminar de historias sin asignar
    setHistoriasSinAsignar(historiasSinAsignar.filter((h) => h._id !== historiaId))
  }

  const handleRemoveHistoriaFromSprint = (sprintId, historiaId) => {
    // Encontrar el sprint
    const sprint = sprints.find((s) => s._id === sprintId)
    if (!sprint) return

    // Encontrar la historia
    const historia = sprint.historias.find((h) => h._id === historiaId)
    if (!historia) return

    // Actualizar sprints
    setSprints(
      sprints.map((s) => {
        if (s._id === sprintId) {
          return {
            ...s,
            historias: s.historias.filter((h) => h._id !== historiaId),
          }
        }
        return s
      }),
    )

    // Añadir a historias sin asignar
    setHistoriasSinAsignar([...historiasSinAsignar, historia])
  }

  // Calcular el progreso del sprint
  const calcularProgresoSprint = (sprint) => {
    if (!sprint.historias || sprint.historias.length === 0) return 0

    const completadas = sprint.historias.filter((historia) => historia.estado === "completada").length

    return Math.round((completadas / sprint.historias.length) * 100)
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "No definida"
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="container mx-auto px-6 py-8">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Sprints</h1>
              {proyecto && (
                <p className="text-secondary-600">
                  Proyecto: <span className="font-medium">{proyecto.nombre}</span>
                </p>
              )}
            </div>
            <button
              onClick={handleCreateSprint}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Sprint
            </button>
          </header>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-secondary-600">Cargando sprints...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Sprint actual */}
              {sprints.filter((s) => s.estado === "en progreso").length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">Sprint Actual</h2>
                  {sprints
                    .filter((s) => s.estado === "en progreso")
                    .map((sprint) => (
                      <div
                        key={sprint._id}
                        className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-secondary-900">{sprint.nombre}</h3>
                              <p className="text-secondary-600 mt-1">{sprint.objetivo}</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              En Progreso
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center text-sm text-secondary-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Inicio: {formatDate(sprint.fechaInicio)}</span>
                            </div>
                            <div className="flex items-center text-sm text-secondary-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Fin: {formatDate(sprint.fechaFin)}</span>
                            </div>
                            <div className="flex items-center text-sm text-secondary-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span>Historias: {sprint.historias.length}</span>
                            </div>
                          </div>

                          {/* Barra de progreso */}
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-secondary-700">Progreso</span>
                              <span className="text-sm font-medium text-secondary-700">
                                {calcularProgresoSprint(sprint)}%
                              </span>
                            </div>
                            <div className="w-full bg-secondary-200 rounded-full h-2.5">
                              <div
                                className="bg-primary-600 h-2.5 rounded-full"
                                style={{ width: `${calcularProgresoSprint(sprint)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Historias del sprint */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-secondary-900 mb-2">Historias de Usuario</h4>
                            {sprint.historias.length > 0 ? (
                              <div className="bg-secondary-50 rounded-md p-4">
                                <ul className="divide-y divide-secondary-200">
                                  {sprint.historias.map((historia) => (
                                    <li key={historia._id} className="py-3 flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div
                                          className={`h-2.5 w-2.5 rounded-full mr-2 ${
                                            historia.estado === "completada"
                                              ? "bg-green-500"
                                              : historia.estado === "en progreso"
                                                ? "bg-blue-500"
                                                : "bg-secondary-400"
                                          }`}
                                        ></div>
                                        <span className="text-sm font-medium text-secondary-900">
                                          {historia.titulo}
                                        </span>
                                      </div>
                                      <div className="flex items-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-800 mr-2">
                                          {historia.puntos} pts
                                        </span>
                                        <button
                                          onClick={() => handleRemoveHistoriaFromSprint(sprint._id, historia._id)}
                                          className="text-secondary-400 hover:text-secondary-500"
                                        >
                                          <ArrowRight className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <p className="text-sm text-secondary-500 italic">
                                No hay historias asignadas a este sprint.
                              </p>
                            )}
                          </div>

                          {/* Acciones */}
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditSprint(sprint)}
                              className="inline-flex items-center px-3 py-1.5 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteSprint(sprint._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Sprints futuros */}
              {sprints.filter((s) => s.estado === "pendiente").length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">Sprints Futuros</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sprints
                      .filter((s) => s.estado === "pendiente")
                      .map((sprint) => (
                        <div
                          key={sprint._id}
                          className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-lg font-medium text-secondary-900">{sprint.nombre}</h3>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                                Pendiente
                              </span>
                            </div>

                            <p className="text-secondary-600 text-sm mb-3">{sprint.objetivo}</p>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="flex items-center text-xs text-secondary-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Inicio: {formatDate(sprint.fechaInicio)}</span>
                              </div>
                              <div className="flex items-center text-xs text-secondary-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Fin: {formatDate(sprint.fechaFin)}</span>
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex justify-end space-x-2 mt-3">
                              <button
                                onClick={() => handleEditSprint(sprint)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-secondary-700 hover:text-secondary-900"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteSprint(sprint._id)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Sprints completados */}
              {sprints.filter((s) => s.estado === "completado").length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">Sprints Completados</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sprints
                      .filter((s) => s.estado === "completado")
                      .map((sprint) => (
                        <div
                          key={sprint._id}
                          className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="text-lg font-medium text-secondary-900">{sprint.nombre}</h3>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completado
                              </span>
                            </div>

                            <p className="text-secondary-600 text-sm mb-3">{sprint.objetivo}</p>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="flex items-center text-xs text-secondary-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Inicio: {formatDate(sprint.fechaInicio)}</span>
                              </div>
                              <div className="flex items-center text-xs text-secondary-600">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Fin: {formatDate(sprint.fechaFin)}</span>
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex justify-end space-x-2 mt-3">
                              <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-800">
                                <BarChart2 className="h-3 w-3 mr-1" />
                                Ver Métricas
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Historias sin asignar */}
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Historias sin Asignar</h2>
                {historiasSinAsignar.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
                    <div className="p-4">
                      <ul className="divide-y divide-secondary-200">
                        {historiasSinAsignar.map((historia) => (
                          <li key={historia._id} className="py-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-medium text-secondary-900">{historia.titulo}</h4>
                                <p className="text-xs text-secondary-500 mt-1">{historia.descripcion}</p>
                                <div className="flex items-center mt-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-800 mr-2">
                                    {historia.puntos} pts
                                  </span>
                                  <span className="text-xs text-secondary-600">Épica: {historia.epicaNombre}</span>
                                </div>
                              </div>
                              <div>
                                {sprints.filter((s) => s.estado !== "completado").length > 0 && (
                                  <select
                                    className="text-sm border-secondary-300 rounded-md"
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleAddHistoriaToSprint(e.target.value, historia._id)
                                      }
                                    }}
                                    defaultValue=""
                                  >
                                    <option value="" disabled>
                                      Añadir a sprint
                                    </option>
                                    {sprints
                                      .filter((s) => s.estado !== "completado")
                                      .map((sprint) => (
                                        <option key={sprint._id} value={sprint._id}>
                                          {sprint.nombre}
                                        </option>
                                      ))}
                                  </select>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-secondary-50 p-4 rounded-md">
                    <p className="text-secondary-600 text-sm">No hay historias sin asignar.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal para crear/editar sprint */}
          {showSprintForm && (
            <div className="fixed inset-0 bg-secondary-900 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                    {currentSprint ? "Editar Sprint" : "Nuevo Sprint"}
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = {
                        nombre: e.target.nombre.value,
                        objetivo: e.target.objetivo.value,
                        fechaInicio: e.target.fechaInicio.value,
                        fechaFin: e.target.fechaFin.value,
                      }
                      handleSprintSubmit(formData)
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-secondary-700 mb-1">
                        Nombre del Sprint *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        defaultValue={currentSprint?.nombre || ""}
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="objetivo" className="block text-sm font-medium text-secondary-700 mb-1">
                        Objetivo del Sprint
                      </label>
                      <textarea
                        id="objetivo"
                        name="objetivo"
                        defaultValue={currentSprint?.objetivo || ""}
                        rows="3"
                        className="form-textarea"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fechaInicio" className="block text-sm font-medium text-secondary-700 mb-1">
                          Fecha de Inicio *
                        </label>
                        <input
                          type="date"
                          id="fechaInicio"
                          name="fechaInicio"
                          defaultValue={
                            currentSprint?.fechaInicio
                              ? new Date(currentSprint.fechaInicio).toISOString().split("T")[0]
                              : new Date().toISOString().split("T")[0]
                          }
                          className="form-input"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="fechaFin" className="block text-sm font-medium text-secondary-700 mb-1">
                          Fecha de Fin *
                        </label>
                        <input
                          type="date"
                          id="fechaFin"
                          name="fechaFin"
                          defaultValue={
                            currentSprint?.fechaFin ? new Date(currentSprint.fechaFin).toISOString().split("T")[0] : ""
                          }
                          className="form-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowSprintForm(false)}
                        className="px-4 py-2 bg-secondary-200 text-secondary-800 rounded-md hover:bg-secondary-300 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                      >
                        {currentSprint ? "Actualizar Sprint" : "Crear Sprint"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <Footer />
        </div>
      </div>
    </div>
  )
}

export default SprintsPage
