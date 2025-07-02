import Mensaje from "../models/Mensaje.js"
import Usuario from "../models/Usuario.js"
import Proyecto from "../models/Proyecto.js"
import Equipo from "../models/Equipo.js"
import { crearNotificacion } from "./notificacionesController.js"

// @desc    Obtener chats del usuario
// @route   GET /api/mensajes/chats
// @access  Private
export const getChats = async (req, res) => {
  try {
    const usuarioId = req.usuario.id

    // Obtener chats directos (donde el usuario es emisor o receptor)
    const chatsDirectos = await Mensaje.aggregate([
      {
        $match: {
          $or: [
            { emisor: usuarioId, tipoChat: "directo" },
            { receptor: usuarioId, tipoChat: "directo" },
          ],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$emisor", usuarioId] }, "$receptor", "$emisor"],
          },
          ultimoMensaje: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "usuarios",
          localField: "_id",
          foreignField: "_id",
          as: "usuario",
        },
      },
      {
        $unwind: "$usuario",
      },
    ])

    // Obtener chats de equipos donde el usuario es miembro
    const equipos = await Equipo.find({
      "miembros.usuario": usuarioId,
    })

    const chatsEquipos = []
    for (const equipo of equipos) {
      const ultimoMensaje = await Mensaje.findOne({
        receptor: equipo._id,
        tipoChat: "equipo",
      })
        .sort({ timestamp: -1 })
        .populate("emisor", "nombre avatar")

      chatsEquipos.push({
        _id: equipo._id,
        tipo: "equipo",
        nombre: equipo.nombre,
        descripcion: equipo.descripcion,
        ultimoMensaje: ultimoMensaje || null,
      })
    }

    // Obtener chats de proyectos
    const proyectos = await Proyecto.find({
      $or: [{ propietario: usuarioId }, { miembros: usuarioId }],
    })

    const chatsProyectos = []
    for (const proyecto of proyectos) {
      const ultimoMensaje = await Mensaje.findOne({
        receptor: proyecto._id,
        tipoChat: "proyecto",
      })
        .sort({ timestamp: -1 })
        .populate("emisor", "nombre avatar")

      chatsProyectos.push({
        _id: proyecto._id,
        tipo: "proyecto",
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        ultimoMensaje: ultimoMensaje || null,
      })
    }

    // Formatear chats directos
    const chatsDirectosFormateados = chatsDirectos.map((chat) => ({
      _id: chat.usuario._id,
      tipo: "directo",
      nombre: chat.usuario.nombre,
      avatar: chat.usuario.avatar,
      ultimoMensaje: chat.ultimoMensaje,
    }))

    const todosLosChats = [...chatsDirectosFormateados, ...chatsEquipos, ...chatsProyectos]

    res.status(200).json({
      success: true,
      chats: todosLosChats,
    })
  } catch (error) {
    console.error("Error al obtener chats:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener chats",
      error: error.message,
    })
  }
}

// @desc    Obtener mensajes de un chat
// @route   GET /api/mensajes/:chatId/:tipoChat
// @access  Private
export const getMensajes = async (req, res) => {
  try {
    const { chatId, tipoChat } = req.params
    const usuarioId = req.usuario.id
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 50

    let query = {}

    if (tipoChat === "directo") {
      query = {
        $or: [
          { emisor: usuarioId, receptor: chatId, tipoChat: "directo" },
          { emisor: chatId, receptor: usuarioId, tipoChat: "directo" },
        ],
      }
    } else {
      query = {
        receptor: chatId,
        tipoChat: tipoChat,
      }
    }

    const mensajes = await Mensaje.find(query)
      .populate("emisor", "nombre avatar")
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    // Marcar mensajes como leídos
    await Mensaje.updateMany(
      {
        ...query,
        emisor: { $ne: usuarioId },
        leido: false,
      },
      { leido: true },
    )

    res.status(200).json({
      success: true,
      mensajes: mensajes.reverse(),
    })
  } catch (error) {
    console.error("Error al obtener mensajes:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener mensajes",
      error: error.message,
    })
  }
}

// @desc    Enviar mensaje
// @route   POST /api/mensajes
// @access  Private
export const enviarMensaje = async (req, res) => {
  try {
    const { contenido, tipoChat, receptor, tipoReceptor, proyecto } = req.body
    const emisorId = req.usuario.id

    if (!contenido || !tipoChat || !receptor || !tipoReceptor) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
      })
    }

    const nuevoMensaje = new Mensaje({
      contenido,
      tipoChat,
      emisor: emisorId,
      receptor,
      tipoReceptor,
      proyecto: proyecto || null,
    })

    await nuevoMensaje.save()
    await nuevoMensaje.populate("emisor", "nombre avatar")

    // Crear notificación para el destinatario
    if (tipoChat === "directo") {
      await crearNotificacion(
        receptor,
        "mencion",
        "Nuevo mensaje",
        `${req.usuario.nombre} te ha enviado un mensaje: "${contenido.substring(0, 50)}${contenido.length > 50 ? "..." : ""}"`,
        {
          entidadId: nuevoMensaje._id,
          tipoEntidad: "mensaje",
        },
        {
          ruta: "/mensajes",
        },
      )
    }

    res.status(201).json({
      success: true,
      mensaje: nuevoMensaje,
    })
  } catch (error) {
    console.error("Error al enviar mensaje:", error)
    res.status(500).json({
      success: false,
      message: "Error al enviar mensaje",
      error: error.message,
    })
  }
}

// @desc    Marcar mensajes como leídos
// @route   PUT /api/mensajes/marcar-leidos
// @access  Private
export const marcarMensajesLeidos = async (req, res) => {
  try {
    const { chatId, tipoChat } = req.body
    const usuarioId = req.usuario.id

    let query = {}

    if (tipoChat === "directo") {
      query = {
        emisor: chatId,
        receptor: usuarioId,
        tipoChat: "directo",
        leido: false,
      }
    } else {
      query = {
        receptor: chatId,
        tipoChat: tipoChat,
        emisor: { $ne: usuarioId },
        leido: false,
      }
    }

    await Mensaje.updateMany(query, { leido: true })

    res.status(200).json({
      success: true,
      message: "Mensajes marcados como leídos",
    })
  } catch (error) {
    console.error("Error al marcar mensajes como leídos:", error)
    res.status(500).json({
      success: false,
      message: "Error al marcar mensajes como leídos",
      error: error.message,
    })
  }
}

// @desc    Obtener usuarios para chat
// @route   GET /api/mensajes/usuarios
// @access  Private
export const getUsuariosParaChat = async (req, res) => {
  try {
    const usuarioId = req.usuario.id
    const usuarios = await Usuario.find({
      _id: { $ne: usuarioId },
      estado: "activo",
    }).select("nombre correo avatar rol")

    res.status(200).json({
      success: true,
      usuarios,
    })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message,
    })
  }
}
