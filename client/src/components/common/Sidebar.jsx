"use client"

// Modificar el componente Sidebar para que primero muestre la selección de proyectos
// y luego las opciones de gestión para el proyecto seleccionado

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Kanban,
  MessageSquare,
  Bell,
  Bot,
  Settings,
  LogOut,
  SmartphoneIcon as Sprint,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Plus,
} from "lucide-react"

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [proyectos, setProyectos] = useState([])
  const [selectedProyecto, setSelectedProyecto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedProyectos, setExpandedProyectos] = useState(true)
  const [userRole, setUserRole] = useState(null)

  // Obtener el rol del usuario
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const userData = JSON.parse(user)
        setUserRole(userData.rol)
      } catch (error) {
        console.error("Error al parsear datos del usuario:", error)
      }
    }
  }, [])

  // Cargar proyectos
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        setLoading(true)
        const res = await axios.get("/api/proyectos")
        setProyectos(res.data.proyectos)

        // Si hay un proyecto en la URL, seleccionarlo
        const urlProyectoId = location.pathname.split("/").find(
          (segment) => segment.match(/^[0-9a-fA-F]{24}$/), // Buscar un segmento que parezca un ID de MongoDB
        )

        if (urlProyectoId && res.data.proyectos.some((p) => p._id === urlProyectoId)) {
          setSelectedProyecto(urlProyectoId)
        } else if (res.data.proyectos.length > 0 && !selectedProyecto) {
          // Si no hay proyecto en la URL pero hay proyectos disponibles, seleccionar el primero
          setSelectedProyecto(res.data.proyectos[0]._id)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error al cargar proyectos:", err)
        setError("Error al cargar proyectos")
        setLoading(false)
      }
    }

    fetchProyectos()
  }, [location.pathname, selectedProyecto])

  const handleSelectProyecto = (proyectoId) => {
    setSelectedProyecto(proyectoId)
    // Navegar al dashboard del proyecto
    navigate(`/proyecto/${proyectoId}`)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  const toggleProyectos = () => {
    setExpandedProyectos(!expandedProyectos)
  }

  // Opciones de gestión para un proyecto específico
  const proyectoMenuItems = [
    { name: "Resumen", path: `/proyecto/${selectedProyecto}`, icon: <LayoutDashboard size={20} /> },
    { name: "Backlog", path: `/backlog/${selectedProyecto}`, icon: <BookOpen size={20} /> },
    { name: "Sprints", path: `/sprints/${selectedProyecto}`, icon: <Sprint size={20} /> },
    { name: "Tablero", path: `/tableros/${selectedProyecto}`, icon: <Kanban size={20} /> },
    // Solo mostrar Tareas si el usuario es admin
  ]

  // Opciones generales
  const generalMenuItems = [
    // Solo mostrar Equipos si el usuario es admin
    ...(userRole === "admin" ? [{ name: "Equipos", path: "/equipos", icon: <Users size={20} /> }] : []),
    { name: "Mensajes", path: "/mensajes", icon: <MessageSquare size={20} /> },
    { name: "Notificaciones", path: "/notificaciones", icon: <Bell size={20} /> },
    { name: "IA Asistente", path: "/ia-asistente", icon: <Bot size={20} /> },
            ...(userRole === "admin"
      ? [{ name: "AlertasIA", path: `/tareas/${selectedProyecto}`, icon: <CheckSquare size={20} /> }]
      : []),
    { name: "Configuración", path: "/configuracion", icon: <Settings size={20} /> },
  ]

  return (
    <div className="w-64 bg-secondary-800 text-white h-screen flex flex-col fixed shadow-lg">
      <div className="p-6 border-b border-secondary-700">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
          <h2 className="text-xl font-bold">Project Manager</h2>
        </div>
      </div>
      {/* Mejorar el scroll visual del sidebar */}
      <nav className="flex-grow py-4 overflow-y-auto custom-scrollbar">
        {/* Dashboard general fuera del menú de proyectos */}
        <ul className="space-y-1 px-2 mb-4">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                location.pathname === "/dashboard"
                  ? "bg-secondary-700 text-white"
                  : "text-secondary-300 hover:bg-secondary-700 hover:text-white"
              }`}
            >
              <span className="mr-3">
                <LayoutDashboard size={20} />
              </span>
              <span>Dashboard General</span>
            </Link>
          </li>
        </ul>

        <div className="px-4 mb-2">
          <div
            className="flex items-center justify-between text-secondary-300 hover:text-white cursor-pointer py-2"
            onClick={toggleProyectos}
          >
            <span className="font-medium">PROYECTOS</span>
            {expandedProyectos ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {expandedProyectos && (
            <div className="ml-2 mt-1 space-y-1">
              {loading ? (
                <div className="text-secondary-400 text-sm py-1">Cargando proyectos...</div>
              ) : error ? (
                <div className="text-red-400 text-sm py-1">{error}</div>
              ) : proyectos.length === 0 ? (
                <div className="text-secondary-400 text-sm py-1">No hay proyectos</div>
              ) : (
                proyectos.map((proyecto) => (
                  <div
                    key={proyecto._id}
                    className={`flex items-center px-2 py-1.5 text-sm rounded-md cursor-pointer ${
                      selectedProyecto === proyecto._id
                        ? "bg-secondary-700 text-white"
                        : "text-secondary-300 hover:bg-secondary-700 hover:text-white"
                    }`}
                    onClick={() => handleSelectProyecto(proyecto._id)}
                  >
                    <FolderKanban size={16} className="mr-2" />
                    <span className="truncate">{proyecto.nombre}</span>
                  </div>
                ))
              )}

              <Link
                to="/proyectos"
                className="flex items-center px-2 py-1.5 text-sm text-secondary-300 hover:bg-secondary-700 hover:text-white rounded-md"
              >
                <Plus size={16} className="mr-2" />
                <span>Gestionar proyectos</span>
              </Link>
            </div>
          )}
        </div>

        {selectedProyecto && (
          <>
            <div className="px-4 py-2">
              <div className="text-xs font-semibold text-secondary-400 uppercase tracking-wider">
                GESTIÓN DE PROYECTO
              </div>
            </div>
            <ul className="space-y-1 px-2">
              {proyectoMenuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                      location.pathname === item.path
                        ? "bg-secondary-700 text-white"
                        : "text-secondary-300 hover:bg-secondary-700 hover:text-white"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="px-4 py-2 mt-4">
          <div className="text-xs font-semibold text-secondary-400 uppercase tracking-wider">GENERAL</div>
        </div>
        <ul className="space-y-1 px-2">
          {generalMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                  location.pathname === item.path
                    ? "bg-secondary-700 text-white"
                    : "text-secondary-300 hover:bg-secondary-700 hover:text-white"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-secondary-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-secondary-300 hover:bg-secondary-700 hover:text-white rounded transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
