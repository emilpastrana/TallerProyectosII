"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Users, Plus, Eye, UserPlus, Crown, User } from "lucide-react"
import Sidebar from "../components/common/Sidebar"
import Footer from "../components/common/Footer"
import EquipoForm from "../components/equipos/EquipoForm"
import ConfirmDialog from "../components/equipos/ConfirmDialog"

const EquiposPage = () => {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [equipoEditando, setEquipoEditando] = useState(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [equipoAEliminar, setEquipoAEliminar] = useState(null)
  const [loadingDelete, setLoadingDelete] = useState(false)

  useEffect(() => {
    fetchEquipos()
  }, [])

  const fetchEquipos = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const response = await axios.get("/api/equipos", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        setEquipos(response.data.equipos || [])
      }
    } catch (err) {
      console.error("Error al cargar equipos:", err)
      setError("Error al cargar los equipos. Por favor, intenta de nuevo más tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleCrearEquipo = () => {
    setEquipoEditando(null)
    setShowForm(true)
  }

  const handleEditarEquipo = (equipo) => {
    setEquipoEditando(equipo)
    setShowForm(true)
  }

  const handleEliminarEquipo = (equipo) => {
    setEquipoAEliminar(equipo)
    setShowConfirmDelete(true)
  }

  const confirmarEliminar = async () => {
    if (!equipoAEliminar) return

    try {
      setLoadingDelete(true)
      const token = localStorage.getItem("token")
      console.debug("[DEBUG] Intentando eliminar equipo", {
        equipoAEliminar,
        token,
        endpoint: `/api/equipos/${equipoAEliminar._id}`,
      })

      const response = await axios.delete(`/api/equipos/${equipoAEliminar._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.debug("[DEBUG] Respuesta eliminación:", response)

      setEquipos(equipos.filter((e) => e._id !== equipoAEliminar._id))
      setShowConfirmDelete(false)
      setEquipoAEliminar(null)
    } catch (err) {
      console.error("Error al eliminar equipo:", err)
      if (err.response) {
        console.error("[DEBUG] Error response:", err.response)
        if (err.response.status === 404) {
          setError("El equipo no existe o ya fue eliminado (404)")
        } else if (err.response.status === 403) {
          setError("No tienes permisos para eliminar este equipo (403)")
        } else {
          setError(err.response?.data?.message || "Error al eliminar el equipo")
        }
      } else {
        setError("Error de red o servidor no disponible")
      }
    } finally {
      setLoadingDelete(false)
    }
  }

  const handleSubmitForm = async (formData) => {
    try {
      const token = localStorage.getItem("token")
      console.debug("[DEBUG] handleSubmitForm", { formData, equipoEditando, token })

      if (equipoEditando) {
        // Actualizar equipo existente
        const response = await axios.put(`/api/equipos/${equipoEditando._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.debug("[DEBUG] Respuesta actualización:", response)

        if (response.data.success) {
          await fetchEquipos() // Recargar la lista
          setShowForm(false)
          setEquipoEditando(null)
        }
      } else {
        // Crear nuevo equipo
        const response = await axios.post("/api/equipos", formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.debug("[DEBUG] Respuesta creación:", response)

        if (response.data.success) {
          await fetchEquipos() // Recargar la lista
          setShowForm(false)
        }
      }
    } catch (err) {
      console.error("[DEBUG] Error en handleSubmitForm:", err)
      throw err // Re-lanzar el error para que lo maneje el formulario
    }
  }

  const getRolIcon = (rol) => {
    return rol === "admin" ? (
      <Crown size={16} className="text-yellow-500" />
    ) : (
      <User size={16} className="text-gray-500" />
    )
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <div>
            <h1>
              <Users size={28} style={{ display: "inline", marginRight: "0.5rem", color: "var(--primary-color)" }} />
              Equipos
            </h1>
            <p style={{ color: "var(--text-light)", fontSize: "0.875rem", margin: "0.5rem 0 0 0" }}>
              Gestiona los equipos de trabajo de tu organización
            </p>
          </div>
          <button className="btn-primary" onClick={handleCrearEquipo}>
            <Plus size={20} style={{ marginRight: "0.5rem" }} />
            Nuevo Equipo
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando equipos...</p>
          </div>
        ) : equipos.length === 0 ? (
          <div className="no-data">
            <Users size={64} style={{ color: "var(--text-light)", marginBottom: "1rem" }} />
            <h3>No hay equipos creados</h3>
            <p>Crea tu primer equipo para comenzar a colaborar</p>
            <button className="btn-primary" onClick={handleCrearEquipo}>
              <Plus size={20} style={{ marginRight: "0.5rem" }} />
              Crear Primer Equipo
            </button>
          </div>
        ) : (
          <div className="equipos-grid">
            {equipos.map((equipo) => (
              <div key={equipo._id} className="equipo-card">
                <div className="equipo-header">
                  <div className="equipo-logo">
                    <img
                      src={
                        equipo.logo ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(equipo.nombre) || "/placeholder.svg"}&background=random`
                      }
                      alt={equipo.nombre}
                    />
                  </div>
                  <div className="equipo-info">
                    <h3 className="equipo-nombre">{equipo.nombre}</h3>
                    <p className="equipo-fecha">Creado el {formatDate(equipo.createdAt)}</p>
                  </div>
                </div>

                {equipo.descripcion && <p className="equipo-descripcion">{equipo.descripcion}</p>}

                <div className="equipo-stats">
                  <div className="stat-item">
                    <UserPlus size={16} />
                    <span>{equipo.miembros?.length || 0} miembros</span>
                  </div>
                </div>

                <div className="equipo-miembros">
                  <h4>Miembros</h4>
                  <div className="miembros-list">
                    {equipo.miembros?.slice(0, 4).map((miembro, index) => (
                      <div key={index} className="miembro-item">
                        <div className="miembro-avatar">
                          <img
                            src={
                              miembro.usuario?.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(miembro.usuario?.nombre || "Usuario")}&background=random`
                            }
                            alt={miembro.usuario?.nombre || "Usuario"}
                          />
                        </div>
                        <div className="miembro-info">
                          <span className="miembro-nombre">{miembro.usuario?.nombre || "Usuario"}</span>
                          <div className="miembro-rol">
                            {getRolIcon(miembro.rol)}
                            <span>{miembro.rol}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {equipo.miembros?.length > 4 && (
                      <div className="miembros-mas">+{equipo.miembros.length - 4} más</div>
                    )}
                  </div>
                </div>

                <div className="equipo-actions">
                  <button className="btn-icon" title="Ver detalles">
                    <Eye size={16} />
                  </button>
                  <button className="btn-edit" onClick={() => handleEditarEquipo(equipo)} title="Editar equipo">
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => handleEliminarEquipo(equipo)} title="Eliminar equipo">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Solo renderizar el formulario si showForm es true */}
        {showForm && (
          <EquipoForm
            equipo={equipoEditando}
            onSubmit={handleSubmitForm}
            onCancel={() => {
              setShowForm(false)
              setEquipoEditando(null)
            }}
            isOpen={showForm}
          />
        )}

        {/* Solo renderizar el diálogo de confirmación si showConfirmDelete es true */}
        {showConfirmDelete && (
          <ConfirmDialog
            isOpen={showConfirmDelete}
            title="Eliminar Equipo"
            message={`¿Estás seguro de que deseas eliminar el equipo "${equipoAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
            onConfirm={confirmarEliminar}
            onCancel={() => {
              setShowConfirmDelete(false)
              setEquipoAEliminar(null)
            }}
            loading={loadingDelete}
          />
        )}


      </div>
    </div>
  )
}

export default EquiposPage
