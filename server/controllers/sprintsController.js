import Sprint from "../models/Sprint.js"
import Historia from "../models/Historia.js"
import Proyecto from "../models/Proyecto.js"
import Columna from "../models/Columna.js"
import Tablero from "../models/Tablero.js"
import mongoose from "mongoose"

// @desc    Obtener todos los sprints de un proyecto
// @route   GET /api/sprints/proyecto/:proyectoId
// @access  Private
export const getSprintsByProyecto = async (req, res) => {
  try {
    console.log("🔍 Obteniendo sprints del proyecto:", req.params.proyectoId)

    // Validar que el proyectoId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.proyectoId)) {
      console.log("❌ ID de proyecto inválido:", req.params.proyectoId)
      return res.status(400).json({
        success: false,
        message: "ID de proyecto inválido",
      })
    }

    const sprints = await Sprint.find({ proyecto: req.params.proyectoId })
      .populate("proyecto", "nombre clave")
      .populate("creador", "nombre avatar")
      .sort({ numero: 1 })

    // Para cada sprint, obtener las historias asignadas
    const sprintsConHistorias = await Promise.all(
      sprints.map(async (sprint) => {
        const historias = await Historia.find({ sprintId: sprint._id })
          .populate("epicaId", "titulo")
          .select("titulo descripcion estado prioridad puntos")

        return {
          ...sprint.toObject(),
          historias,
        }
      }),
    )

    console.log("✅ Sprints encontrados:", sprintsConHistorias.length)

    res.status(200).json({
      success: true,
      count: sprintsConHistorias.length,
      sprints: sprintsConHistorias,
    })
  } catch (error) {
    console.error("❌ Error al obtener sprints del proyecto:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener sprints del proyecto",
      error: error.message,
    })
  }
}

// @desc    Obtener un sprint por ID
// @route   GET /api/sprints/:id
// @access  Private
export const getSprintById = async (req, res) => {
  try {
    console.log("🔍 Obteniendo sprint por ID:", req.params.id)

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sprint inválido",
      })
    }

    const sprint = await Sprint.findById(req.params.id)
      .populate("proyecto", "nombre clave")
      .populate("creador", "nombre avatar")

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint no encontrado",
      })
    }

    // Obtener historias del sprint
    const historias = await Historia.find({ sprintId: sprint._id })
      .populate("epicaId", "titulo")
      .select("titulo descripcion estado prioridad puntos")

    res.status(200).json({
      success: true,
      sprint: {
        ...sprint.toObject(),
        historias,
      },
    })
  } catch (error) {
    console.error("❌ Error al obtener el sprint:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener el sprint",
      error: error.message,
    })
  }
}

// @desc    Crear un nuevo sprint
// @route   POST /api/sprints
// @access  Private
export const crearSprint = async (req, res) => {
  try {
    console.log("🆕 Creando nuevo sprint")
    console.log("📤 Datos recibidos:", req.body)

    const { nombre, objetivo, fechaInicio, fechaFin, proyecto, historiasSeleccionadas } = req.body

    // Validaciones
    if (!nombre || !fechaInicio || !fechaFin || !proyecto) {
      return res.status(400).json({
        success: false,
        message: "Nombre, fechas y proyecto son campos obligatorios",
      })
    }

    if (!mongoose.Types.ObjectId.isValid(proyecto)) {
      return res.status(400).json({
        success: false,
        message: "ID de proyecto inválido",
      })
    }

    // Verificar que el proyecto existe
    const proyectoExistente = await Proyecto.findById(proyecto)
    if (!proyectoExistente) {
      return res.status(404).json({
        success: false,
        message: "Proyecto no encontrado",
      })
    }

    // Obtener el siguiente número de sprint para este proyecto
    const ultimoSprint = await Sprint.findOne({ proyecto }).sort({ numero: -1 })
    const numeroSprint = ultimoSprint ? ultimoSprint.numero + 1 : 1

    // Crear el sprint
    const nuevoSprint = new Sprint({
      nombre,
      numero: numeroSprint,
      objetivo,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      proyecto: new mongoose.Types.ObjectId(proyecto),
      creador: req.usuario?.id,
    })

    const sprintGuardado = await nuevoSprint.save()

    // Asignar historias seleccionadas al sprint
    if (historiasSeleccionadas && historiasSeleccionadas.length > 0) {
      await Historia.updateMany(
        { _id: { $in: historiasSeleccionadas } },
        { sprintId: sprintGuardado._id, fechaActualizacion: new Date() },
      )
    }

    // Obtener el sprint completo con historias
    const sprintCompleto = await Sprint.findById(sprintGuardado._id)
      .populate("proyecto", "nombre")
      .populate("creador", "nombre")

    const historias = await Historia.find({ sprintId: sprintGuardado._id })
      .populate("epicaId", "titulo")
      .select("titulo descripcion estado prioridad puntos")

    console.log("✅ Sprint creado exitosamente:", sprintGuardado._id)

    res.status(201).json({
      success: true,
      sprint: {
        ...sprintCompleto.toObject(),
        historias,
      },
    })
  } catch (error) {
    console.error("❌ Error al crear el sprint:", error)
    res.status(500).json({
      success: false,
      message: "Error al crear el sprint",
      error: error.message,
    })
  }
}

