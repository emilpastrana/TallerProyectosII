import Tarea from "../models/Tarea.js"

// @desc    Obtener todas las tareas de un proyecto
// @route   GET /api/tareas/proyecto/:proyectoId
// @access  Private
export const getTareasByProyecto = async (req, res) => {
  try {
    const tareas = await Tarea.find({ proyecto: req.params.proyectoId })
      .populate("asignado", "nombre avatar")
      .populate("creador", "nombre avatar")
      .populate("columna", "nombre")
      .sort({ fechaCreacion: -1 })

    res.status(200).json({
      success: true,
      count: tareas.length,
      tareas,
    })
  } catch (error) {
    console.error(error)
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
    const { titulo, descripcion, proyecto, asignado, prioridad, tipo, fechaLimite, tiempoEstimado, columna } = req.body

    const nuevaTarea = new Tarea({
      titulo,
      descripcion,
      proyecto,
      creador: req.usuario.id,
      asignado,
      estado: "pendiente",
      prioridad: prioridad || "media",
      tipo: tipo || "funcionalidad",
      fechaCreacion: new Date(),
      fechaLimite,
      tiempoEstimado,
      columna,
    })

    await nuevaTarea.save()

    // Poblar los campos para la respuesta
    const tareaCreada = await Tarea.findById(nuevaTarea._id)
      .populate("asignado", "nombre avatar")
      .populate("creador", "nombre avatar")
      .populate("columna", "nombre")

    res.status(201).json({
      success: true,
      tarea: tareaCreada,
    })
  } catch (error) {
    console.error(error)
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
    const { titulo, descripcion, asignado, estado, prioridad, tipo, fechaLimite, tiempoEstimado, tiempoReal, columna } =
      req.body

    const tareaActualizada = await Tarea.findByIdAndUpdate(
      req.params.id,
      {
        titulo,
        descripcion,
        asignado,
        estado,
        prioridad,
        tipo,
        fechaLimite,
        tiempoEstimado,
        tiempoReal,
        columna,
      },
      { new: true, runValidators: true },
    )
      .populate("asignado", "nombre avatar")
      .populate("creador", "nombre avatar")
      .populate("columna", "nombre")

    if (!tareaActualizada) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      })
    }

    res.status(200).json({
      success: true,
      tarea: tareaActualizada,
    })
  } catch (error) {
    console.error(error)
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
    const tarea = await Tarea.findById(req.params.id)

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: "Tarea no encontrada",
      })
    }

    await tarea.remove()

    res.status(200).json({
      success: true,
      message: "Tarea eliminada correctamente",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar la tarea",
      error: error.message,
    })
  }
}
