"use client"

import { useState, useEffect } from "react"

const TaskForm = ({ tarea, columnaId, proyectoId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    proyecto: proyectoId,
    asignado: "",
    prioridad: "media",
    tipo: "funcionalidad",
    fechaLimite: "",
    tiempoEstimado: "",
    columna: columnaId,
  })
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  // Cargar datos de la tarea si estamos editando
  useEffect(() => {
    if (tarea) {
      setFormData({
        titulo: tarea.titulo || "",
        descripcion: tarea.descripcion || "",
        proyecto: tarea.proyecto || proyectoId,
        asignado: tarea.asignado?._id || tarea.asignado || "",
        prioridad: tarea.prioridad || "media",
        tipo: tarea.tipo || "funcionalidad",
        fechaLimite: tarea.fechaLimite ? new Date(tarea.fechaLimite).toISOString().split("T")[0] : "",
        tiempoEstimado: tarea.tiempoEstimado || "",
        columna: tarea.columna || columnaId,
      })
    }
  }, [tarea, columnaId, proyectoId])

  // Cargar usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        // Datos simulados para usuarios
        const usuariosSimulados = [
          { _id: "1", nombre: "Ana Martínez" },
          { _id: "2", nombre: "Carlos Gómez" },
          { _id: "3", nombre: "Juan Pérez" },
          { _id: "4", nombre: "María López" },
          { _id: "5", nombre: "Admin Usuario" },
        ]

        setUsuarios(usuariosSimulados)
      } catch (err) {
        console.error("Error al cargar usuarios:", err)
        setError("Error al cargar los usuarios. Por favor, intenta de nuevo más tarde.")
      }
    }

    fetchUsuarios()
  }, [])

  const validateForm = () => {
    const errors = {}

    if (!formData.titulo.trim()) {
      errors.titulo = "El título de la tarea es obligatorio"
    }

    if (!formData.proyecto) {
      errors.proyecto = "El proyecto es obligatorio"
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
        err.response?.data?.message || "Error al guardar la tarea. Por favor, verifica los datos e intenta de nuevo.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">
      {error && <div className="error-message">{error}</div>}

      <div className={`form-group ${validationErrors.titulo ? "has-error" : ""}`}>
        <label htmlFor="titulo">Título *</label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          className={validationErrors.titulo ? "input-error" : ""}
          required
        />
        {validationErrors.titulo && <div className="validation-error">{validationErrors.titulo}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción</label>
        <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" />
      </div>

      <div className="form-group">
        <label htmlFor="asignado">Asignado a</label>
        <select id="asignado" name="asignado" value={formData.asignado} onChange={handleChange}>
          <option value="">Sin asignar</option>
          {usuarios.map((usuario) => (
            <option key={usuario._id} value={usuario._id}>
              {usuario.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="prioridad">Prioridad</label>
          <select id="prioridad" name="prioridad" value={formData.prioridad} onChange={handleChange}>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="crítica">Crítica</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo</label>
          <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange}>
            <option value="funcionalidad">Funcionalidad</option>
            <option value="bug">Bug</option>
            <option value="mejora">Mejora</option>
            <option value="documentación">Documentación</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fechaLimite">Fecha Límite</label>
          <input type="date" id="fechaLimite" name="fechaLimite" value={formData.fechaLimite} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="tiempoEstimado">Tiempo Estimado (horas)</label>
          <input
            type="number"
            id="tiempoEstimado"
            name="tiempoEstimado"
            value={formData.tiempoEstimado}
            onChange={handleChange}
            min="0"
            step="0.5"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Guardando..." : tarea ? "Actualizar Tarea" : "Crear Tarea"}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
