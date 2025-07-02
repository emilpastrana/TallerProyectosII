"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import ProjectDashboard from "../components/dashboard/ProjectDashboard"
import { User, AlertCircle } from "lucide-react"

const ProyectoDashboard = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [proyecto, setProyecto] = useState(null)
  const [error, setError] = useState(null)
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    // Obtener usuario del localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      setUsuario(JSON.parse(userStr))
    }

    const fetchProyecto = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/api/proyectos/${id}`)
        setProyecto(res.data.proyecto)
        setLoading(false)
      } catch (err) {
        console.error("Error al cargar el proyecto:", err)
        setError("Error al cargar el proyecto. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
      }
    }

    if (id) {
      fetchProyecto()
    }
  }, [id])

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="container mx-auto px-6 py-8">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-secondary-900">
              {loading ? "Cargando proyecto..." : proyecto ? proyecto.nombre : "Proyecto"}
            </h1>
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

          {error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-8">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          ) : (
            <ProjectDashboard proyectoId={id} />
          )}


        </div>
      </div>
    </div>
  )
}

export default ProyectoDashboard