// @desc    Actualizar un sprint
// @route   PUT /api/sprints/:id
// @access  Private
export const actualizarSprint = async (req, res) => {
  try {
    console.log("✏️ Actualizando sprint:", req.params.id)
    console.log("📤 Datos recibidos:", req.body)

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sprint inválido",
      })
    }

    const { nombre, objetivo, fechaInicio, fechaFin, estado, historiasSeleccionadas } = req.body

    // Validaciones
    if (!nombre || !fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        message: "Nombre y fechas son campos obligatorios",
      })
    }

    // Obtener el sprint actual para verificar su estado
    const sprintActual = await Sprint.findById(req.params.id)
    if (!sprintActual) {
      return res.status(404).json({
        success: false,
        message: "Sprint no encontrado",
      })
    }

    // Si el sprint ya está en progreso, no permitir cambiar las historias
    if (sprintActual.estado === "en progreso" && historiasSeleccionadas) {
      return res.status(400).json({
        success: false,
        message: "No se pueden modificar las historias de un sprint en progreso",
      })
    }

    // Preparar datos para actualizar
    const datosActualizacion = {
      nombre,
      objetivo,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      fechaActualizacion: new Date(),
    }

    // Si se proporciona un nuevo estado, actualizarlo
    if (estado) {
      datosActualizacion.estado = estado
    }

    // Buscar y actualizar el sprint
    const sprintActualizado = await Sprint.findByIdAndUpdate(req.params.id, datosActualizacion, {
      new: true,
      runValidators: true,
    })
      .populate("proyecto", "nombre")
      .populate("creador", "nombre")

    // Actualizar asignación de historias si se proporcionan y el sprint no está en progreso
    if (historiasSeleccionadas !== undefined && sprintActual.estado !== "en progreso") {
      // Primero, desasignar todas las historias del sprint
      await Historia.updateMany({ sprintId: req.params.id }, { $unset: { sprintId: "" } })

      // Luego, asignar las historias seleccionadas
      if (historiasSeleccionadas.length > 0) {
        await Historia.updateMany(
          { _id: { $in: historiasSeleccionadas } },
          { sprintId: req.params.id, fechaActualizacion: new Date() },
        )
      }
    }

    // Obtener historias actualizadas
    const historias = await Historia.find({ sprintId: req.params.id })
      .populate("epicaId", "titulo")
      .select("titulo descripcion estado prioridad puntos")

    console.log("✅ Sprint actualizado exitosamente:", sprintActualizado._id)

    res.status(200).json({
      success: true,
      sprint: {
        ...sprintActualizado.toObject(),
        historias,
      },
    })
  } catch (error) {
    console.error("❌ Error al actualizar el sprint:", error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar el sprint",
      error: error.message,
    })
  }
}

