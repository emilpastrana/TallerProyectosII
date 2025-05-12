"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"

const HistoriaForm = ({ historia, epicaId, proyectoId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    epicaId: epicaId || "",
    proyecto: proyectoId || "",
    prioridad: "media",
    estado: "pendiente",
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  // Cargar datos de la historia si estamos editando
  useEffect(() => {
    if (historia) {
      setFormData({
        titulo: historia.titulo || "",
        descripcion: historia.descripcion || "",
        epicaId: historia.epicaId || epicaId || "",
        proyecto: historia.proyecto || proyectoId || "",
        prioridad: historia.prioridad || "media",
        estado: historia.estado || "pendiente",
        fechaInicio: historia.fechaInicio
          ? new Date(historia.fechaInicio).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        fechaFin: historia.fechaFin ? new Date(historia.fechaFin).toISOString().split("T")[0] : "",
      })
    }
  }, [historia, epicaId, proyectoId])

  const validateForm = () => {
    const errors = {}

    if (!formData.titulo.trim()) {
      errors.titulo = "El título de la historia es obligatorio"
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
        err.response?.data?.message ||
          "Error al guardar la historia. Por favor, verifica los datos e intenta de nuevo.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className={validationErrors.titulo ? "has-error" : ""}>
        <label htmlFor="titulo" className="block text-sm font-medium text-secondary-700 mb-1">
          Título de la Historia *
        </label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          className={`form-input ${validationErrors.titulo ? "border-red-300" : ""}`}
          required
        />
        {validationErrors.titulo && <div className="text-red-500 text-sm mt-1">{validationErrors.titulo}</div>}
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-secondary-700 mb-1">
          Descripción (Como usuario, quiero... para...)
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows="3"
          className="form-textarea"
          placeholder="Como [tipo de usuario], quiero [objetivo] para [beneficio]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="prioridad" className="block text-sm font-medium text-secondary-700 mb-1">
            Prioridad
          </label>
          <select
            id="prioridad"
            name="prioridad"
            value={formData.prioridad}
            onChange={handleChange}
            className="form-select"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="crítica">Crítica</option>
          </select>
        </div>

        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-secondary-700 mb-1">
            Estado
          </label>
          <select id="estado" name="estado" value={formData.estado} onChange={handleChange} className="form-select">
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En Progreso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fechaInicio" className="block text-sm font-medium text-secondary-700 mb-1">
            Fecha de Inicio
          </label>
          <input
            type="date"
            id="fechaInicio"
            name="fechaInicio"
            value={formData.fechaInicio}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="fechaFin" className="block text-sm font-medium text-secondary-700 mb-1">
            Fecha de Fin (opcional)
          </label>
          <input
            type="date"
            id="fechaFin"
            name="fechaFin"
            value={formData.fechaFin}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-secondary-200 text-secondary-800 rounded-md hover:bg-secondary-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Guardando..." : historia ? "Actualizar Historia" : "Crear Historia"}
        </button>
      </div>
    </form>
  )
}

export default HistoriaForm
