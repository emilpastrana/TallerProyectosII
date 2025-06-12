"use client"

import { useState, useEffect, useRef } from "react"
import { AlertCircle, FileText, ImageIcon, File } from "lucide-react"
import axios from "axios"

const TaskForm = ({ tarea, columnaId, proyectoId, historiaId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    proyecto: proyectoId,
    historiaId: historiaId || "",
    asignado: "",
    prioridad: "media",
    tipo: "funcionalidad",
    fechaLimite: "",
    tiempoEstimado: "",
    columna: columnaId,
  })
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [error, setError] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [archivos, setArchivos] = useState([])
  const [archivosPrevios, setArchivosPrevios] = useState([])
  const fileInputRef = useRef(null)

  // Cargar datos de la tarea si estamos editando
  useEffect(() => {
    if (tarea) {
      console.log("🎯 Datos completos de la tarea:", tarea)
      console.log("👤 Usuario asignado:", tarea.asignado)

      setFormData({
        titulo: tarea.titulo || "",
        descripcion: tarea.descripcion || "",
        proyecto: tarea.proyecto || proyectoId,
        historiaId: tarea.historiaId || historiaId || "",
        asignado: tarea.asignado?._id || tarea.asignado || "",
        prioridad: tarea.prioridad || "media",
        tipo: tarea.tipo || "funcionalidad",
        fechaLimite: tarea.fechaLimite ? new Date(tarea.fechaLimite).toISOString().split("T")[0] : "",
        tiempoEstimado: tarea.tiempoEstimado || "",
        columna: tarea.columna || columnaId,
      })

      // Si la tarea tiene archivos, cargarlos
      if (tarea.archivos && tarea.archivos.length > 0) {
        setArchivosPrevios(tarea.archivos)
      }
    }
  }, [tarea, columnaId, proyectoId, historiaId])

  // Cargar usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoadingUsuarios(true)
        let usuariosFinales = []

        // Si tenemos un proyectoId, intentar obtener usuarios del equipo
        if (proyectoId) {
          try {
            console.log("🔍 Obteniendo proyecto:", proyectoId)
            // Obtener el proyecto para conseguir el equipo
            const proyectoRes = await axios.get(`/api/proyectos/${proyectoId}`)
            console.log("📊 Datos del proyecto:", proyectoRes.data)

            if (proyectoRes.data.success && proyectoRes.data.proyecto?.equipo) {
              const equipoId = proyectoRes.data.proyecto.equipo._id || proyectoRes.data.proyecto.equipo
              console.log("👥 ID del equipo:", equipoId)

              // Obtener usuarios del equipo
              const equipoRes = await axios.get(`/api/equipos/${equipoId}`)
              console.log("👥 Datos del equipo:", equipoRes.data)

              if (equipoRes.data.success && equipoRes.data.equipo?.miembros) {
                // Extraer usuarios del equipo y asegurarnos de que incluyan toda la información necesaria
                usuariosFinales = equipoRes.data.equipo.miembros
                  .filter((miembro) => miembro.usuario) // Asegurarnos de que el usuario existe
                  .map((miembro) => {
                    console.log("👤 Procesando miembro:", miembro)
                    return {
                      _id: miembro.usuario._id,
                      nombre: miembro.usuario.nombre,
                      avatar: miembro.usuario.avatar,
                    }
                  })
                console.log("👥 Lista final de usuarios:", usuariosFinales)

                // Si hay una tarea con usuario asignado, verificar que esté en la lista
                if (tarea?.asignado) {
                  const asignadoId = tarea.asignado._id || tarea.asignado
                  const usuarioAsignadoExiste = usuariosFinales.some((u) => u._id === asignadoId)
                  if (!usuarioAsignadoExiste) {
                    // El usuario asignado no está en el equipo, intentar obtener sus datos
                    try {
                      const userRes = await axios.get(`/api/usuarios/${asignadoId}`)
                      if (userRes.data.success && userRes.data.usuario) {
                        usuariosFinales.push({
                          _id: userRes.data.usuario._id,
                          nombre: userRes.data.usuario.nombre || 'Usuario asignado',
                          avatar: userRes.data.usuario.avatar,
                        })
                      } else {
                        // Si no se pudo obtener el usuario, al menos agrega el id para que el select no quede vacío
                        usuariosFinales.push({
                          _id: asignadoId,
                          nombre: 'Usuario asignado',
                          avatar: '',
                        })
                      }
                    } catch (err) {
                      // Si hay error, igual agrega el id para que el select no quede vacío
                      usuariosFinales.push({
                        _id: asignadoId,
                        nombre: 'Usuario asignado',
                        avatar: '',
                      })
                      console.warn("⚠️ No se pudo obtener información del usuario asignado:", err)
                    }
                  }
                }
              } else {
                console.warn("⚠️ No se encontraron miembros en el equipo")
              }
            } else {
              console.warn("⚠️ El proyecto no tiene equipo asignado")
            }
          } catch (equipoErr) {
            console.error("❌ Error al obtener usuarios del equipo:", equipoErr)
          }
        } else {
          console.warn("⚠️ No se proporcionó ID de proyecto")
        }

        setUsuarios(usuariosFinales)
        setLoadingUsuarios(false)

        // Debug del estado final
        console.log("🔄 Estado final:", {
          usuariosDisponibles: usuariosFinales,
          asignadoActual: formData.asignado,
          tareaAsignado: tarea?.asignado,
        })
      } catch (err) {
        console.error("❌ Error al cargar usuarios:", err)
        setError("Error al cargar los usuarios del equipo.")
        setLoadingUsuarios(false)
      }
    }

    fetchUsuarios()
  }, [proyectoId, tarea])

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
    console.log(`Campo ${name} cambiado a: ${value}`)

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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    console.log(
      "📁 Archivos seleccionados:",
      selectedFiles.map((f) => f.name),
    )
    setArchivos([...archivos, ...selectedFiles])
  }

  const removeFile = (index) => {
    const newFiles = [...archivos]
    newFiles.splice(index, 1)
    setArchivos(newFiles)
  }

  const removePreviousFile = (id) => {
    setArchivosPrevios(archivosPrevios.filter((archivo) => archivo._id !== id))
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    } else if (fileType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />
    } else {
      return <File className="h-5 w-5 text-secondary-500" />
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("🚀 Enviando formulario")
    console.log("📝 Datos a enviar:", formData)

    // Validar formulario
    if (!validateForm()) {
      console.warn("❌ Formulario inválido")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Crear objeto con los datos a enviar
      const dataToSend = { ...formData }

      // Eliminar campos vacíos
      Object.keys(dataToSend).forEach((key) => {
        if (dataToSend[key] === "" || dataToSend[key] === null || dataToSend[key] === undefined) {
          delete dataToSend[key]
        }
      })

      console.log("📤 Datos finales a enviar:", dataToSend)

      // Enviar datos
      await onSubmit(dataToSend)
      console.log("✅ Formulario enviado con éxito")
    } catch (err) {
      console.error("❌ Error al enviar el formulario:", err)
      setError(
        err.response?.data?.message || "Error al guardar la tarea. Por favor, verifica los datos e intenta de nuevo.",
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
          Título *
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
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          rows="3"
          className="form-textarea"
        />
      </div>

      {historiaId && (
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-700">Esta tarea está asociada a una historia de usuario.</p>
        </div>
      )}

      <div>
        <label htmlFor="asignado" className="block text-sm font-medium text-secondary-700 mb-1">
          Asignado a
        </label>
        {loadingUsuarios ? (
          <div className="flex items-center space-x-2 text-sm text-secondary-500">
            <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-primary-600 rounded-full"></div>
            <span>Cargando usuarios...</span>
          </div>
        ) : usuarios.length > 0 ? (
          <select
            id="asignado"
            name="asignado"
            value={formData.asignado ? String(formData.asignado) : ""}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Sin asignar</option>
            {usuarios.map((usuario) => (
              <option key={String(usuario._id)} value={String(usuario._id)}>
                {usuario.nombre}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-amber-600 text-sm">
            No hay usuarios disponibles para este proyecto. Asigna un equipo al proyecto primero.
          </div>
        )}
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
          <label htmlFor="tipo" className="block text-sm font-medium text-secondary-700 mb-1">
            Tipo
          </label>
          <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} className="form-select">
            <option value="funcionalidad">Funcionalidad</option>
            <option value="bug">Bug</option>
            <option value="mejora">Mejora</option>
            <option value="documentación">Documentación</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fechaLimite" className="block text-sm font-medium text-secondary-700 mb-1">
            Fecha Límite
          </label>
          <input
            type="date"
            id="fechaLimite"
            name="fechaLimite"
            value={formData.fechaLimite}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="tiempoEstimado" className="block text-sm font-medium text-secondary-700 mb-1">
            Tiempo Estimado (horas)
          </label>
          <input
            type="number"
            id="tiempoEstimado"
            name="tiempoEstimado"
            value={formData.tiempoEstimado}
            onChange={handleChange}
            min="0"
            step="0.5"
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
          {loading ? "Guardando..." : tarea ? "Actualizar Tarea" : "Crear Tarea"}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
