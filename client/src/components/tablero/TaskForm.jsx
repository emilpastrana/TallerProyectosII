"use client"

import { useState, useEffect, useRef } from "react"
import { AlertCircle, Upload, X, FileText, ImageIcon, File } from "lucide-react"
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

        // Obtener todos los usuarios como fallback
        const usuariosRes = await axios.get("/api/usuarios")

        if (usuariosRes.data.success && usuariosRes.data.usuarios) {
          setUsuarios(usuariosRes.data.usuarios)
        } else {
          throw new Error("No se pudieron cargar los usuarios")
        }

        // Si tenemos un proyectoId, intentar filtrar por equipo
        if (proyectoId) {
          try {
            // Obtener el proyecto para conseguir el equipo
            const proyectoRes = await axios.get(`/api/proyectos/${proyectoId}`)

            if (proyectoRes.data.success && proyectoRes.data.proyecto && proyectoRes.data.proyecto.equipo) {
              const equipoId = proyectoRes.data.proyecto.equipo._id

              // Obtener usuarios del equipo
              const equipoRes = await axios.get(`/api/equipos/${equipoId}`)

              if (equipoRes.data.success && equipoRes.data.equipo && equipoRes.data.equipo.miembros) {
                // Extraer usuarios del equipo
                const usuariosEquipo = equipoRes.data.equipo.miembros.map((miembro) => ({
                  _id: miembro.usuario._id,
                  nombre: miembro.usuario.nombre,
                  avatar: miembro.usuario.avatar,
                }))

                if (usuariosEquipo.length > 0) {
                  setUsuarios(usuariosEquipo)
                }
              }
            }
          } catch (equipoErr) {
            console.warn("No se pudo filtrar usuarios por equipo:", equipoErr)
            // Mantenemos los usuarios ya cargados como fallback
          }
        }

        setLoadingUsuarios(false)
      } catch (err) {
        console.error("Error al cargar usuarios:", err)
        setError("Error al cargar los usuarios. Se usarán datos predeterminados.")
        setLoadingUsuarios(false)

        // Datos simulados como último recurso
        const usuariosSimulados = [
          { _id: "1", nombre: "Ana Martínez" },
          { _id: "2", nombre: "Carlos Gómez" },
          { _id: "3", nombre: "Juan Pérez" },
          { _id: "4", nombre: "María López" },
          { _id: "5", nombre: "Admin Usuario" },
        ]
        setUsuarios(usuariosSimulados)
      }
    }

    fetchUsuarios()
  }, [proyectoId])

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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
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

    // Validar formulario
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Crear un FormData para enviar archivos
      const formDataWithFiles = new FormData()

      // Añadir los datos del formulario
      Object.keys(formData).forEach((key) => {
        formDataWithFiles.append(key, formData[key])
      })

      // Añadir los archivos
      archivos.forEach((file) => {
        formDataWithFiles.append("archivos", file)
      })

      // Añadir los IDs de archivos previos que se mantienen
      archivosPrevios.forEach((archivo) => {
        formDataWithFiles.append("archivosPrevios", archivo._id)
      })

      await onSubmit(formDataWithFiles)
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
        ) : (
          <select
            id="asignado"
            name="asignado"
            value={formData.asignado}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Sin asignar</option>
            {usuarios.map((usuario) => (
              <option key={usuario._id} value={usuario._id}>
                {usuario.nombre}
              </option>
            ))}
          </select>
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

      {/* Sección de archivos */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">Archivos adjuntos</label>

        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-secondary-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-secondary-400" />
            <div className="flex text-sm text-secondary-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
              >
                <span>Subir archivos</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
              <p className="pl-1">o arrastra y suelta</p>
            </div>
            <p className="text-xs text-secondary-500">PNG, JPG, PDF, DOC hasta 10MB</p>
          </div>
        </div>

        {/* Lista de archivos seleccionados */}
        {archivos.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-secondary-700 mb-2">Archivos nuevos:</h4>
            <ul className="divide-y divide-secondary-200 border border-secondary-200 rounded-md overflow-hidden">
              {archivos.map((file, index) => (
                <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {getFileIcon(file.type)}
                    <span className="ml-2 truncate">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-4 flex-shrink-0 text-secondary-400 hover:text-secondary-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lista de archivos previos */}
        {archivosPrevios.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-secondary-700 mb-2">Archivos existentes:</h4>
            <ul className="divide-y divide-secondary-200 border border-secondary-200 rounded-md overflow-hidden">
              {archivosPrevios.map((archivo) => (
                <li key={archivo._id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {getFileIcon(archivo.tipo)}
                    <span className="ml-2 truncate">{archivo.nombre}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePreviousFile(archivo._id)}
                    className="ml-4 flex-shrink-0 text-secondary-400 hover:text-secondary-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
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