// @desc    Eliminar un sprint
// @route   DELETE /api/sprints/:id
// @access  Private
export const eliminarSprint = async (req, res) => {
  try {
    console.log("🗑️ Eliminando sprint:", req.params.id)

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sprint inválido",
      })
    }

    const sprint = await Sprint.findById(req.params.id)

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint no encontrado",
      })
    }

    // No permitir eliminar sprints en progreso
    if (sprint.estado === "en progreso") {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar un sprint en progreso",
      })
    }

    // Desasignar todas las historias del sprint
    await Historia.updateMany({ sprintId: req.params.id }, { $unset: { sprintId: "" } })

    // Eliminar el sprint
    await Sprint.findByIdAndDelete(req.params.id)

    console.log("✅ Sprint eliminado exitosamente:", req.params.id)

    res.status(200).json({
      success: true,
      message: "Sprint eliminado correctamente",
    })
  } catch (error) {
    console.error("❌ Error al eliminar el sprint:", error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar el sprint",
      error: error.message,
    })
  }
}

// @desc    Obtener historias sin asignar a sprint de un proyecto
// @route   GET /api/sprints/proyecto/:proyectoId/historias-disponibles
// @access  Private
export const getHistoriasDisponibles = async (req, res) => {
  try {
    console.log("🔍 Obteniendo historias disponibles del proyecto:", req.params.proyectoId)

    if (!mongoose.Types.ObjectId.isValid(req.params.proyectoId)) {
      return res.status(400).json({
        success: false,
        message: "ID de proyecto inválido",
      })
    }

    const historias = await Historia.find({
      proyecto: req.params.proyectoId,
      $or: [{ sprintId: { $exists: false } }, { sprintId: null }],
    })
      .populate("epicaId", "titulo")
      .select("titulo descripcion estado prioridad puntos epicaId")
      .sort({ fechaCreacion: -1 })

    console.log("✅ Historias disponibles encontradas:", historias.length)

    res.status(200).json({
      success: true,
      count: historias.length,
      historias,
    })
  } catch (error) {
    console.error("❌ Error al obtener historias disponibles:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener historias disponibles",
      error: error.message,
    })
  }
}

// @desc    Asignar historias a un sprint
// @route   POST /api/sprints/:id/asignar-historias
// @access  Private
export const asignarHistorias = async (req, res) => {
  try {
    console.log("📝 Asignando historias al sprint:", req.params.id)

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sprint inválido",
      })
    }

    const { historiasIds } = req.body

    if (!historiasIds || !Array.isArray(historiasIds)) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de IDs de historias",
      })
    }

    // Verificar que el sprint existe
    const sprint = await Sprint.findById(req.params.id)
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint no encontrado",
      })
    }

    // Asignar las historias al sprint
    const resultado = await Historia.updateMany(
      { _id: { $in: historiasIds } },
      { sprintId: req.params.id, fechaActualizacion: new Date() },
    )

    console.log("✅ Historias asignadas:", resultado.modifiedCount)

    res.status(200).json({
      success: true,
      message: `${resultado.modifiedCount} historias asignadas al sprint`,
      historiasAsignadas: resultado.modifiedCount,
    })
  } catch (error) {
    console.error("❌ Error al asignar historias:", error)
    res.status(500).json({
      success: false,
      message: "Error al asignar historias",
      error: error.message,
    })
  }
}

// @desc    Desasignar historias de un sprint
// @route   POST /api/sprints/:id/desasignar-historias
// @access  Private
export const desasignarHistorias = async (req, res) => {
  try {
    console.log("📝 Desasignando historias del sprint:", req.params.id)

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sprint inválido",
      })
    }

    const { historiasIds } = req.body

    if (!historiasIds || !Array.isArray(historiasIds)) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de IDs de historias",
      })
    }

    // Desasignar las historias del sprint
    const resultado = await Historia.updateMany(
      { _id: { $in: historiasIds }, sprintId: req.params.id },
      { $unset: { sprintId: "" }, fechaActualizacion: new Date() },
    )

    console.log("✅ Historias desasignadas:", resultado.modifiedCount)

    res.status(200).json({
      success: true,
      message: `${resultado.modifiedCount} historias desasignadas del sprint`,
      historiasDesasignadas: resultado.modifiedCount,
    })
  } catch (error) {
    console.error("❌ Error al desasignar historias:", error)
    res.status(500).json({
      success: false,
      message: "Error al desasignar historias",
      error: error.message,
    })
  }
}

