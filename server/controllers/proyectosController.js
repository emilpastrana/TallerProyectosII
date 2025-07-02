import mongoose from "mongoose"
import Proyecto from "../models/Proyecto.js"
import Tablero from "../models/Tablero.js"
import Columna from "../models/Columna.js"
import Equipo from "../models/Equipo.js"

// @desc    Obtener todos los proyectos
// @route   GET /api/proyectos
// @access  Private
export const getProyectos = async (req, res) => {
  try {
    const proyectos = await Proyecto.find().populate("equipo", "nombre logo").sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: proyectos.length,
      proyectos,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al obtener proyectos",
      error: error.message,
    })
  }
}

export const dataProyectos = async (req, res) => {
  try {
    const proyectos = await Proyecto.find()
      .populate("equipo")
      .populate("epicas")
      .populate("historias")
      .populate("tareas")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: proyectos.length,
      proyectos,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al obtener proyectos",
      error: error.message,
    })
  }
}


// @desc    Obtener un proyecto por ID
// @route   GET /api/proyectos/:id
// @access  Private
export const getProyectoById = async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id).populate("equipo", "nombre descripcion logo miembros")

    if (!proyecto) {
      return res.status(404).json({
        success: false,
        message: "Proyecto no encontrado",
      })
    }

    res.status(200).json({
      success: true,
      proyecto,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al obtener el proyecto",
      error: error.message,
    })
  }
}

// @desc    Crear un nuevo proyecto
// @route   POST /api/proyectos
// @access  Private
export const crearProyecto = async (req, res) => {
  try {
    const { nombre, clave, descripcion, equipo, fechaInicio, fechaFin, prioridad, estado } = req.body

    // Validaciones
    if (!nombre || !clave || !equipo) {
      return res.status(400).json({
        success: false,
        message: "Nombre, clave y equipo son campos obligatorios",
      })
    }

    if (clave.length < 2 || clave.length > 10) {
      return res.status(400).json({
        success: false,
        message: "La clave debe tener entre 2 y 10 caracteres",
      })
    }

    // Verificar si ya existe un proyecto con la misma clave
    const proyectoExistente = await Proyecto.findOne({ clave })
    if (proyectoExistente) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un proyecto con esa clave",
      })
    }

    // Verificar si el equipo existe (para datos simulados)
    let equipoId = equipo

    // Si el equipo es un ID simulado (1, 2, 3), crear un ObjectId válido
    if (equipo === "1" || equipo === "2" || equipo === "3") {
      // Buscar un equipo real en la base de datos
      const equipoReal = await Equipo.findOne()
      if (equipoReal) {
        equipoId = equipoReal._id
      } else {
        // Si no hay equipos reales, crear un ObjectId válido
        equipoId = new mongoose.Types.ObjectId()
      }
    }

    // Crear el proyecto
    const nuevoProyecto = new Proyecto({
      nombre,
      clave,
      descripcion,
      equipo: equipoId,
      fechaInicio: fechaInicio || new Date(),
      fechaFin,
      prioridad: prioridad || "media",
      estado: estado || "activo",
    })

    const proyectoGuardado = await nuevoProyecto.save()

    // Crear un tablero por defecto para el proyecto
    const nuevoTablero = new Tablero({
      nombre: `Tablero de ${nombre}`,
      descripcion: `Tablero principal para el proyecto ${nombre}`,
      proyecto: proyectoGuardado._id,
    })

    const tableroGuardado = await nuevoTablero.save()

    // Crear columnas por defecto para el tablero
    const columnasDefault = [
      { nombre: "Por hacer", orden: 1 },
      { nombre: "En progreso", orden: 2 },
      { nombre: "En revisión", orden: 3 },
      { nombre: "Completado", orden: 4 },
    ]

    const columnas = columnasDefault.map((col) => ({
      ...col,
      tableroId: tableroGuardado._id,
    }))

    await Columna.insertMany(columnas)

    res.status(201).json({
      success: true,
      proyecto: proyectoGuardado,
      tablero: tableroGuardado,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al crear el proyecto: " + error.message,
      error: error.message,
    })
  }
}

// @desc    Actualizar un proyecto
// @route   PUT /api/proyectos/:id
// @access  Private
export const actualizarProyecto = async (req, res) => {
  try {
    const { nombre, descripcion, equipo, fechaInicio, fechaFin, prioridad, estado } = req.body

    // Validaciones
    if (!nombre || !equipo) {
      return res.status(400).json({
        success: false,
        message: "Nombre y equipo son campos obligatorios",
      })
    }

    // No permitir cambiar la clave del proyecto
    if (req.body.clave) {
      delete req.body.clave
    }

    // Verificar si el equipo existe (para datos simulados)
    let equipoId = equipo

    // Si el equipo es un ID simulado (1, 2, 3), crear un ObjectId válido
    if (equipo === "1" || equipo === "2" || equipo === "3") {
      // Buscar un equipo real en la base de datos
      const equipoReal = await Equipo.findOne()
      if (equipoReal) {
        equipoId = equipoReal._id
      } else {
        // Si no hay equipos reales, crear un ObjectId válido
        equipoId = new mongoose.Types.ObjectId()
      }
    }

    const proyectoActualizado = await Proyecto.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        descripcion,
        equipo: equipoId,
        fechaInicio,
        fechaFin,
        prioridad,
        estado,
      },
      { new: true, runValidators: true },
    )

    if (!proyectoActualizado) {
      return res.status(404).json({
        success: false,
        message: "Proyecto no encontrado",
      })
    }

    res.status(200).json({
      success: true,
      proyecto: proyectoActualizado,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar el proyecto",
      error: error.message,
    })
  }
}

// @desc    Eliminar un proyecto
// @route   DELETE /api/proyectos/:id
// @access  Private
export const eliminarProyecto = async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id)

    if (!proyecto) {
      return res.status(404).json({
        success: false,
        message: "Proyecto no encontrado",
      })
    }

    // Eliminar tableros asociados al proyecto
    const tableros = await Tablero.find({ proyecto: req.params.id })

    // Eliminar columnas asociadas a los tableros
    for (const tablero of tableros) {
      await Columna.deleteMany({ tableroId: tablero._id })
    }

    await Tablero.deleteMany({ proyecto: req.params.id })

    // Eliminar el proyecto
    await Proyecto.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Proyecto eliminado correctamente",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar el proyecto",
      error: error.message,
    })
  }
}

// @desc    Obtener equipos (para el formulario de proyectos)
// @route   GET /api/proyectos/equipos/lista
// @access  Private
export const getEquipos = async (req, res) => {
  try {
    // Intentar obtener equipos reales
    const equiposReales = await Equipo.find().select("nombre descripcion")

    if (equiposReales && equiposReales.length > 0) {
      return res.status(200).json({
        success: true,
        equipos: equiposReales,
      })
    }

    // Si no hay equipos reales, devolver datos simulados
    const equipos = [
      { _id: "1", nombre: "Equipo de Desarrollo" },
      { _id: "2", nombre: "Equipo de Diseño" },
      { _id: "3", nombre: "Equipo de Marketing" },
    ]

    res.status(200).json({
      success: true,
      equipos,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al obtener equipos",
      error: error.message,
    })
  }
}
