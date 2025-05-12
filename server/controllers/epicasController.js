import Epica from "../models/Epica.js"
import Historia from "../models/Historia.js"
import Proyecto from "../models/Proyecto.js"

// @desc    Obtener todas las épicas
// @route   GET /api/epicas
// @access  Private
export const getEpicas = async (req, res) => {
  try {
    const epicas = await Epica.find()
      .populate("proyecto", "nombre clave")
      .populate("creador", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    res.status(200).json({
      success: true,
      count: epicas.length,
      epicas,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al obtener épicas",
      error: error.message,
    })
  }
}

// @desc    Obtener épicas por proyecto
// @route   GET /api/epicas/proyecto/:proyectoId
// @access  Private
export const getEpicasByProyecto = async (req, res) => {
  try {
    const epicas = await Epica.find({ proyecto: req.params.proyectoId })
      .populate("proyecto", "nombre clave")
      .populate("creador", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    res.status(200).json({
      success: true,
      count: epicas.length,
      epicas,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al obtener épicas del proyecto",
      error: error.message,
    })
  }
}

// @desc    Obtener una épica por ID
// @route   GET /api/epicas/:id
// @access  Private
export const getEpicaById = async (req, res) => {
  try {
    const epica = await Epica.findById(req.params.id)
      .populate("proyecto", "nombre clave")
      .populate("creador", "nombre avatar")

    if (!epica) {
      return res.status(404).json({
        success: false,
        message: "Épica no encontrada",
      })
    }

    // Obtener historias asociadas a la épica
    const historias = await Historia.find({ epicaId: epica._id })
      .populate("creador", "nombre avatar")
      .sort({ fechaCreacion: -1 })

    res.status(200).json({
      success: true,
      epica,
      historias,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al obtener la épica",
      error: error.message,
    })
  }
}

// @desc    Crear una nueva épica
// @route   POST /api/epicas
// @access  Private
export const crearEpica = async (req, res) => {
  try {
    const { titulo, descripcion, proyecto, prioridad, estado, fechaInicio, fechaFin } = req.body

    // Validaciones
    if (!titulo || !proyecto) {
      return res.status(400).json({
        success: false,
        message: "Título y proyecto son campos obligatorios",
      })
    }

    // Verificar si el proyecto existe
    const proyectoExistente = await Proyecto.findById(proyecto)
    if (!proyectoExistente) {
      return res.status(404).json({
        success: false,
        message: "Proyecto no encontrado",
      })
    }

    // Crear la épica
    const nuevaEpica = new Epica({
      titulo,
      descripcion,
      proyecto,
      creador: req.usuario.id,
      prioridad: prioridad || "media",
      estado: estado || "pendiente",
      fechaInicio: fechaInicio || new Date(),
      fechaFin,
    })

    const epicaGuardada = await nuevaEpica.save()

    res.status(201).json({
      success: true,
      epica: epicaGuardada,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al crear la épica",
      error: error.message,
    })
  }
}

// @desc    Actualizar una épica
// @route   PUT /api/epicas/:id
// @access  Private
export const actualizarEpica = async (req, res) => {
  try {
    const { titulo, descripcion, prioridad, estado, fechaInicio, fechaFin } = req.body

    // Validaciones
    if (!titulo) {
      return res.status(400).json({
        success: false,
        message: "El título es obligatorio",
      })
    }

    // Buscar y actualizar la épica
    const epicaActualizada = await Epica.findByIdAndUpdate(
      req.params.id,
      {
        titulo,
        descripcion,
        prioridad,
        estado,
        fechaInicio,
        fechaFin,
        fechaActualizacion: new Date(),
      },
      { new: true, runValidators: true },
    )

    if (!epicaActualizada) {
      return res.status(404).json({
        success: false,
        message: "Épica no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      epica: epicaActualizada,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar la épica",
      error: error.message,
    })
  }
}

// @desc    Eliminar una épica
// @route   DELETE /api/epicas/:id
// @access  Private
export const eliminarEpica = async (req, res) => {
  try {
    const epica = await Epica.findById(req.params.id)

    if (!epica) {
      return res.status(404).json({
        success: false,
        message: "Épica no encontrada",
      })
    }

    // Eliminar historias asociadas a la épica
    await Historia.deleteMany({ epicaId: epica._id })

    // Eliminar la épica
    await Epica.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Épica eliminada correctamente",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar la épica",
      error: error.message,
    })
  }
}
