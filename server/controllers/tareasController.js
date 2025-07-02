import Tarea from "../models/Tarea.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// @desc    Obtener todas las tareas de un proyecto
// @route   GET /api/tareas/proyecto/:proyectoId
// @access  Private
export const getTareasByProyecto = async (req, res) => {
  try {
    console.log("🔍 Obteniendo tareas del proyecto:", req.params.proyectoId)

    const tareas = await Tarea.find({ proyecto: req.params.proyectoId })
      .populate("asignado", "nombre avatar")
      .populate("creador", "nombre avatar")
      .populate("columna", "nombre")
      .sort({ fechaCreacion: -1 })

    console.log("✅ Tareas encontradas:", tareas.length)

    res.status(200).json({
      success: true,
      count: tareas.length,
      tareas,
    })
  } catch (error) {
    console.error("❌ Error al obtener tareas:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener tareas",
      error: error.message,
    })
  }
}

// @desc    Obtener una tarea por ID
// @route   GET /api/tareas/:id
// @access  Private
export const getTareaById = async (req, res) => {
  try {
    const tarea = await Tarea.findById(req.params.id)
      .populate("asignado", "nombre avatar")
      .populate("creador", "nombre avatar")
      .populate("columna", "nombre")
      .populate("proyecto", "nombre clave")

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      tarea,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al obtener la tarea",
      error: error.message,
    })
  }
}

// @desc    Crear una nueva tarea
// @route   POST /api/tareas
// @access  Private
export const crearTarea = async (req, res) => {
  try {
    console.log("🆕 Creando nueva tarea")
    console.log("📤 Datos recibidos:", req.body)
    console.log("📤 Usuario actual:", req.usuario)

    const {
      titulo,
      descripcion,
      proyecto,
      asignado,
      prioridad,
      tipo,
      fechaLimite,
      tiempoEstimado,
      columna,
      historiaId,
    } = req.body

    // Validaciones básicas
    if (!titulo || !proyecto) {
      console.log("❌ Faltan campos requeridos:", { titulo, proyecto })
      return res.status(400).json({
        success: false,
        message: "El título y el proyecto son requeridos",
      })
    }

    console.log("✅ Campos validados correctamente")
    console.log("👤 Asignado a:", asignado || "Sin asignar")

    const nuevaTarea = new Tarea({
      titulo,
      descripcion,
      proyecto,
      creador: req.usuario?.id,
      asignado: asignado || null,
      estado: "pendiente",
      prioridad: prioridad || "media",
      tipo: tipo || "funcionalidad",
      fechaCreacion: new Date(),
      fechaLimite: fechaLimite || null,
      tiempoEstimado: tiempoEstimado || null,
      columna,
      historiaId: historiaId || null,
    })

    // Procesar archivos si existen
    if (req.files && req.files.length > 0) {
      console.log("📁 Archivos recibidos:", req.files.length)
      nuevaTarea.archivos = req.files.map((file) => ({
        nombre: file.originalname,
        ruta: file.path,
        tipo: file.mimetype,
        tamaño: file.size,
      }))
    }

    await nuevaTarea.save()
    console.log("✅ Tarea guardada en la base de datos:", nuevaTarea._id)

    // Poblar los campos para la respuesta
    const tareaCreada = await Tarea.findById(nuevaTarea._id)
      .populate("asignado", "nombre avatar")
      .populate("creador", "nombre avatar")
      .populate("columna", "nombre")

    console.log("✅ Tarea creada exitosamente:", tareaCreada._id)

    res.status(201).json({
      success: true,
      tarea: tareaCreada,
    })
  } catch (error) {
    console.error("❌ Error al crear la tarea:", error)
    res.status(500).json({
      success: false,
      message: "Error al crear la tarea",
      error: error.message,
    })
  }
}

