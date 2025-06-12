"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { X, Users, User, Check } from "lucide-react"

const EquipoForm = ({ equipo, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    miembros: [],
  })
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  // Cargar datos del equipo si estamos editando
  useEffect(() => {
    if (equipo) {
      console.log("Equipo a editar:", equipo)

      // Extraer IDs de miembros existentes
      const miembrosIds =
        equipo.miembros
          ?.map((miembro) => {
            // Manejar tanto objetos con usuario._id como strings directos
            if (typeof miembro.usuario === "object" && miembro.usuario._id) {
              return miembro.usuario._id
            } else if (typeof miembro.usuario === "string") {
              return miembro.usuario
            } else if (typeof miembro === "string") {
              return miembro
            }
            return null
          })
          .filter(Boolean) || []

      console.log("Miembros IDs extraídos:", miembrosIds)

      setFormData({
        nombre: equipo.nombre || "",
        descripcion: equipo.descripcion || "",
        miembros: miembrosIds,
      })
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        miembros: [],
      })
    }
  }, [equipo])

  // Cargar usuarios disponibles
  useEffect(() => {
    const fetchUsuarios = async () => {
      if (!isOpen) return

      try {
        console.log("=== CARGANDO USUARIOS ===")
        setLoadingUsuarios(true)
        setError(null)

        const token = localStorage.getItem("token")
        console.log("Token encontrado:", token ? "✅ Sí" : "❌ No")

        if (!token) {
          throw new Error("No se encontró token de autenticación")
        }

        const response = await axios.get("/api/usuarios", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Respuesta del servidor:", response.data)

        if (response.data && response.data.success && response.data.usuarios) {
          console.log("✅ Usuarios cargados:", response.data.usuarios.length)
          setUsuarios(response.data.usuarios)
        } else {
          throw new Error("Estructura de respuesta no válida")
        }
      } catch (err) {
        console.error("❌ Error al cargar usuarios:", err)

        if (err.response?.status === 401) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        } else if (err.response?.status === 403) {
          setError("No tienes permisos para acceder a los usuarios.")
        } else {
          setError("Error al cargar usuarios. Verifica tu conexión.")
        }

        setUsuarios([])
      } finally {
        setLoadingUsuarios(false)
      }
    }

    fetchUsuarios()
  }, [isOpen])

  const validateForm = () => {
    const errors = {}

    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre del equipo es obligatorio"
    }

    if (formData.miembros.length < 2) {
      errors.miembros = "Debe seleccionar al menos 2 miembros para el equipo"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpiar error de validación
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      })
    }
  }

  const handleMiembroToggle = (usuarioId) => {
    console.log("Toggle usuario:", usuarioId)
    console.log("Miembros actuales:", formData.miembros)

    const newMiembros = formData.miembros.includes(usuarioId)
      ? formData.miembros.filter((id) => id !== usuarioId)
      : [...formData.miembros, usuarioId]

    console.log("Nuevos miembros:", newMiembros)

    setFormData({
      ...formData,
      miembros: newMiembros,
    })

    // Limpiar error de validación
    if (validationErrors.miembros && newMiembros.length >= 2) {
      setValidationErrors({
        ...validationErrors,
        miembros: null,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Enviando datos:", formData)
      await onSubmit(formData)
    } catch (err) {
      console.error("Error al enviar el formulario:", err)
      setError(err.response?.data?.message || "Error al guardar el equipo. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            <Users size={24} style={{ display: "inline", marginRight: "0.5rem", color: "var(--primary-color)" }} />
            {equipo ? "Editar Equipo" : "Crear Nuevo Equipo"}
          </h2>
          <button onClick={onCancel} className="close-button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className={`form-group ${validationErrors.nombre ? "has-error" : ""}`}>
            <label htmlFor="nombre">Nombre del Equipo *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={validationErrors.nombre ? "input-error" : ""}
              placeholder="Ej. Equipo de Desarrollo Frontend"
              required
            />
            {validationErrors.nombre && <div className="validation-error">{validationErrors.nombre}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              placeholder="Describe el propósito y objetivos del equipo..."
            />
          </div>

          <div className={`form-group ${validationErrors.miembros ? "has-error" : ""}`}>
            <label>Miembros del Equipo *</label>
            <p className="form-help">Selecciona al menos 2 miembros para el equipo</p>

            {loadingUsuarios ? (
              <div className="loading-usuarios">
                <div className="loading-spinner-small"></div>
                <span>Cargando usuarios...</span>
              </div>
            ) : error ? (
              <div className="error-usuarios">
                <p>❌ {error}</p>
                <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
                  Recargar Página
                </button>
              </div>
            ) : usuarios && usuarios.length > 0 ? (
              <div className="usuarios-grid">
                {usuarios.map((usuario) => {
                  const isSelected = formData.miembros.includes(usuario._id)

                  return (
                    <div
                      key={usuario._id}
                      className={`usuario-card ${isSelected ? "selected" : ""}`}
                      onClick={() => handleMiembroToggle(usuario._id)}
                    >
                      <div className="usuario-checkbox">{isSelected && <Check size={16} />}</div>
                      <div className="usuario-avatar">
                        <User size={20} />
                      </div>
                      <div className="usuario-info">
                        <h4>{usuario.nombre}</h4>
                        <p>{usuario.correo}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="no-usuarios">
                <p>⚠️ No se encontraron usuarios en la base de datos</p>
              </div>
            )}

            {validationErrors.miembros && <div className="validation-error">{validationErrors.miembros}</div>}

            <div className="miembros-count">Miembros seleccionados: {formData.miembros.length}</div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading || usuarios.length === 0}>
              {loading ? "Guardando..." : equipo ? "Actualizar Equipo" : "Crear Equipo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EquipoForm