// @desc    Iniciar un sprint
// @route   POST /api/sprints/:id/iniciar
// @access  Private
export const iniciarSprint = async (req, res) => {
  try {
    console.log("🚀 Iniciando sprint:", req.params.id)

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sprint inválido",
      })
    }

    // Verificar que el sprint existe
    const sprint = await Sprint.findById(req.params.id)
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint no encontrado",
      })
    }

    // Verificar que el sprint no esté ya en progreso o completado
    if (sprint.estado !== "pendiente") {
      return res.status(400).json({
        success: false,
        message: `No se puede iniciar un sprint que ya está ${sprint.estado}`,
      })
    }

    // Verificar que no haya otro sprint en progreso en el mismo proyecto
    const sprintActivo = await Sprint.findOne({ proyecto: sprint.proyecto, estado: "en progreso" })
    if (sprintActivo) {
      return res.status(400).json({
        success: false,
        message: "Ya hay un sprint activo en este proyecto",
      })
    }

    // Verificar que se inician en orden (no puede haber sprints pendientes con número menor)
    const sprintAnteriorPendiente = await Sprint.findOne({
      proyecto: sprint.proyecto,
      numero: { $lt: sprint.numero },
      estado: "pendiente",
    })
    if (sprintAnteriorPendiente) {
      return res.status(400).json({
        success: false,
        message: "Hay sprints anteriores pendientes. Los sprints deben iniciarse en orden",
      })
    }

    // Verificar que el sprint tiene historias asignadas
    const historiasCount = await Historia.countDocuments({ sprintId: sprint._id })
    if (historiasCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede iniciar un sprint sin historias asignadas",
      })
    }

    // Actualizar el sprint a estado "en progreso"
    const sprintActualizado = await Sprint.findByIdAndUpdate(
      req.params.id,
      {
        estado: "en progreso",
        fechaInicioReal: new Date(),
        fechaActualizacion: new Date(),
      },
      { new: true },
    )
      .populate("proyecto", "nombre")
      .populate("creador", "nombre")

    // Obtener el tablero del proyecto
    const tablero = await Tablero.findOne({ proyecto: sprint.proyecto })
    if (!tablero) {
      return res.status(404).json({
        success: false,
        message: "Tablero del proyecto no encontrado",
      })
    }

    // Obtener la primera columna del tablero (Por hacer)
    const columnaInicial = await Columna.findOne({ tableroId: tablero._id }).sort({ orden: 1 })
    if (!columnaInicial) {
      return res.status(404).json({
        success: false,
        message: "No se encontró la columna inicial del tablero",
      })
    }

    // Mover todas las historias del sprint a la columna inicial del tablero
    // y actualizar su estado a "pendiente"
    await Historia.updateMany(
      { sprintId: sprint._id },
      {
        columnaId: columnaInicial._id,
        estado: "pendiente",
        fechaActualizacion: new Date(),
      },
    )

    // Obtener historias actualizadas
    const historias = await Historia.find({ sprintId: sprint._id })
      .populate("epicaId", "titulo")
      .select("titulo descripcion estado prioridad puntos columnaId")

    console.log("✅ Sprint iniciado exitosamente:", sprintActualizado._id)

    res.status(200).json({
      success: true,
      message: "Sprint iniciado correctamente",
      sprint: {
        ...sprintActualizado.toObject(),
        historias,
      },
    })
  } catch (error) {
    console.error("❌ Error al iniciar el sprint:", error)
    res.status(500).json({
      success: false,
      message: "Error al iniciar el sprint",
      error: error.message,
    })
  }
}

