"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import DashboardStats from "../components/dashboard/DashboardStats"
import ProjectsList from "../components/dashboard/ProjectsList"
import RecentTasks from "../components/dashboard/RecentTasks"
import DashboardCharts from "../components/dashboard/DashboardCharts"

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Datos simulados para proyectos
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
          },
        ]

        // Intentar obtener proyectos reales
        try {
          const proyectosRes = await axios.get("/api/proyectos")
          if (proyectosRes.data.proyectos && proyectosRes.data.proyectos.length > 0) {
            setProyectos(proyectosRes.data.proyectos)
          } else {
            setProyectos(proyectosSimulados)
          }
        } catch (err) {
          console.error("Error al obtener proyectos reales:", err)
          setProyectos(proyectosSimulados)
        }

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
          },
        ]

        setTareas(tareasSimuladas)

        // Calcular estadísticas
        const proyectosActivos = proyectos.filter((p) => p.estado === "activo").length || 2
        const tareasPendientes = tareasSimuladas.filter((t) => t.estado !== "completada").length
        const tareasCompletadas = tareasSimuladas.filter((t) => t.estado === "completada").length

        setStats({
          totalProyectos: proyectos.length || 3,
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
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="user-profile">
            <span className="user-name">
              {localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).nombre : "Usuario"}
            </span>
            <div className="avatar">👤</div>
          </div>
        </header>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <DashboardStats stats={stats} />

            <DashboardCharts stats={stats} proyectos={proyectos} tareas={tareas} />

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Proyectos Recientes</h2>
                <ProjectsList proyectos={proyectos.slice(0, 5)} />
              </div>

              <div className="dashboard-card">
                <h2>Tareas Recientes</h2>
                <RecentTasks tareas={tareas} />
              </div>
            </div>
          </>
        )}

        <Footer />
      </div>
    </div>
  )
}

export default Dashboard
