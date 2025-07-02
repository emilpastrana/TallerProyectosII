import Equipo from "../models/Equipo.js"
import Usuario from "../models/Usuario.js"
import mongoose from "mongoose"

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

// Función helper para validar ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && id.length === 24
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

    if (!miembros || !Array.isArray(miembros) || miembros.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Debe seleccionar al menos 2 miembros para el equipo",
      })
    }

    // Obtener todos los usuarios para usar como fallback
    const todosLosUsuarios = await Usuario.find()
    console.log(
      "Usuarios disponibles:",
      todosLosUsuarios.map((u) => ({ id: u._id, nombre: u.nombre })),
    )

    if (todosLosUsuarios.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay usuarios disponibles en el sistema",
      })
    }

    // Procesar miembros - convertir IDs a ObjectIds válidos
    const miembrosValidos = []

    for (const miembroId of miembros) {
      console.log(`Procesando miembro: ${miembroId} (tipo: ${typeof miembroId})`)

      let usuarioId = null

      if (isValidObjectId(miembroId)) {
        // Es un ObjectId válido
        const usuarioExiste = await Usuario.findById(miembroId)
        if (usuarioExiste) {
          usuarioId = miembroId
          console.log(`✅ ObjectId válido encontrado: ${usuarioId}`)
        } else {
          console.log(`❌ ObjectId válido pero usuario no existe: ${miembroId}`)
        }
      } else {
        // Es un ID simple (como "1", "2"), buscar por índice
        const indice = Number.parseInt(miembroId) - 1
        if (indice >= 0 && indice < todosLosUsuarios.length) {
          usuarioId = todosLosUsuarios[indice]._id
          console.log(`✅ ID simple convertido: ${miembroId} -> ${usuarioId}`)
        } else {
          console.log(`❌ ID simple fuera de rango: ${miembroId}`)
        }
      }

      if (usuarioId) {
        miembrosValidos.push(usuarioId)
      }
    }

    console.log("Miembros válidos procesados:", miembrosValidos)

    if (miembrosValidos.length < 2) {
      return res.status(400).json({
        success: false,
        message: "No se pudieron validar suficientes miembros. Debe haber al menos 2 miembros válidos.",
      })
    }

    // Crear array de miembros con roles
    const miembrosConRoles = []

    // Agregar el creador como admin si no está en la lista
    if (!miembrosValidos.some((id) => id.toString() === req.usuario.id.toString())) {
      miembrosConRoles.push({ usuario: req.usuario.id, rol: "admin" })
      console.log("✅ Creador agregado como admin:", req.usuario.id)
    }

    // Agregar todos los miembros seleccionados
    for (const miembroId of miembrosValidos) {
      const rol = miembroId.toString() === req.usuario.id.toString() ? "admin" : "miembro"
      miembrosConRoles.push({ usuario: miembroId, rol })
      console.log(`✅ Miembro agregado: ${miembroId} como ${rol}`)
    }

    console.log("Miembros finales con roles:", miembrosConRoles)

    // Crear el equipo
    const nuevoEquipo = new Equipo({
      nombre,
      descripcion,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`,
      creador: req.usuario.id,
      miembros: miembrosConRoles,
    })

    console.log("Equipo a guardar:", {
      nombre: nuevoEquipo.nombre,
      creador: nuevoEquipo.creador,
      miembros: nuevoEquipo.miembros,
    })

    const equipoGuardado = await nuevoEquipo.save()
    console.log("✅ Equipo guardado exitosamente:", equipoGuardado._id)

    // Poblar los datos antes de enviar la respuesta
    const equipoCompleto = await Equipo.findById(equipoGuardado._id)
      .populate("creador", "nombre avatar")
      .populate("miembros.usuario", "nombre avatar")

    console.log("Equipo completo con populate:", {
      id: equipoCompleto._id,
      nombre: equipoCompleto.nombre,
      miembros: equipoCompleto.miembros.map((m) => ({
        usuario: m.usuario.nombre,
        rol: m.rol,
      })),
    })

    res.status(201).json({
      success: true,
      equipo: equipoCompleto,
    })
  } catch (error) {
    console.error("❌ Error al crear equipo:", error)
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
    const { nombre, descripcion, logo, miembros } = req.body

    console.log("=== ACTUALIZAR EQUIPO ===")
    console.log("ID del equipo:", req.params.id)
    console.log("Datos recibidos:", { nombre, descripcion, logo, miembros })

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

    console.log("Equipo actual:", {
      nombre: equipo.nombre,
      creador: equipo.creador,
      miembros: equipo.miembros.map((m) => ({ usuario: m.usuario, rol: m.rol })),
    })

    const esAdmin = equipo.miembros.some((m) => m.usuario.toString() === req.usuario.id && m.rol === "admin")

    if (!esAdmin) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para actualizar este equipo",
      })
    }

    // Validar miembros si se proporcionan
    let miembrosActualizados = equipo.miembros
    if (miembros && Array.isArray(miembros)) {
      console.log("Actualizando miembros...")

      // Obtener todos los usuarios para usar como fallback
      const todosLosUsuarios = await Usuario.find()

      const miembrosValidos = []
      for (const miembroId of miembros) {
        console.log(`Procesando miembro para actualización: ${miembroId}`)

        let usuarioId = null

        if (isValidObjectId(miembroId)) {
          const usuarioExiste = await Usuario.findById(miembroId)
          if (usuarioExiste) {
            usuarioId = miembroId
            console.log(`✅ ObjectId válido: ${usuarioId}`)
          }
        } else {
          const indice = Number.parseInt(miembroId) - 1
          if (indice >= 0 && indice < todosLosUsuarios.length) {
            usuarioId = todosLosUsuarios[indice]._id
            console.log(`✅ ID convertido: ${miembroId} -> ${usuarioId}`)
          }
        }

        if (usuarioId) {
          miembrosValidos.push(usuarioId)
        }
      }

      console.log("Miembros válidos para actualización:", miembrosValidos)

      // Crear nueva lista de miembros con roles
      miembrosActualizados = []

      // Mantener al creador como admin
      miembrosActualizados.push({ usuario: equipo.creador, rol: "admin" })

      // Agregar miembros seleccionados (excluyendo al creador para evitar duplicados)
      for (const miembroId of miembrosValidos) {
        if (miembroId.toString() !== equipo.creador.toString()) {
          miembrosActualizados.push({ usuario: miembroId, rol: "miembro" })
        }
      }

      console.log("Miembros actualizados finales:", miembrosActualizados)
    }

    // Actualizar el equipo
    const equipoActualizado = await Equipo.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        descripcion,
        logo: logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=random`,
        miembros: miembrosActualizados,
      },
      { new: true, runValidators: true },
    )
      .populate("creador", "nombre avatar")
      .populate("miembros.usuario", "nombre avatar")

    console.log("✅ Equipo actualizado exitosamente")

    res.status(200).json({
      success: true,
      equipo: equipoActualizado,
    })
  } catch (error) {
    console.error("❌ Error al actualizar equipo:", error)
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

    // Verificar si el usuario existe (manejar tanto ObjectIds como IDs simples)
    let usuarioId
    if (isValidObjectId(usuario)) {
      const usuarioExistente = await Usuario.findById(usuario)
      if (!usuarioExistente) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        })
      }
      usuarioId = usuario
    } else {
      // Buscar por índice
      const todosLosUsuarios = await Usuario.find()
      const indice = Number.parseInt(usuario) - 1
      if (indice >= 0 && indice < todosLosUsuarios.length) {
        usuarioId = todosLosUsuarios[indice]._id
      } else {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        })
      }
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
    const yaEsMiembro = equipo.miembros.some((m) => m.usuario.toString() === usuarioId.toString())
    if (yaEsMiembro) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya es miembro del equipo",
      })
    }

    // Agregar miembro
    equipo.miembros.push({
      usuario: usuarioId,
      rol: rol || "miembro",
    })

    await equipo.save()

     // Crear notificación para el nuevo miembro
    await crearNotificacion(
      usuario._id,
      "equipo",
      "Añadido a equipo",
      `Has sido añadido al equipo "${equipo.nombre}"`,
      {
        entidadId: equipo._id,
        tipoEntidad: "equipo",
      },
      {
        ruta: `/equipos/${equipo._id}`,
      },
    )

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
