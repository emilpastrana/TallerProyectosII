import Historia from "../models/Historia.js"
import Epica from "../models/Epica.js"
import Tarea from "../models/Tarea.js"
import mongoose from "mongoose"

// @desc    Obtener todas las historias
// @route   GET /api/historias
// @access  Private
export const getHistorias = async (req, res) => {
  try {
    console.log("🔍 Obteniendo todas las historias...")

    const historias = await Historia.find()
      .populate("proyecto", "nombre clave")
      .populate("epicaId", "titulo")
      .populate("creador", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    console.log("✅ Total de historias encontradas:", historias.length)
    console.log(
      "📋 Historias:",
      historias.map((h) => ({ id: h._id, titulo: h.titulo, epicaId: h.epicaId })),
    )

    res.status(200).json({
      success: true,
      count: historias.length,
      historias,
    })
  } catch (error) {
    console.error("❌ Error al obtener historias:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener historias",
      error: error.message,
    })
  }
}

// @desc    Obtener historias por proyecto
// @route   GET /api/historias/proyecto/:proyectoId
// @access  Private
export const getHistoriasByProyecto = async (req, res) => {
  try {
    console.log("🔍 Obteniendo historias del proyecto:", req.params.proyectoId)

    // Validar que el proyectoId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.proyectoId)) {
      console.log("❌ ID de proyecto inválido:", req.params.proyectoId)
      return res.status(400).json({
        success: false,
        message: "ID de proyecto inválido",
      })
    }

    const historias = await Historia.find({ proyecto: req.params.proyectoId })
      .populate("proyecto", "nombre clave")
      .populate("epicaId", "titulo")
      .populate("creador", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    console.log("✅ Historias encontradas:", historias.length)
    console.log("📋 Detalles de historias encontradas:")
    historias.forEach((historia, index) => {
      console.log(`  ${index + 1}. ID: ${historia._id}`)
      console.log(`     Título: ${historia.titulo}`)
      console.log(`     Proyecto: ${historia.proyecto}`)
      console.log(`     ÉpicaId: ${historia.epicaId}`)
      console.log(`     Fecha: ${historia.fechaCreacion}`)
    })

    res.status(200).json({
      success: true,
      count: historias.length,
      historias,
    })
  } catch (error) {
    console.error("❌ Error al obtener historias del proyecto:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener historias del proyecto",
      error: error.message,
    })
  }
}

// @desc    Obtener historias por épica
// @route   GET /api/historias/epica/:epicaId
// @access  Private
export const getHistoriasByEpica = async (req, res) => {
  try {
    console.log("🔍 Obteniendo historias de la épica:", req.params.epicaId)

    // Validar que el epicaId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.epicaId)) {
      console.log("❌ ID de épica inválido:", req.params.epicaId)
      return res.status(400).json({
        success: false,
        message: "ID de épica inválido",
      })
    }

    const historias = await Historia.find({ epicaId: req.params.epicaId })
      .populate("proyecto", "nombre clave")
      .populate("epicaId", "titulo")
      .populate("creador", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    console.log("✅ Historias de la épica encontradas:", historias.length)
    console.log("📋 Detalles:")
    historias.forEach((historia, index) => {
      console.log(`  ${index + 1}. ${historia.titulo} (ID: ${historia._id})`)
    })

    res.status(200).json({
      success: true,
      count: historias.length,
      historias,
    })
  } catch (error) {
    console.error("❌ Error al obtener historias de la épica:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener historias de la épica",
      error: error.message,
    })
  }
}

