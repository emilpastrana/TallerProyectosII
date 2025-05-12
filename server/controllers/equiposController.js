import Equipo from "../models/Equipo.js"
import Usuario from "../models/Usuario.js"

// @desc    Obtener todos los equipos
// @route   GET /api/equipos
// @access  Private
export const getEquipos = async (req, res) => {
  try {
    const equipos = await Equipo.find()
      .populate("creador", "nombre avatar")
      .populate("miembros.usuario", "nombre avatar")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: equipos.length,
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

// @desc    Obtener un equipo por ID
// @route   GET /api/equipos/:id
// @access  Private
export const getEquipoById = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id)
      .populate("creador", "nombre avatar")
      .populate("miembros.usuario", "nombre avatar correo")

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: "Equipo no encontrado",
      })
    }

    res.status(200).json({
      success: true,
      equipo,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al obtener el equipo",
      error: error.message,
    })
  }
}

// @desc    Crear un nuevo equipo
// @route   POST /api/equipos
// @access  Private
export const crearEquipo = async (req, res) => {
  try {
    const { nombre, descripcion, miembros } = req.body

    // Validaciones
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre del equipo es obligatorio",
      })
    }

    // Crear el equipo
    const nuevoEquipo = new Equipo({
      nombre,
      descripcion,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`,
      creador: req.usuario.id,
      miembros: [
        { usuario: req.usuario.id, rol: "admin" },
        ...(miembros || []).map((m) => ({ usuario: m, rol: "miembro" })),
      ],
    })

    const equipoGuardado = await nuevoEquipo.save()

    res.status(201).json({
      success: true,
      equipo: equipoGuardado,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al crear el equipo",
      error: error.message,
    })
  }
}

// @desc    Actualizar un equipo
// @route   PUT /api/equipos/:id
// @access  Private
export const actualizarEquipo = async (req, res) => {
  try {
    const { nombre, descripcion, logo } = req.body

    // Validaciones
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre del equipo es obligatorio",
      })
    }

    // Verificar si el usuario es admin del equipo
    const equipo = await Equipo.findById(req.params.id)
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: "Equipo no encontrado",
      })
    }

    const esAdmin = equipo.miembros.some((m) => m.usuario.toString() === req.usuario.id && m.rol === "admin")

    if (!esAdmin) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar este equipo",
      })
    }

    // Actualizar el equipo
    const equipoActualizado = await Equipo.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        descripcion,
        logo: logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`,
      },
      { new: true, runValidators: true },
    )

    res.status(200).json({
      success: true,
      equipo: equipoActualizado,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al actualizar el equipo",
      error: error.message,
    })
  }
}

// @desc    Agregar miembro al equipo
// @route   POST /api/equipos/:id/miembros
// @access  Private
export const agregarMiembro = async (req, res) => {
  try {
    const { usuario, rol } = req.body

    // Validaciones
    if (!usuario) {
      return res.status(400).json({
        success: false,
        message: "El ID del usuario es obligatorio",
      })
    }

    // Verificar si el usuario existe
    const usuarioExistente = await Usuario.findById(usuario)
    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Verificar si el equipo existe
    const equipo = await Equipo.findById(req.params.id)
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: "Equipo no encontrado",
      })
    }

    // Verificar si el usuario ya es miembro
    const yaEsMiembro = equipo.miembros.some((m) => m.usuario.toString() === usuario)
    if (yaEsMiembro) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya es miembro del equipo",
      })
    }

    // Agregar miembro
    equipo.miembros.push({
      usuario,
      rol: rol || "miembro",
    })

    await equipo.save()

    res.status(200).json({
      success: true,
      message: "Miembro agregado correctamente",
      equipo,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al agregar miembro al equipo",
      error: error.message,
    })
  }
}

// @desc    Eliminar miembro del equipo
// @route   DELETE /api/equipos/:id/miembros/:usuarioId
// @access  Private
export const eliminarMiembro = async (req, res) => {
  try {
    // Verificar si el equipo existe
    const equipo = await Equipo.findById(req.params.id)
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: "Equipo no encontrado",
      })
    }

    // Verificar si el usuario es admin del equipo
    const esAdmin = equipo.miembros.some((m) => m.usuario.toString() === req.usuario.id && m.rol === "admin")

    if (!esAdmin) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar miembros de este equipo",
      })
    }

    // No permitir eliminar al creador
    if (req.params.usuarioId === equipo.creador.toString()) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar al creador del equipo",
      })
    }

    // Eliminar miembro
    equipo.miembros = equipo.miembros.filter((m) => m.usuario.toString() !== req.params.usuarioId)

    await equipo.save()

    res.status(200).json({
      success: true,
      message: "Miembro eliminado correctamente",
      equipo,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar miembro del equipo",
      error: error.message,
    })
  }
}

// @desc    Eliminar un equipo
// @route   DELETE /api/equipos/:id
// @access  Private
export const eliminarEquipo = async (req, res) => {
  try {
    const equipo = await Equipo.findById(req.params.id)

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: "Equipo no encontrado",
      })
    }

    // Verificar si el usuario es el creador del equipo
    if (equipo.creador.toString() !== req.usuario.id) {
      return res.status(403).json({
        success: false,
        message: "Solo el creador puede eliminar el equipo",
      })
    }

    await Equipo.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Equipo eliminado correctamente",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Error al eliminar el equipo",
      error: error.message,
    })
  }
}
