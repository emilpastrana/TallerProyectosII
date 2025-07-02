import Tablero from "../models/Tablero.js"
import Columna from "../models/Columna.js"
import Tarea from "../models/Tarea.js"
import Historia from "../models/Historia.js"
import mongoose from "mongoose"

// @desc    Obtener todos los tableros de un proyecto
// @route   GET /api/tableros/proyecto/:proyectoId
// @access  Private
export const getTablerosByProyecto = async (req, res) => {
  try {
    console.log("🔍 Obteniendo tableros del proyecto:", req.params.proyectoId)

    // Validar que el proyectoId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.proyectoId)) {
      console.log("❌ ID de proyecto inválido:", req.params.proyectoId)
      return res.status(400).json({
        success: false,
        message: "ID de proyecto inválido",
      })
    }

    const tableros = await Tablero.find({ proyecto: req.params.proyectoId })
      .populate("proyecto", "nombre clave")
      .sort({ fechaCreacion: -1 })

    console.log("✅ Tableros encontrados:", tableros.length)

    res.status(200).json({
      success: true,
      count: tableros.length,
      tableros,
    })
  } catch (error) {
    console.error("❌ Error al obtener tableros del proyecto:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener tableros del proyecto",
      error: error.message,
    })
  }
}

// @desc    Obtener un tablero por ID con columnas y tareas
// @route   GET /api/tableros/:id
// @access  Private
export const getTableroById = async (req, res) => {
  try {
    console.log("🔍 Obteniendo tablero por ID:", req.params.id)

    // Validar que el id sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("❌ ID de tablero inválido:", req.params.id)
      return res.status(400).json({
        success: false,
        message: "ID de tablero inválido",
      })
    }

    const tablero = await Tablero.findById(req.params.id)
      .populate("proyecto", "nombre clave")

    if (!tablero) {
      console.log("❌ Tablero no encontrado:", req.params.id)
      return res.status(404).json({
        success: false,
        message: "Tablero no encontrado",
      })
    }

    // Obtener columnas del tablero
    const columnas = await Columna.find({ tableroId: tablero._id }).sort({ orden: 1 })

    // Para cada columna, obtener sus tareas e historias
    const columnasConTareas = await Promise.all(
      columnas.map(async (columna) => {
        // Obtener tareas de la columna
        const tareas = await Tarea.find({ columnaId: columna._id })
          .populate("asignado", "nombre avatar")
          .populate("historiaId", "titulo")
          .sort({ orden: 1 })

        // Obtener historias de la columna (del sprint activo)
        const historias = await Historia.find({ columnaId: columna._id })
          .populate("epicaId", "titulo")
          .populate("sprintId", "nombre numero")
          .sort({ fechaActualizacion: -1 })

        return {
          ...columna.toObject(),
          tareas,
          historias,
        }
      }),
    )

    console.log("✅ Tablero encontrado:", tablero.nombre)
    console.log("📋 Columnas:", columnasConTareas.length)

    res.status(200).json({
      success: true,
      tablero,
      columnas: columnasConTareas,
    })
  } catch (error) {
    console.error("❌ Error al obtener el tablero:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener el tablero",
      error: error.message,
    })
  }
}

// @desc    Crear un nuevo tablero
// @route   POST /api/tableros
// @access  Private
export const crearTablero = async (req, res) => {
  try {
    console.log("🆕 Creando nuevo tablero")
    console.log("📤 Datos recibidos:", req.body)

    const { nombre, descripcion, proyecto } = req.body

    // Validaciones
    if (!nombre || !proyecto) {
      console.log("❌ Faltan campos requeridos")
      return res.status(400).json({
        success: false,
        message: "Nombre y proyecto son campos obligatorios",
      })
    }

    // Validar que el proyecto sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(proyecto)) {
      console.log("❌ ID de proyecto inválido:", proyecto)
      return res.status(400).json({
        success: false,
        message: "ID de proyecto inválido",
      })
    }

    // Crear el tablero
    const nuevoTablero = new Tablero({
      nombre,
      descripcion,
      proyecto: new mongoose.Types.ObjectId(proyecto),
    })

    const tableroGuardado = await nuevoTablero.save()

    console.log("✅ Tablero creado exitosamente:", tableroGuardado._id)

    // Crear columnas por defecto
    const columnasDefault = [
      { nombre: "Por hacer", orden: 1, tableroId: tableroGuardado._id },
      { nombre: "En progreso", orden: 2, tableroId: tableroGuardado._id },
      { nombre: "En revisión", orden: 3, tableroId: tableroGuardado._id },
      { nombre: "Terminadas", orden: 4, tableroId: tableroGuardado._id },
    ]

    const columnas = await Columna.insertMany(columnasDefault)

    console.log("✅ Columnas creadas:", columnas.length)

    res.status(201).json({
      success: true,
      tablero: tableroGuardado,
      columnas,
    })
  } catch (error) {
    console.error("❌ Error al crear el tablero:", error)
    res.status(500).json({
      success: false,
      message: "Error al crear el tablero",
      error: error.message,
    })
  }
}