// @desc    Obtener una historia por ID
// @route   GET /api/historias/:id
// @access  Private
export const getHistoriaById = async (req, res) => {
  try {
    console.log("🔍 Obteniendo historia por ID:", req.params.id)

    // Validar que el id sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("❌ ID de historia inválido:", req.params.id)
      return res.status(400).json({
        success: false,
        message: "ID de historia inválido",
      })
    }

    const historia = await Historia.findById(req.params.id)
      .populate("proyecto", "nombre clave")
      .populate("epicaId", "titulo")
      .populate("creador", "nombre avatar")

    if (!historia) {
      console.log("❌ Historia no encontrada:", req.params.id)
      return res.status(404).json({
        success: false,
        message: "Historia no encontrada",
      })
    }

    console.log("✅ Historia encontrada:", historia.titulo)

    // Obtener tareas asociadas a la historia
    const tareas = await Tarea.find({ historiaId: historia._id })
      .populate("asignado", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    console.log("📋 Tareas asociadas:", tareas.length)

    res.status(200).json({
      success: true,
      historia,
      tareas,
    })
  } catch (error) {
    console.error("❌ Error al obtener la historia:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener la historia",
      error: error.message,
    })
  }
}

// @desc    Crear una nueva historia
// @route   POST /api/historias
// @access  Private
export const crearHistoria = async (req, res) => {
  try {
    console.log("🆕 Creando nueva historia")
    console.log("📤 Datos recibidos:", req.body)

    const { titulo, descripcion, comoUsuario, quiero, para, proyecto, epicaId, prioridad, estado } = req.body

    // Validaciones
    if (!titulo || !proyecto) {
      console.log("❌ Faltan campos requeridos")
      return res.status(400).json({
        success: false,
        message: "Título y proyecto son campos obligatorios",
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

    // Verificar si la épica existe (si se proporciona)
    if (epicaId) {
      if (!mongoose.Types.ObjectId.isValid(epicaId)) {
        console.log("❌ ID de épica inválido:", epicaId)
        return res.status(400).json({
          success: false,
          message: "ID de épica inválido",
        })
      }

      const epicaExistente = await Epica.findById(epicaId)
      if (!epicaExistente) {
        console.log("❌ Épica no encontrada:", epicaId)
        return res.status(404).json({
          success: false,
          message: "Épica no encontrada",
        })
      }
      console.log("✅ Épica encontrada:", epicaExistente.titulo)
    }

    // Crear la historia
    const nuevaHistoria = new Historia({
      titulo,
      descripcion,
      comoUsuario,
      quiero,
      para,
      proyecto: new mongoose.Types.ObjectId(proyecto),
      epicaId: epicaId ? new mongoose.Types.ObjectId(epicaId) : null,
      creador: req.usuario?.id,
      prioridad: prioridad || "media",
      estado: estado || "pendiente",
    })

    console.log("💾 Historia a guardar:", {
      titulo: nuevaHistoria.titulo,
      proyecto: nuevaHistoria.proyecto,
      epicaId: nuevaHistoria.epicaId,
      prioridad: nuevaHistoria.prioridad,
      estado: nuevaHistoria.estado,
    })

    const historiaGuardada = await nuevaHistoria.save()

    console.log("✅ Historia creada exitosamente:", historiaGuardada._id)
    console.log("📋 Historia completa guardada:", {
      id: historiaGuardada._id,
      titulo: historiaGuardada.titulo,
      proyecto: historiaGuardada.proyecto,
      epicaId: historiaGuardada.epicaId,
      fechaCreacion: historiaGuardada.fechaCreacion,
    })

    // Verificar que se guardó correctamente haciendo una consulta
    const historiaVerificacion = await Historia.findById(historiaGuardada._id)
      .populate("proyecto", "nombre")
      .populate("epicaId", "titulo")

    console.log("🔍 Verificación - Historia en DB:", {
      id: historiaVerificacion._id,
      titulo: historiaVerificacion.titulo,
      proyecto: historiaVerificacion.proyecto,
      epicaId: historiaVerificacion.epicaId,
    })

    res.status(201).json({
      success: true,
      historia: historiaVerificacion,
    })
  } catch (error) {
    console.error("❌ Error al crear la historia:", error)
    res.status(500).json({
      success: false,
      message: "Error al crear la historia",
      error: error.message,
    })
  }
}

// @desc    Actualizar una historia
// @route   PUT /api/historias/:id
// @access  Private
export const actualizarHistoria = async (req, res) => {
  try {
    console.log("✏️ Actualizando historia:", req.params.id)
    console.log("📤 Datos recibidos:", req.body)

    // Validar que el id sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("❌ ID de historia inválido:", req.params.id)
      return res.status(400).json({
        success: false,
        message: "ID de historia inválido",
      })
    }

    const { titulo, descripcion, comoUsuario, quiero, para, prioridad, estado } = req.body

    // Validaciones
    if (!titulo) {
      return res.status(400).json({
        success: false,
        message: "El título es obligatorio",
      })
    }

    // Buscar y actualizar la historia
    const historiaActualizada = await Historia.findByIdAndUpdate(
      req.params.id,
      {
        titulo,
        descripcion,
        comoUsuario,
        quiero,
        para,
        prioridad,
        estado,
        fechaActualizacion: new Date(),
      },
      { new: true, runValidators: true },
    )
      .populate("proyecto", "nombre")
      .populate("epicaId", "titulo")

    if (!historiaActualizada) {
      console.log("❌ Historia no encontrada:", req.params.id)
      return res.status(404).json({
        success: false,
        message: "Historia no encontrada",
      })
    }

    console.log("✅ Historia actualizada exitosamente:", historiaActualizada._id)

    res.status(200).json({
      success: true,
      historia: historiaActualizada,
    })
  } catch (error) {
    console.error("❌ Error al actualizar la historia:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar la historia",
      error: error.message,
    })
  }
}

// @desc    Eliminar una historia
// @route   DELETE /api/historias/:id
// @access  Private
export const eliminarHistoria = async (req, res) => {
  try {
    console.log("🗑️ Eliminando historia:", req.params.id)

    // Validar que el id sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("❌ ID de historia inválido:", req.params.id)
      return res.status(400).json({
        success: false,
        message: "ID de historia inválido",
      })
    }

    const historia = await Historia.findById(req.params.id)

    if (!historia) {
      console.log("❌ Historia no encontrada:", req.params.id)
      return res.status(404).json({
        success: false,
        message: "Historia no encontrada",
      })
    }

    console.log("📋 Historia a eliminar:", {
      id: historia._id,
      titulo: historia.titulo,
      proyecto: historia.proyecto,
      epicaId: historia.epicaId,
    })

    // Actualizar tareas asociadas a la historia
    const tareasActualizadas = await Tarea.updateMany({ historiaId: historia._id }, { $unset: { historiaId: "" } })
    console.log("📋 Tareas desvinculadas:", tareasActualizadas.modifiedCount)

    // Eliminar la historia
    await Historia.findByIdAndDelete(req.params.id)

    console.log("✅ Historia eliminada exitosamente:", req.params.id)

    res.status(200).json({
      success: true,
      message: "Historia eliminada correctamente",
    })
  } catch (error) {
    console.error("❌ Error al eliminar la historia:", error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar la historia",
      error: error.message,
    })
  }
}

// @desc    Obtener historias sin asignar a sprint de un proyecto
// @route   GET /api/historias/proyecto/:proyectoId/sin-sprint
// @access  Private
export const getHistoriasSinSprint = async (req, res) => {
  try {
    console.log("🔍 Obteniendo historias sin sprint del proyecto:", req.params.proyectoId)

    // Validar que el proyectoId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.proyectoId)) {
      console.log("❌ ID de proyecto inválido:", req.params.proyectoId)
      return res.status(400).json({
        success: false,
        message: "ID de proyecto inválido",
      })
    }

    const historias = await Historia.find({
      proyecto: req.params.proyectoId,
      $or: [{ sprintId: { $exists: false } }, { sprintId: null }],
    })
      .populate("proyecto", "nombre clave")
      .populate("epicaId", "titulo")
      .populate("creador", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    console.log("✅ Historias sin sprint encontradas:", historias.length)

    res.status(200).json({
      success: true,
      count: historias.length,
      historias,
    })
  } catch (error) {
    console.error("❌ Error al obtener historias sin sprint:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener historias sin sprint",
      error: error.message,
    })
  }
}