// @desc    Actualizar una tarea
// @route   PUT /api/tareas/:id
// @access  Private
export const actualizarTarea = async (req, res) => {
  try {
    console.log("✏️ Actualizando tarea:", req.params.id)
    console.log("📤 Datos recibidos:", req.body)

    const { titulo, descripcion, asignado, estado, prioridad, tipo, fechaLimite, tiempoEstimado, tiempoReal, columna } =
      req.body

    // Buscar la tarea existente
    const tareaExistente = await Tarea.findById(req.params.id)

    if (!tareaExistente) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      })
    }

    // Actualizar campos básicos
    tareaExistente.titulo = titulo || tareaExistente.titulo
    tareaExistente.descripcion = descripcion || tareaExistente.descripcion
    tareaExistente.asignado = asignado || tareaExistente.asignado
    tareaExistente.estado = estado || tareaExistente.estado
    tareaExistente.prioridad = prioridad || tareaExistente.prioridad
    tareaExistente.tipo = tipo || tareaExistente.tipo
    tareaExistente.fechaLimite = fechaLimite || tareaExistente.fechaLimite
    tareaExistente.tiempoEstimado = tiempoEstimado || tareaExistente.tiempoEstimado
    tareaExistente.tiempoReal = tiempoReal || tareaExistente.tiempoReal
    tareaExistente.columna = columna || tareaExistente.columna

    // Procesar archivos nuevos si existen
    if (req.files && req.files.length > 0) {
      const nuevosArchivos = req.files.map((file) => ({
        nombre: file.originalname,
        ruta: file.path,
        tipo: file.mimetype,
        tamaño: file.size,
      }))

      // Si ya tiene archivos, añadir los nuevos
      if (tareaExistente.archivos && tareaExistente.archivos.length > 0) {
        tareaExistente.archivos = [...tareaExistente.archivos, ...nuevosArchivos]
      } else {
        tareaExistente.archivos = nuevosArchivos
      }
    }

    // Procesar archivos a eliminar
    if (req.body.archivosPrevios) {
      const archivosPreviosIds = Array.isArray(req.body.archivosPrevios)
        ? req.body.archivosPrevios
        : [req.body.archivosPrevios]

      // Filtrar archivos que se mantienen
      tareaExistente.archivos = tareaExistente.archivos.filter((archivo) =>
        archivosPreviosIds.includes(archivo._id.toString()),
      )
    }

    await tareaExistente.save()

    // Poblar los campos para la respuesta
    const tareaActualizada = await Tarea.findById(tareaExistente._id)
      .populate("asignado", "nombre avatar")
      .populate("creador", "nombre avatar")
      .populate("columna", "nombre")

    console.log("✅ Tarea actualizada exitosamente:", tareaActualizada._id)

    res.status(200).json({
      success: true,
      tarea: tareaActualizada,
    })
  } catch (error) {
    console.error("❌ Error al actualizar la tarea:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar la tarea",
      error: error.message,
    })
  }
}

// @desc    Eliminar una tarea
// @route   DELETE /api/tareas/:id
// @access  Private
export const eliminarTarea = async (req, res) => {
  try {
    console.log("🗑️ Eliminando tarea:", req.params.id)

    const tarea = await Tarea.findById(req.params.id)

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      })
    }

    // Eliminar archivos asociados si existen
    if (tarea.archivos && tarea.archivos.length > 0) {
      tarea.archivos.forEach((archivo) => {
        try {
          if (fs.existsSync(archivo.ruta)) {
            fs.unlinkSync(archivo.ruta)
          }
        } catch (err) {
          console.error("Error al eliminar archivo:", err)
        }
      })
    }

    await Tarea.findByIdAndDelete(req.params.id)

    console.log("✅ Tarea eliminada exitosamente:", req.params.id)

    res.status(200).json({
      success: true,
      message: "Tarea eliminada correctamente",
    })
  } catch (error) {
    console.error("❌ Error al eliminar la tarea:", error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar la tarea",
      error: error.message,
    })
  }
}