// @desc    Actualizar un tablero
// @route   PUT /api/tableros/:id
// @access  Private
export const actualizarTablero = async (req, res) => {
  try {
    console.log("✏️ Actualizando tablero:", req.params.id)
    console.log("📤 Datos recibidos:", req.body)

    // Validar que el id sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("❌ ID de tablero inválido:", req.params.id)
      return res.status(400).json({
        success: false,
        message: "ID de tablero inválido",
      })
    }

    const { nombre, descripcion } = req.body

    // Validaciones
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre es obligatorio",
      })
    }

    // Buscar y actualizar el tablero
    const tableroActualizado = await Tablero.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        descripcion,
        fechaActualizacion: new Date(),
      },
      { new: true, runValidators: true },
    )
      .populate("proyecto", "nombre")

    if (!tableroActualizado) {
      console.log("❌ Tablero no encontrado:", req.params.id)
      return res.status(404).json({
        success: false,
        message: "Tablero no encontrado",
      })
    }

    console.log("✅ Tablero actualizado exitosamente:", tableroActualizado._id)

    res.status(200).json({
      success: true,
      tablero: tableroActualizado,
    })
  } catch (error) {
    console.error("❌ Error al actualizar el tablero:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar el tablero",
      error: error.message,
    })
  }
}

// @desc    Eliminar un tablero
// @route   DELETE /api/tableros/:id
// @access  Private
export const eliminarTablero = async (req, res) => {
  try {
    console.log("🗑️ Eliminando tablero:", req.params.id)

    // Validar que el id sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("❌ ID de tablero inválido:", req.params.id)
      return res.status(400).json({
        success: false,
        message: "ID de tablero inválido",
      })
    }

    const tablero = await Tablero.findById(req.params.id)

    if (!tablero) {
      console.log("❌ Tablero no encontrado:", req.params.id)
      return res.status(404).json({
        success: false,
        message: "Tablero no encontrado",
      })
    }

    // Obtener columnas del tablero
    const columnas = await Columna.find({ tableroId: tablero._id })

    // Eliminar tareas de cada columna
    for (const columna of columnas) {
      await Tarea.deleteMany({ columnaId: columna._id })
    }

    // Eliminar columnas
    await Columna.deleteMany({ tableroId: tablero._id })

    // Eliminar el tablero
    await Tablero.findByIdAndDelete(req.params.id)

    console.log("✅ Tablero eliminado exitosamente:", req.params.id)

    res.status(200).json({
      success: true,
      message: "Tablero eliminado correctamente",
    })
  } catch (error) {
    console.error("❌ Error al eliminar el tablero:", error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar el tablero",
      error: error.message,
    })
  }
}

