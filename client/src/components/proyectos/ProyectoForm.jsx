"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const ProyectoForm = ({ proyecto, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    clave: "",
    descripcion: "",
    equipo: "",
    estado: "activo",
    prioridad: "media",
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: "",
  })
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  // Cargar datos del proyecto si estamos editando
  useEffect(() => {
    if (proyecto) {
      setFormData({
        nombre: proyecto.nombre || "",
        clave: proyecto.clave || "",
        descripcion: proyecto.descripcion || "",
        equipo: proyecto.equipo?._id || proyecto.equipo || "",
        estado: proyecto.estado || "activo",
        prioridad: proyecto.prioridad || "media",
        fechaInicio: proyecto.fechaInicio
          ? new Date(proyecto.fechaInicio).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        fechaFin: proyecto.fechaFin ? new Date(proyecto.fechaFin).toISOString().split("T")[0] : "",
      })
    }
  }, [proyecto])

  // Cargar equipos
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        // Intentamos obtener equipos reales
        const response = await axios.get("/api/proyectos/equipos/lista")
        if (response.data.success) {
          setEquipos(response.data.equipos)
        } else {
          // Si falla, usamos datos simulados
          setEquipos([
            { _id: "1", nombre: "Equipo de Desarrollo" },
            { _id: "2", nombre: "Equipo de Diseño" },
            { _id: "3", nombre: "Equipo de Marketing" },
          ])
        }
      } catch (err) {
        console.error("Error al cargar equipos:", err)
        // Usar datos simulados como fallback
        setEquipos([
          { _id: "1", nombre: "Equipo de Desarrollo" },
          { _id: "2", nombre: "Equipo de Diseño" },
          { _id: "3", nombre: "Equipo de Marketing" },
        ])
      }
    }

    fetchEquipos()
  }, [])

  const validateForm = () => {
    const errors = {}

    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre del proyecto es obligatorio"
    }

    if (!proyecto && (!formData.clave.trim() || formData.clave.length < 2 || formData.clave.length > 10)) {
      errors.clave = "La clave debe tener entre 2 y 10 caracteres"
    }

    if (!formData.equipo) {
      errors.equipo = "Debes seleccionar un equipo"
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

    // Limpiar error de validación al cambiar el campo
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar formulario
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onSubmit(formData)
    } catch (err) {
      console.error("Error al enviar el formulario:", err)
      setError(
        err.response?.data?.message ||
          "Error al guardar el proyecto. Por favor, verifica los datos e intenta de nuevo.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="proyecto-form">
      {error && <div className="error-message">{error}</div>}

      <div className={`form-group ${validationErrors.nombre ? "has-error" : ""}`}>
        <label htmlFor="nombre">Nombre del Proyecto *</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className={validationErrors.nombre ? "input-error" : ""}
          required
        />
        {validationErrors.nombre && <div className="validation-error">{validationErrors.nombre}</div>}
      </div>

      <div className={`form-group ${validationErrors.clave ? "has-error" : ""}`}>
        <label htmlFor="clave">Clave del Proyecto *</label>
        <input
          type="text"
          id="clave"
          name="clave"
          value={formData.clave}
          onChange={handleChange}
          className={validationErrors.clave ? "input-error" : ""}
          required
          disabled={!!proyecto} // No permitir editar la clave si es edición
        />
        {validationErrors.clave && <div className="validation-error">{validationErrors.clave}</div>}
        {!!proyecto ? (
          <small className="form-help">La clave del proyecto no se puede modificar.</small>
        ) : (
          <small className="form-help">La clave debe tener entre 2 y 10 caracteres (ej. PRO1, DEV, MKT).</small>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" />
      </div>

      <div className={`form-group ${validationErrors.equipo ? "has-error" : ""}`}>
        <label htmlFor="equipo">Equipo *</label>
        <select
          id="equipo"
          name="equipo"
          value={formData.equipo}
          onChange={handleChange}
          className={validationErrors.equipo ? "input-error" : ""}
          required
        >
          <option value="">Selecciona un equipo</option>
          {equipos.map((equipo) => (
            <option key={equipo._id} value={equipo._id}>
              {equipo.nombre}
            </option>
          ))}
        </select>
        {validationErrors.equipo && <div className="validation-error">{validationErrors.equipo}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="estado">Estado</label>
          <select id="estado" name="estado" value={formData.estado} onChange={handleChange}>
            <option value="activo">Activo</option>
            <option value="pausado">Pausado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="prioridad">Prioridad</label>
          <select id="prioridad" name="prioridad" value={formData.prioridad} onChange={handleChange}>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="crítica">Crítica</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fechaInicio">Fecha de Inicio</label>
          <input type="date" id="fechaInicio" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="fechaFin">Fecha de Fin (opcional)</label>
          <input type="date" id="fechaFin" name="fechaFin" value={formData.fechaFin} onChange={handleChange} />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando..." : proyecto ? "Actualizar Proyecto" : "Crear Proyecto"}
        </button>
      </div>
    </form>
  )
}

export default ProyectoForm
