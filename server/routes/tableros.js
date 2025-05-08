import express from "express"
import Tablero from "../models/Tablero.js"
import Columna from "../models/Columna.js"
import Tarea from "../models/Tarea.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Obtener todos los tableros de un proyecto
router.get("/proyecto/:proyectoId", authMiddleware, async (req, res) => {
  try {
    const tableros = await Tablero.find({ proyecto: req.params.proyectoId })

    res.status(200).json({
      success: true,
      count: tableros.length,
      tableros,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al obtener tableros",
      error: error.message,
    })
  }
})

// Obtener un tablero por ID con sus columnas y tareas
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const tablero = await Tablero.findById(req.params.id)

    if (!tablero) {
      return res.status(404).json({
        success: false,
        message: "Tablero no encontrado",
      })
    }

    // Obtener columnas del tablero
    const columnas = await Columna.find({ tableroId: req.params.id }).sort({ orden: 1 })

    // Obtener tareas para cada columna
    const columnasConTareas = await Promise.all(
      columnas.map(async (columna) => {
        const tareas = await Tarea.find({ columna: columna._id })
          .populate("asignado", "nombre avatar")
          .sort({ prioridad: -1 })

        return {
          ...columna.toObject(),
          tareas,
        }
      }),
    )

    res.status(200).json({
      success: true,
      tablero,
      columnas: columnasConTareas,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al obtener el tablero",
      error: error.message,
    })
  }
})

// Crear un nuevo tablero
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, proyecto } = req.body

    const nuevoTablero = new Tablero({
      nombre,
      descripcion,
      proyecto,
    })

    await nuevoTablero.save()

    // Crear columnas por defecto
    const columnasDefault = [
      { nombre: "Por hacer", orden: 1 },
      { nombre: "En progreso", orden: 2 },
      { nombre: "En revisión", orden: 3 },
      { nombre: "Completado", orden: 4 },
    ]

    const columnas = columnasDefault.map((col) => ({
      ...col,
      tableroId: nuevoTablero._id,
    }))

    await Columna.insertMany(columnas)

    res.status(201).json({
      success: true,
      tablero: nuevoTablero,
      columnas,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al crear el tablero",
      error: error.message,
    })
  }
})

// Actualizar un tablero
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body

    const tableroActualizado = await Tablero.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true, runValidators: true },
    )

    if (!tableroActualizado) {
      return res.status(404).json({
        success: false,
        message: "Tablero no encontrado",
      })
    }

    res.status(200).json({
      success: true,
      tablero: tableroActualizado,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar el tablero",
      error: error.message,
    })
  }
})

// Eliminar un tablero
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const tablero = await Tablero.findById(req.params.id)

    if (!tablero) {
      return res.status(404).json({
        success: false,
        message: "Tablero no encontrado",
      })
    }

    // Eliminar columnas asociadas
    await Columna.deleteMany({ tableroId: req.params.id })

    // Eliminar el tablero
    await tablero.remove()

    res.status(200).json({
      success: true,
      message: "Tablero eliminado correctamente",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar el tablero",
      error: error.message,
    })
  }
})

// Mover una tarea entre columnas
router.put("/mover-tarea/:tareaId", authMiddleware, async (req, res) => {
  try {
    const { columnaDestinoId } = req.body

    const tarea = await Tarea.findById(req.params.tareaId)

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      })
    }

    const columnaDestino = await Columna.findById(columnaDestinoId)

    if (!columnaDestino) {
      return res.status(404).json({
        success: false,
        message: "Columna de destino no encontrada",
      })
    }

    // Actualizar el estado de la tarea según la columna
    let nuevoEstado
    switch (columnaDestino.nombre.toLowerCase()) {
      case "por hacer":
        nuevoEstado = "pendiente"
        break
      case "en progreso":
        nuevoEstado = "en progreso"
        break
      case "en revisión":
        nuevoEstado = "en revisión"
        break
      case "completado":
        nuevoEstado = "completada"
        break
      default:
        nuevoEstado = tarea.estado
    }

    // Actualizar la tarea
    tarea.columna = columnaDestinoId
    tarea.estado = nuevoEstado

    await tarea.save()

    res.status(200).json({
      success: true,
      tarea,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al mover la tarea",
      error: error.message,
    })
  }
})

export default router