// @desc    Mover una tarea entre columnas
// @route   PUT /api/tableros/mover-tarea/:tareaId
// @access  Private
export const moverTarea = async (req, res) => {
  try {
    console.log("🔄 Moviendo tarea:", req.params.tareaId)
    console.log("📤 Datos recibidos:", req.body)

    // Validar que el tareaId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.tareaId)) {
      console.log("❌ ID de tarea inválido:", req.params.tareaId)
      return res.status(400).json({
        success: false,
        message: "ID de tarea inválido",
      })
    }

    const { columnaDestinoId } = req.body

    // Validar que el columnaDestinoId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(columnaDestinoId)) {
      console.log("❌ ID de columna destino inválido:", columnaDestinoId)
      return res.status(400).json({
        success: false,
        message: "ID de columna destino inválido",
      })
    }

    // Verificar que la tarea existe
    const tarea = await Tarea.findById(req.params.tareaId)
    if (!tarea) {
      console.log("❌ Tarea no encontrada:", req.params.tareaId)
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      })
    }

    // Verificar que la columna destino existe
    const columnaDestino = await Columna.findById(columnaDestinoId)
    if (!columnaDestino) {
      console.log("❌ Columna destino no encontrada:", columnaDestinoId)
      return res.status(404).json({
        success: false,
        message: "Columna destino no encontrada",
      })
    }

    // Actualizar la tarea con la nueva columna
    const tareaActualizada = await Tarea.findByIdAndUpdate(
      req.params.tareaId,
      {
        columnaId: columnaDestinoId,
        fechaActualizacion: new Date(),
      },
      { new: true },
    )
      .populate("asignado", "nombre avatar")
      .populate("historiaId", "titulo")

    console.log("✅ Tarea movida exitosamente:", tareaActualizada._id)

    res.status(200).json({
      success: true,
      tarea: tareaActualizada,
    })
  } catch (error) {
    console.error("❌ Error al mover la tarea:", error)
    res.status(500).json({
      success: false,
      message: "Error al mover la tarea",
      error: error.message,
    })
  }
}

// @desc    Mover una historia entre columnas
// @route   PUT /api/tableros/mover-historia/:historiaId
// @access  Private
export const moverHistoria = async (req, res) => {
  try {
    console.log("🔄 Moviendo historia:", req.params.historiaId)
    console.log("📤 Datos recibidos:", req.body)

    // Validar que el historiaId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.historiaId)) {
      console.log("❌ ID de historia inválido:", req.params.historiaId)
      return res.status(400).json({
        success: false,
        message: "ID de historia inválido",
      })
    }

    const { columnaDestinoId } = req.body

    // Validar que el columnaDestinoId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(columnaDestinoId)) {
      console.log("❌ ID de columna destino inválido:", columnaDestinoId)
      return res.status(400).json({
        success: false,
        message: "ID de columna destino inválido",
      })
    }

    // Verificar que la historia existe
    const historia = await Historia.findById(req.params.historiaId)
    if (!historia) {
      console.log("❌ Historia no encontrada:", req.params.historiaId)
      return res.status(404).json({
        success: false,
        message: "Historia no encontrada",
      })
    }

    // Verificar que la historia pertenece a un sprint activo
    if (!historia.sprintId) {
      console.log("❌ La historia no pertenece a ningún sprint:", req.params.historiaId)
      return res.status(400).json({
        success: false,
        message: "La historia no pertenece a ningún sprint activo",
      })
    }

    // Verificar que la columna destino existe
    const columnaDestino = await Columna.findById(columnaDestinoId)
    if (!columnaDestino) {
      console.log("❌ Columna destino no encontrada:", columnaDestinoId)
      return res.status(404).json({
        success: false,
        message: "Columna destino no encontrada",
      })
    }

    // Obtener todas las columnas del tablero para determinar el estado según la columna
    const tablero = await Tablero.findOne({ _id: columnaDestino.tableroId })
    // Determinar el estado según el nombre de la columna destino
    let nuevoEstado = "pendiente"
    if (columnaDestino.nombre === "En progreso") {
      nuevoEstado = "en progreso"
    } else if (columnaDestino.nombre === "Completado") {
      nuevoEstado = "completada"
    }

    // Actualizar la historia con la nueva columna y estado
    const historiaActualizada = await Historia.findByIdAndUpdate(
      req.params.historiaId,
      {
        columnaId: columnaDestinoId,
        estado: nuevoEstado,
        fechaActualizacion: new Date(),
      },
      { new: true },
    )
      .populate("epicaId", "titulo")
      .populate("sprintId", "nombre numero")

    // Siempre actualizar el estado de todas las tareas asociadas a la historia
    await Tarea.updateMany(
      { historiaId: historiaActualizada._id },
      { $set: { estado: nuevoEstado } }
    )

    console.log("✅ Historia movida exitosamente:", historiaActualizada._id)
    console.log("📋 Nuevo estado:", nuevoEstado)

    res.status(200).json({
      success: true,
      historia: historiaActualizada,
    })
  } catch (error) {
    console.error("❌ Error al mover la historia:", error)
    res.status(500).json({
      success: false,
      message: "Error al mover la historia",
      error: error.message,
    })
  }
}