// @desc    Finalizar un sprint
// @route   POST /api/sprints/:id/finalizar
// @access  Private
export const finalizarSprint = async (req, res) => {
  try {
    console.log("🏁 Finalizando sprint:", req.params.id)

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sprint inválido",
      })
    }

    // Verificar que el sprint existe
    const sprint = await Sprint.findById(req.params.id)
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint no encontrado",
      })
    }

    // Verificar que el sprint está en progreso
    if (sprint.estado !== "en progreso") {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden finalizar sprints que estén en progreso",
      })
    }

    // Obtener el tablero del proyecto
    const tablero = await Tablero.findOne({ proyecto: sprint.proyecto })
    if (!tablero) {
      return res.status(404).json({
        success: false,
        message: "Tablero del proyecto no encontrado",
      })
    }

    // Obtener la última columna del tablero (Terminadas)
    const columnaFinal = await Columna.findOne({ tableroId: tablero._id }).sort({ orden: -1 })
    if (!columnaFinal) {
      return res.status(404).json({
        success: false,
        message: "No se encontró la columna final del tablero",
      })
    }

    // Verificar que todas las historias del sprint están en la columna final
    const historiasNoTerminadas = await Historia.countDocuments({
      sprintId: sprint._id,
      columnaId: { $ne: columnaFinal._id },
    })

    if (historiasNoTerminadas > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede finalizar el sprint porque hay historias que no están terminadas",
      })
    }

    // Actualizar el sprint a estado "completado"
    const sprintActualizado = await Sprint.findByIdAndUpdate(
      req.params.id,
      {
        estado: "completado",
        fechaFinReal: new Date(),
        fechaActualizacion: new Date(),
      },
      { new: true },
    )
      .populate("proyecto", "nombre")
      .populate("creador", "nombre")

    // Actualizar todas las historias del sprint a estado "completada"
    await Historia.updateMany(
      { sprintId: sprint._id },
      {
        estado: "completada",
        fechaActualizacion: new Date(),
      },
    )

    // Obtener historias actualizadas
    const historias = await Historia.find({ sprintId: sprint._id })
      .populate("epicaId", "titulo")
      .select("titulo descripcion estado prioridad puntos columnaId")

    console.log("✅ Sprint finalizado exitosamente:", sprintActualizado._id)

    res.status(200).json({
      success: true,
      message: "Sprint finalizado correctamente",
      sprint: {
        ...sprintActualizado.toObject(),
        historias,
      },
    })
  } catch (error) {
    console.error("❌ Error al finalizar el sprint:", error)
    res.status(500).json({
      success: false,
      message: "Error al finalizar el sprint",
      error: error.message,
    })
  }
}

// @desc    Cancelar un sprint
// @route   POST /api/sprints/:id/cancelar
// @access  Private
export const cancelarSprint = async (req, res) => {
  try {
    console.log("❌ Cancelando sprint:", req.params.id)

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sprint inválido",
      })
    }

    // Verificar que el sprint existe
    const sprint = await Sprint.findById(req.params.id)
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint no encontrado",
      })
    }

    // Verificar que el sprint está en progreso o pendiente
    if (sprint.estado !== "en progreso" && sprint.estado !== "pendiente") {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden cancelar sprints que estén en progreso o pendientes",
      })
    }

    // Actualizar el sprint a estado "cancelado"
    const sprintActualizado = await Sprint.findByIdAndUpdate(
      req.params.id,
      {
        estado: "cancelado",
        fechaActualizacion: new Date(),
      },
      { new: true },
    )
      .populate("proyecto", "nombre")
      .populate("creador", "nombre")

    // Si el sprint estaba en progreso, desasignar las historias del tablero
    if (sprint.estado === "en progreso") {
      await Historia.updateMany(
        { sprintId: sprint._id },
        {
          $unset: { columnaId: "" },
          fechaActualizacion: new Date(),
        },
      )
    }

    // Obtener historias actualizadas
    const historias = await Historia.find({ sprintId: sprint._id })
      .populate("epicaId", "titulo")
      .select("titulo descripcion estado prioridad puntos")

    console.log("✅ Sprint cancelado exitosamente:", sprintActualizado._id)

    res.status(200).json({
      success: true,
      message: "Sprint cancelado correctamente",
      sprint: {
        ...sprintActualizado.toObject(),
        historias,
      },
    })
  } catch (error) {
    console.error("❌ Error al cancelar el sprint:", error)
    res.status(500).json({
      success: false,
      message: "Error al cancelar el sprint",
      error: error.message,
    })
  }
}

