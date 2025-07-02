"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import DashboardStats from "../components/dashboard/DashboardStats"
import ProjectsList from "../components/dashboard/ProjectsList"
import RecentTasks from "../components/dashboard/RecentTasks"
import DashboardCharts from "../components/dashboard/DashboardCharts"
import { User, AlertCircle } from "lucide-react"

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProyectos: 0,
    proyectosActivos: 0,
    tareasPendientes: 0,
    tareasCompletadas: 0,
  })
  const [proyectos, setProyectos] = useState([])
  const [tareas, setTareas] = useState([])
  const [error, setError] = useState(null)
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    // Obtener usuario del localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      setUsuario(JSON.parse(userStr))
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obtener proyectos reales de la base de datos
        const proyectosRes = await axios.get("/api/proyectos")
        if (proyectosRes.data.success) {
          setProyectos(proyectosRes.data.proyectos || [])
        } else {
          throw new Error("Error al obtener proyectos")
        }

        // Obtener tareas recientes
        let todasLasTareas = []

        // Si hay proyectos, obtener tareas para cada uno
        if (proyectosRes.data.proyectos && proyectosRes.data.proyectos.length > 0) {
          // Obtener tareas de todos los proyectos
          const tareasPromises = proyectosRes.data.proyectos.map((proyecto) =>
            axios.get(`/api/tareas/proyecto/${proyecto._id}`),
          )

          const tareasResults = await Promise.allSettled(tareasPromises)

          // Procesar resultados de tareas
          tareasResults.forEach((result) => {
            if (result.status === "fulfilled" && result.value.data.success) {
              todasLasTareas = [...todasLasTareas, ...result.value.data.tareas]
            }
          })

          // Ordenar tareas por fecha de creación (más recientes primero)
          todasLasTareas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
        }

        setTareas(todasLasTareas)

        // Calcular estadísticas
        const proyectosActivos = proyectosRes.data.proyectos.filter((p) => p.estado === "activo").length
        const tareasPendientes = todasLasTareas.filter((t) => t.estado !== "completada").length
        const tareasCompletadas = todasLasTareas.filter((t) => t.estado === "completada").length

        setStats({
          totalProyectos: proyectosRes.data.proyectos.length,
          proyectosActivos,
          tareasPendientes,
          tareasCompletadas,
        })

        setLoading(false)
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err)
        setError("Error al cargar los datos. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="container mx-auto px-6 py-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-secondary-700">{usuario ? usuario.nombre : "Usuario"}</span>
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                {usuario && usuario.avatar ? (
                  <img
                    src={usuario.avatar || "/placeholder.svg"}
                    alt={usuario.nombre}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <User size={20} />
                )}
              </div>
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-secondary-600">Cargando datos...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-8">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <DashboardStats stats={stats} />

              <DashboardCharts stats={stats} proyectos={proyectos} tareas={tareas} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">Proyectos Recientes</h2>
                  {proyectos.length > 0 ? (
                    <ProjectsList proyectos={proyectos.slice(0, 5)} />
                  ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                      <p className="text-secondary-500">No hay proyectos disponibles</p>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">Tareas Recientes</h2>
                  {tareas.length > 0 ? (
                    <RecentTasks tareas={tareas.slice(0, 5)} />
                  ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                      <p className="text-secondary-500">No hay tareas disponibles</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

      
        </div>
      </div>
    </div>
  )
}

export default Dashboard
