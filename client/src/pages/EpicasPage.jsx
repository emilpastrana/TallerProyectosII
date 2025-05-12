"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import EpicasList from "../components/epicas/EpicasList"
import EpicaForm from "../components/epicas/EpicaForm"
import HistoriaForm from "../components/historias/HistoriaForm"
import { Plus, AlertCircle } from "lucide-react"

const EpicasPage = () => {
  const { proyectoId } = useParams()
  const [epicas, setEpicas] = useState([])
  const [proyecto, setProyecto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEpicaForm, setShowEpicaForm] = useState(false)
  const [showHistoriaForm, setShowHistoriaForm] = useState(false)
  const [currentEpica, setCurrentEpica] = useState(null)
  const [currentEpicaId, setCurrentEpicaId] = useState(null)

  useEffect(() => {
    const fetchEpicas = async () => {
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
          // Datos simulados para el proyecto
          proyectoData = {
            _id: proyectoId,
            nombre: "Proyecto de ejemplo",
            clave: "PRO",
            descripcion: "Descripción del proyecto de ejemplo",
          }
          setProyecto(proyectoData)
        }

        // Obtener épicas del proyecto
        try {
          const epicasRes = await axios.get(`/api/epicas/proyecto/${proyectoId}`)
          setEpicas(epicasRes.data.epicas)
        } catch (err) {
          console.error("Error al obtener épicas:", err)
          // Datos simulados para épicas
          const epicasSimuladas = [
            {
              _id: "e1",
              titulo: "Gestión de usuarios",
              descripcion: "Funcionalidades relacionadas con la gestión de usuarios",
              proyecto: proyectoId,
              prioridad: "alta",
              estado: "en progreso",
              fechaInicio: new Date(),
              fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              historias: [
                {
                  _id: "h1",
                  titulo: "Registro de usuarios",
                  descripcion:
                    "Como usuario, quiero poder registrarme en la plataforma para acceder a sus funcionalidades",
                  estado: "completada",
                },
                {
                  _id: "h2",
                  titulo: "Inicio de sesión",
                  descripcion: "Como usuario, quiero poder iniciar sesión para acceder a mi cuenta",
                  estado: "en progreso",
                },
              ],
            },
            {
              _id: "e2",
              titulo: "Gestión de proyectos",
              descripcion: "Funcionalidades relacionadas con la gestión de proyectos",
              proyecto: proyectoId,
              prioridad: "media",
              estado: "pendiente",
              fechaInicio: new Date(),
              fechaFin: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
              historias: [],
            },
          ]
          setEpicas(epicasSimuladas)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error general:", err)
        setError("Error al cargar los datos. Por favor, intenta de nuevo más tarde.")
        setLoading(false)
      }
    }

    if (proyectoId) {
      fetchEpicas()
    }
  }, [proyectoId])

  const handleCreateEpica = () => {
    setCurrentEpica(null)
    setShowEpicaForm(true)
  }

  const handleEditEpica = (epica) => {
    setCurrentEpica(epica)
    setShowEpicaForm(true)
  }

  const handleDeleteEpica = async (epicaId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta épica? Esta acción no se puede deshacer.")) {
      try {
        // Si es un ID simulado, simplemente actualizar el estado local
        if (epicaId.startsWith("e")) {
          setEpicas(epicas.filter((e) => e._id !== epicaId))
          return
        }

        await axios.delete(`/api/epicas/${epicaId}`)
        // Actualizar la lista de épicas
        const epicasRes = await axios.get(`/api/epicas/proyecto/${proyectoId}`)
        setEpicas(epicasRes.data.epicas)
      } catch (err) {
        console.error("Error al eliminar la épica:", err)
        setError("Error al eliminar la épica. Por favor, intenta de nuevo más tarde.")
      }
    }
  }

  const handleCreateHistoria = (epicaId) => {
    setCurrentEpicaId(epicaId)
    setShowHistoriaForm(true)
  }

  const handleEpicaSubmit = async (formData) => {
    try {
      if (currentEpica) {
        // Actualizar épica existente
        if (currentEpica._id.startsWith("e")) {
          // Si es un ID simulado, actualizar el estado local
          setEpicas(
            epicas.map((e) =>
              e._id === currentEpica._id
                ? {
                    ...e,
                    ...formData,
                  }
                : e,
            ),
          )
        } else {
          await axios.put(`/api/epicas/${currentEpica._id}`, formData)
          // Actualizar la lista de épicas
          const epicasRes = await axios.get(`/api/epicas/proyecto/${proyectoId}`)
          setEpicas(epicasRes.data.epicas)
        }
      } else {
        // Crear nueva épica
        const response = await axios.post("/api/epicas", formData)
        // Actualizar la lista de épicas
        const epicasRes = await axios.get(`/api/epicas/proyecto/${proyectoId}`)
        setEpicas(epicasRes.data.epicas)
      }

      // Cerrar el formulario
      setShowEpicaForm(false)
    } catch (err) {
      console.error("Error al guardar la épica:", err)
      throw err
    }
  }

  const handleHistoriaSubmit = async (formData) => {
    try {
      // Crear nueva historia
      const response = await axios.post("/api/historias", formData)

      // Actualizar la lista de épicas
      const epicasRes = await axios.get(`/api/epicas/proyecto/${proyectoId}`)
      setEpicas(epicasRes.data.epicas)

      // Cerrar el formulario
      setShowHistoriaForm(false)
    } catch (err) {
      console.error("Error al guardar la historia:", err)
      throw err
    }
  }

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="container mx-auto px-6 py-8">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Épicas</h1>
              {proyecto && (
                <p className="text-secondary-600">
                  Proyecto: <span className="font-medium">{proyecto.nombre}</span>
                </p>
              )}
            </div>
            <button
              onClick={handleCreateEpica}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Épica
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
              <p className="text-secondary-600">Cargando épicas...</p>
            </div>
          ) : (
            <EpicasList
              epicas={epicas}
              onEdit={handleEditEpica}
              onDelete={handleDeleteEpica}
              onCreateHistoria={handleCreateHistoria}
            />
          )}

          {/* Modal para crear/editar épica */}
          {showEpicaForm && (
            <div className="fixed inset-0 bg-secondary-900 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                    {currentEpica ? "Editar Épica" : "Nueva Épica"}
                  </h2>
                  <EpicaForm
                    epica={currentEpica}
                    proyectoId={proyectoId}
                    onSubmit={handleEpicaSubmit}
                    onCancel={() => setShowEpicaForm(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal para crear historia */}
          {showHistoriaForm && (
            <div className="fixed inset-0 bg-secondary-900 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-secondary-900 mb-4">Nueva Historia de Usuario</h2>
                  <HistoriaForm
                    epicaId={currentEpicaId}
                    proyectoId={proyectoId}
                    onSubmit={handleHistoriaSubmit}
                    onCancel={() => setShowHistoriaForm(false)}
                  />
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

export default EpicasPage
