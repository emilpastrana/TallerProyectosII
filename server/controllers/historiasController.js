import Historia from "../models/Historia.js"
import Epica from "../models/Epica.js"
import Tarea from "../models/Tarea.js"

// @desc    Obtener todas las historias
// @route   GET /api/historias
// @access  Private
export const getHistorias = async (req, res) => {
  try {
    const historias = await Historia.find()
      .populate("proyecto", "nombre clave")
      .populate("epicaId", "titulo")
      .populate("creador", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    res.status(200).json({
      success: true,
      count: historias.length,
      historias,
    })
  } catch (error) {
    console.error(error)
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
    const historias = await Historia.find({ proyecto: req.params.proyectoId })
      .populate("proyecto", "nombre clave")
      .populate("epicaId", "titulo")
      .populate("creador", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    res.status(200).json({
      success: true,
      count: historias.length,
      historias,
    })
  } catch (error) {
    console.error(error)
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
    const historias = await Historia.find({ epicaId: req.params.epicaId })
      .populate("proyecto", "nombre clave")
      .populate("epicaId", "titulo")
      .populate("creador", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    res.status(200).json({
      success: true,
      count: historias.length,
      historias,
    })
  } catch (error) {
    console.error(error)
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
    const historia = await Historia.findById(req.params.id)
      .populate("proyecto", "nombre clave")
      .populate("epicaId", "titulo")
      .populate("creador", "nombre avatar")

    if (!historia) {
      return res.status(404).json({
        success: false,
        message: "Historia no encontrada",
      })
    }

    // Obtener tareas asociadas a la historia
    const tareas = await Tarea.find({ historiaId: historia._id })
      .populate("asignado", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    res.status(200).json({
      success: true,
      historia,
      tareas,
    })
  } catch (error) {
    console.error(error)
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
    const { titulo, descripcion, comoUsuario, quiero, para, proyecto, epicaId, prioridad, estado } = req.body

    // Validaciones
    if (!titulo || !proyecto || !epicaId) {
      return res.status(400).json({
        success: false,
        message: "Título, proyecto y épica son campos obligatorios",
      })
    }

    // Verificar si la épica existe
    const epicaExistente = await Epica.findById(epicaId)
    if (!epicaExistente) {
      return res.status(404).json({
        success: false,
        message: "Épica no encontrada",
      })
    }

    // Crear la historia
    const nuevaHistoria = new Historia({
      titulo,
      descripcion,
      comoUsuario,
      quiero,
      para,
      proyecto,
      epicaId,
      creador: req.usuario.id,
      prioridad: prioridad || "media",
      estado: estado || "pendiente",
    })

    const historiaGuardada = await nuevaHistoria.save()

    res.status(201).json({
      success: true,
      historia: historiaGuardada,
    })
  } catch (error) {
    console.error(error)
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

    if (!historiaActualizada) {
      return res.status(404).json({
        success: false,
        message: "Historia no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      historia: historiaActualizada,
    })
  } catch (error) {
    console.error(error)
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
    const historia = await Historia.findById(req.params.id)

    if (!historia) {
      return res.status(404).json({
        success: false,
        message: "Historia no encontrada",
      })
    }

    // Actualizar tareas asociadas a la historia
    await Tarea.updateMany({ historiaId: historia._id }, { $unset: { historiaId: "" } })

    // Eliminar la historia
    await Historia.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Historia eliminada correctamente",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar la historia",
      error: error.message,
    })
  }
}