// @desc    Verificar si se puede iniciar un sprint
// @route   GET /api/sprints/:id/verificar-inicio
// @access  Private
export const verificarInicioSprint = async (req, res) => {
  try {
    console.log("🔍 Verificando si se puede iniciar el sprint:", req.params.id)

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sprint inválido",
      })
    }

    // Verificar que el sprint existe
    const sprint = await Sprint.findById(req.params.id)
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint no encontrado",
      })
    }

    // Verificar que el sprint está pendiente
    if (sprint.estado !== "pendiente") {
      return res.status(200).json({
        success: false,
        puedeIniciar: false,
        mensaje: `El sprint ya está ${sprint.estado}`,
      })
    }

    // Verificar que no haya otro sprint en progreso en el mismo proyecto
    const sprintActivo = await Sprint.findOne({ proyecto: sprint.proyecto, estado: "en progreso" })
    if (sprintActivo) {
      return res.status(200).json({
        success: false,
        puedeIniciar: false,
        mensaje: "Ya hay un sprint activo en este proyecto",
      })
    }

    // Verificar que se inician en orden (no puede haber sprints pendientes con número menor)
    const sprintAnteriorPendiente = await Sprint.findOne({
      proyecto: sprint.proyecto,
      numero: { $lt: sprint.numero },
      estado: "pendiente",
    })
    if (sprintAnteriorPendiente) {
      return res.status(200).json({
        success: false,
        puedeIniciar: false,
        mensaje: "Hay sprints anteriores pendientes. Los sprints deben iniciarse en orden",
      })
    }

    // Verificar que el sprint tiene historias asignadas
    const historiasCount = await Historia.countDocuments({ sprintId: sprint._id })
    if (historiasCount === 0) {
      return res.status(200).json({
        success: false,
        puedeIniciar: false,
        mensaje: "No se puede iniciar un sprint sin historias asignadas",
      })
    }

    // Todo está bien, se puede iniciar el sprint
    return res.status(200).json({
      success: true,
      puedeIniciar: true,
      mensaje: "El sprint puede iniciarse",
    })
  } catch (error) {
    console.error("❌ Error al verificar inicio del sprint:", error)
    res.status(500).json({
      success: false,
      message: "Error al verificar inicio del sprint",
      error: error.message,
    })
  }
}

// @desc    Verificar si se puede finalizar un sprint
// @route   GET /api/sprints/:id/verificar-finalizacion
// @access  Private
export const verificarFinalizacionSprint = async (req, res) => {
  try {
    console.log("🔍 Verificando si se puede finalizar el sprint:", req.params.id)

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID de sprint inválido",
      })
    }

    // Verificar que el sprint existe
    const sprint = await Sprint.findById(req.params.id)
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint no encontrado",
      })
    }

    // Verificar que el sprint está en progreso
    if (sprint.estado !== "en progreso") {
      return res.status(200).json({
        success: false,
        puedeFinalizar: false,
        mensaje: "Solo se pueden finalizar sprints que estén en progreso",
      })
    }

    // Obtener el tablero del proyecto
    const tablero = await Tablero.findOne({ proyecto: sprint.proyecto })
    if (!tablero) {
      return res.status(200).json({
        success: false,
        puedeFinalizar: false,
        mensaje: "Tablero del proyecto no encontrado",
      })
    }

    // Obtener la última columna del tablero (Terminadas)
    const columnaFinal = await Columna.findOne({ tableroId: tablero._id }).sort({ orden: -1 })
    if (!columnaFinal) {
      return res.status(200).json({
        success: false,
        puedeFinalizar: false,
        mensaje: "No se encontró la columna final del tablero",
      })
    }

    // Verificar que todas las historias del sprint están en la columna final
    const historiasNoTerminadas = await Historia.countDocuments({
      sprintId: sprint._id,
      columnaId: { $ne: columnaFinal._id },
    })

    if (historiasNoTerminadas > 0) {
      return res.status(200).json({
        success: false,
        puedeFinalizar: false,
        mensaje: `Hay ${historiasNoTerminadas} historias que no están en la columna de terminadas`,
      })
    }

    // Todo está bien, se puede finalizar el sprint
    return res.status(200).json({
      success: true,
      puedeFinalizar: true,
      mensaje: "El sprint puede finalizarse",
    })
  } catch (error) {
    console.error("❌ Error al verificar finalización del sprint:", error)
    res.status(500).json({
      success: false,
      message: "Error al verificar finalización del sprint",
      error: error.message,
    })
  }
}
