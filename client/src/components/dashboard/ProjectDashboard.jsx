"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import Chart from "chart.js/auto"
import { AlertCircle, Info } from "lucide-react"

const ProjectDashboard = ({ proyectoId }) => {
  const [loading, setLoading] = useState(true)
  const [proyecto, setProyecto] = useState(null)
  const [tareas, setTareas] = useState([])
  const [epicas, setEpicas] = useState([])
  const [historias, setHistorias] = useState([])
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalTareas: 0,
    tareasPendientes: 0,
    tareasEnProgreso: 0,
    tareasCompletadas: 0,
    totalEpicas: 0,
    totalHistorias: 0,
  })

  const taskStatusChartRef = useRef(null)
  const taskPriorityChartRef = useRef(null)
  const taskTypeChartRef = useRef(null)
  const progressChartRef = useRef(null)

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obtener datos del proyecto
        const proyectoRes = await axios.get(`/api/proyectos/${proyectoId}`)
        if (!proyectoRes.data.success) {
          throw new Error("Error al obtener el proyecto")
        }

        setProyecto(proyectoRes.data.proyecto)

        // Obtener tareas del proyecto
        const tareasRes = await axios.get(`/api/tareas/proyecto/${proyectoId}`)
        if (!tareasRes.data.success) {
          console.warn("No se pudieron cargar las tareas del proyecto")
        }

        setTareas(tareasRes.data.tareas || [])

        // Intentar obtener épicas del proyecto
        try {
          const epicasRes = await axios.get(`/api/epicas/proyecto/${proyectoId}`)
          setEpicas(epicasRes.data.epicas || [])
        } catch (err) {
          console.warn("No se pudieron cargar las épicas del proyecto:", err)
          setEpicas([])
        }

        // Intentar obtener historias del proyecto
        try {
          const historiasRes = await axios.get(`/api/historias/proyecto/${proyectoId}`)
          setHistorias(historiasRes.data.historias || [])
        } catch (err) {
          console.warn("No se pudieron cargar las historias del proyecto:", err)
          setHistorias([])
        }

        setLoading(false)
      } catch (err) {
        console.error("Error al cargar datos del proyecto:", err)
        setError("Error al cargar los datos del proyecto. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
      }
    }

    if (proyectoId) {
      fetchProjectData()
    }
  }, [proyectoId])

  // Calcular estadísticas cuando cambian los datos
  useEffect(() => {
    const tareasPendientes = tareas.filter((t) => t.estado === "pendiente").length
    const tareasEnProgreso = tareas.filter((t) => t.estado === "en progreso").length
    const tareasEnRevision = tareas.filter((t) => t.estado === "en revisión").length
    const tareasCompletadas = tareas.filter((t) => t.estado === "completada").length

    setStats({
      totalTareas: tareas.length,
      tareasPendientes,
      tareasEnProgreso,
      tareasEnRevision,
      tareasCompletadas,
      totalEpicas: epicas.length,
      totalHistorias: historias.length,
    })
  }, [tareas, epicas, historias])

  // Crear gráficos cuando cambian los datos
  useEffect(() => {
    // Limpiar gráficos anteriores
    if (taskStatusChartRef.current?.chart) {
      taskStatusChartRef.current.chart.destroy()
    }
    if (taskPriorityChartRef.current?.chart) {
      taskPriorityChartRef.current.chart.destroy()
    }
    if (taskTypeChartRef.current?.chart) {
      taskTypeChartRef.current.chart.destroy()
    }
    if (progressChartRef.current?.chart) {
      progressChartRef.current.chart.destroy()
    }

    if (!loading && taskStatusChartRef.current) {
      // Gráfico de tareas por estado
      const estados = ["pendiente", "en progreso", "en revisión", "completada", "bloqueada"]
      const conteoEstados = estados.map((estado) => tareas.filter((tarea) => tarea.estado === estado).length)

      // Verificar si hay datos para mostrar
      const hayDatos = conteoEstados.some((count) => count > 0)

      if (hayDatos) {
        const ctx = taskStatusChartRef.current.getContext("2d")
        taskStatusChartRef.current.chart = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Pendiente", "En Progreso", "En Revisión", "Completada", "Bloqueada"],
            datasets: [
              {
                data: conteoEstados,
                backgroundColor: ["#ff9800", "#2196f3", "#9c27b0", "#4caf50", "#f44336"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
              },
              title: {
                display: true,
                text: "Tareas por Estado",
                font: {
                  size: 16,
                },
              },
            },
          },
        })
      }
    }

    if (!loading && taskPriorityChartRef.current) {
      // Gráfico de tareas por prioridad
      const prioridades = ["baja", "media", "alta", "crítica"]
      const conteoPrioridades = prioridades.map(
        (prioridad) => tareas.filter((tarea) => tarea.prioridad === prioridad).length,
      )

      // Verificar si hay datos para mostrar
      const hayDatos = conteoPrioridades.some((count) => count > 0)

      if (hayDatos) {
        const ctx = taskPriorityChartRef.current.getContext("2d")
        taskPriorityChartRef.current.chart = new Chart(ctx, {
          type: "pie",
          data: {
            labels: ["Baja", "Media", "Alta", "Crítica"],
            datasets: [
              {
                data: conteoPrioridades,
                backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#f44336"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
              },
              title: {
                display: true,
                text: "Tareas por Prioridad",
                font: {
                  size: 16,
                },
              },
            },
          },
        })
      }
    }

    if (!loading && taskTypeChartRef.current) {
      // Gráfico de tareas por tipo
      const tipos = ["funcionalidad", "bug", "mejora", "documentación"]
      const conteoTipos = tipos.map((tipo) => tareas.filter((tarea) => tarea.tipo === tipo).length)

      // Verificar si hay datos para mostrar
      const hayDatos = conteoTipos.some((count) => count > 0)

      if (hayDatos) {
        const ctx = taskTypeChartRef.current.getContext("2d")
        taskTypeChartRef.current.chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Funcionalidad", "Bug", "Mejora", "Documentación"],
            datasets: [
              {
                label: "Cantidad",
                data: conteoTipos,
                backgroundColor: ["#3f51b5", "#e91e63", "#009688", "#ff5722"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: "Tareas por Tipo",
                font: {
                  size: 16,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                },
              },
            },
          },
        })
      }
    }

    if (!loading && progressChartRef.current) {
      // Gráfico de progreso general
      const completado = stats.tareasCompletadas
      const pendiente = stats.totalTareas - completado

      // Verificar si hay datos para mostrar
      const hayDatos = stats.totalTareas > 0

      if (hayDatos) {
        const ctx = progressChartRef.current.getContext("2d")
        progressChartRef.current.chart = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Completado", "Pendiente"],
            datasets: [
              {
                data: [completado, pendiente],
                backgroundColor: ["#4caf50", "#e0e0e0"],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "75%",
            plugins: {
              legend: {
                display: false,
              },
              title: {
                display: true,
                text: "Progreso General",
                font: {
                  size: 16,
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const percentage = Math.round((context.raw / stats.totalTareas) * 100)
                    return `${context.label}: ${context.raw} (${percentage}%)`
                  },
                },
              },
            },
          },
        })
      }
    }

    // Limpiar gráficos al desmontar
    return () => {
      if (taskStatusChartRef.current?.chart) {
        taskStatusChartRef.current.chart.destroy()
      }
      if (taskPriorityChartRef.current?.chart) {
        taskPriorityChartRef.current.chart.destroy()
      }
      if (taskTypeChartRef.current?.chart) {
        taskTypeChartRef.current.chart.destroy()
      }
      if (progressChartRef.current?.chart) {
        progressChartRef.current.chart.destroy()
      }
    }
  }, [loading, tareas, stats])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-secondary-600">Cargando datos del proyecto...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-8">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!proyecto) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-8">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
          <p className="text-sm text-yellow-700">No se encontró información del proyecto.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-secondary-900 mb-4">{proyecto.nombre}</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="px-4 py-2 bg-secondary-100 rounded-md">
            <span className="text-xs text-secondary-500 block">Clave</span>
            <span className="font-medium">{proyecto.clave}</span>
          </div>
          <div className="px-4 py-2 bg-secondary-100 rounded-md">
            <span className="text-xs text-secondary-500 block">Estado</span>
            <span
              className={`font-medium ${
                proyecto.estado === "activo"
                  ? "text-green-600"
                  : proyecto.estado === "pausado"
                    ? "text-orange-600"
                    : proyecto.estado === "completado"
                      ? "text-blue-600"
                      : "text-red-600"
              }`}
            >
              {proyecto.estado.charAt(0).toUpperCase() + proyecto.estado.slice(1)}
            </span>
          </div>
          <div className="px-4 py-2 bg-secondary-100 rounded-md">
            <span className="text-xs text-secondary-500 block">Prioridad</span>
            <span
              className={`font-medium ${
                proyecto.prioridad === "baja"
                  ? "text-green-600"
                  : proyecto.prioridad === "media"
                    ? "text-blue-600"
                    : proyecto.prioridad === "alta"
                      ? "text-orange-600"
                      : "text-red-600"
              }`}
            >
              {proyecto.prioridad.charAt(0).toUpperCase() + proyecto.prioridad.slice(1)}
            </span>
          </div>
          <div className="px-4 py-2 bg-secondary-100 rounded-md">
            <span className="text-xs text-secondary-500 block">Fecha Inicio</span>
            <span className="font-medium">
              {proyecto.fechaInicio ? new Date(proyecto.fechaInicio).toLocaleDateString() : "No definida"}
            </span>
          </div>
          <div className="px-4 py-2 bg-secondary-100 rounded-md">
            <span className="text-xs text-secondary-500 block">Fecha Fin</span>
            <span className="font-medium">
              {proyecto.fechaFin ? new Date(proyecto.fechaFin).toLocaleDateString() : "No definida"}
            </span>
          </div>
        </div>
        <p className="text-secondary-600">{proyecto.descripcion}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Total Tareas</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalTareas}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Tareas Completadas</h3>
          <p className="text-3xl font-bold text-green-600">{stats.tareasCompletadas}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Total Épicas</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalEpicas}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Total Historias</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalHistorias}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-64">
            {tareas.length > 0 ? (
              <canvas ref={taskStatusChartRef}></canvas>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Info className="h-12 w-12 text-secondary-300 mb-2" />
                <p className="text-secondary-500 text-center">No hay tareas para mostrar estadísticas de estado</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-64">
            {tareas.length > 0 ? (
              <canvas ref={taskPriorityChartRef}></canvas>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Info className="h-12 w-12 text-secondary-300 mb-2" />
                <p className="text-secondary-500 text-center">No hay tareas para mostrar estadísticas de prioridad</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-64">
            {tareas.length > 0 ? (
              <canvas ref={taskTypeChartRef}></canvas>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Info className="h-12 w-12 text-secondary-300 mb-2" />
                <p className="text-secondary-500 text-center">No hay tareas para mostrar estadísticas de tipo</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-64 flex items-center justify-center">
            {tareas.length > 0 ? (
              <div className="relative w-48 h-48">
                <canvas ref={progressChartRef}></canvas>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-secondary-900">
                      {stats.totalTareas > 0 ? Math.round((stats.tareasCompletadas / stats.totalTareas) * 100) : 0}%
                    </span>
                    <span className="block text-sm text-secondary-500">Completado</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Info className="h-12 w-12 text-secondary-300 mb-2" />
                <p className="text-secondary-500 text-center">No hay tareas para mostrar el progreso</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Tareas Recientes</h3>
          {tareas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {tareas.slice(0, 5).map((tarea) => (
                    <tr key={tarea._id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-secondary-900">{tarea.titulo}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tarea.estado === "completada"
                              ? "bg-green-100 text-green-800"
                              : tarea.estado === "en progreso"
                                ? "bg-blue-100 text-blue-800"
                                : tarea.estado === "en revisión"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tarea.prioridad === "baja"
                              ? "bg-green-100 text-green-800"
                              : tarea.prioridad === "media"
                                ? "bg-blue-100 text-blue-800"
                                : tarea.prioridad === "alta"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tarea.prioridad.charAt(0).toUpperCase() + tarea.prioridad.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Info className="h-8 w-8 text-secondary-300 mx-auto mb-2" />
              <p className="text-secondary-500">No hay tareas para este proyecto</p>
              <p className="text-sm text-secondary-400 mt-1">Crea tareas para ver información aquí</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Épicas</h3>
          {epicas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {epicas.slice(0, 5).map((epica) => (
                    <tr key={epica._id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-secondary-900">{epica.titulo}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            epica.estado === "completada"
                              ? "bg-green-100 text-green-800"
                              : epica.estado === "en progreso"
                                ? "bg-blue-100 text-blue-800"
                                : epica.estado === "en revisión"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {epica.estado.charAt(0).toUpperCase() + epica.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            epica.prioridad === "baja"
                              ? "bg-green-100 text-green-800"
                              : epica.prioridad === "media"
                                ? "bg-blue-100 text-blue-800"
                                : epica.prioridad === "alta"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {epica.prioridad.charAt(0).toUpperCase() + epica.prioridad.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Info className="h-8 w-8 text-secondary-300 mx-auto mb-2" />
              <p className="text-secondary-500">No hay épicas para este proyecto</p>
              <p className="text-sm text-secondary-400 mt-1">Crea épicas para ver información aquí</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDashboard
