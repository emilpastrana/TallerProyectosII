import jwt from "jsonwebtoken"
import Usuario from "../models/Usuario.js"
import Mensaje from "../models/Mensaje.js"
import { crearNotificacion } from "../controllers/notificacionesController.js"

// Middleware de autenticación para Socket.IO
export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error("No token provided"))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "jwt_secret_key")
    const usuario = await Usuario.findById(decoded.id).select("-contraseña")

    if (!usuario) {
      return next(new Error("Usuario no encontrado"))
    }

    socket.userId = usuario._id.toString()
    socket.usuario = usuario
    next()
  } catch (error) {
    next(new Error("Token inválido"))
  }
}

// Manejadores de eventos de Socket.IO
export const handleConnection = (io, socket) => {
  console.log(`Usuario conectado: ${socket.usuario.nombre} (${socket.userId})`)

  // Unirse a salas personales
  socket.join(`user_${socket.userId}`)

  // Manejar envío de mensajes
  socket.on("enviar_mensaje", async (data) => {
    try {
      const { contenido, tipoChat, receptor, tipoReceptor, proyecto } = data

      // Crear el mensaje en la base de datos
      const nuevoMensaje = new Mensaje({
        contenido,
        tipoChat,
        emisor: socket.userId,
        receptor,
        tipoReceptor,
        proyecto: proyecto || null,
      })

      await nuevoMensaje.save()
      await nuevoMensaje.populate("emisor", "nombre avatar")

      // Emitir el mensaje a los destinatarios apropiados
      if (tipoChat === "directo") {
        // Mensaje directo - enviar al receptor específico
        io.to(`user_${receptor}`).emit("nuevo_mensaje", nuevoMensaje)
        socket.emit("mensaje_enviado", nuevoMensaje)

        // Crear y emitir notificación para mensajes directos
        try {
          const notificacion = await crearNotificacion(
            receptor,
            "mencion",
            "Nuevo mensaje",
            `${socket.usuario.nombre} te ha enviado un mensaje: "${contenido.substring(0, 50)}${contenido.length > 50 ? "..." : ""}"`,
            {
              entidadId: nuevoMensaje._id,
              tipoEntidad: "mensaje",
            },
            {
              ruta: "/mensajes",
            },
          )

          // Emitir notificación al destinatario
          io.to(`user_${receptor}`).emit("nueva_notificacion", notificacion)
        } catch (error) {
          console.error("Error al crear notificación:", error)
        }
      } else if (tipoChat === "equipo" || tipoChat === "proyecto") {
        // Mensaje de grupo - enviar a todos los miembros
        socket.to(`${tipoChat}_${receptor}`).emit("nuevo_mensaje", nuevoMensaje)
        socket.emit("mensaje_enviado", nuevoMensaje)
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      socket.emit("error_mensaje", { message: "Error al enviar mensaje" })
    }
  })

  // Unirse a chats de equipo/proyecto
  socket.on("unirse_chat", (data) => {
    const { chatId, tipoChat } = data
    const roomName = `${tipoChat}_${chatId}`
    socket.join(roomName)
    console.log(`Usuario ${socket.usuario.nombre} se unió al chat: ${roomName}`)
  })

  // Salir de chats de equipo/proyecto
  socket.on("salir_chat", (data) => {
    const { chatId, tipoChat } = data
    const roomName = `${tipoChat}_${chatId}`
    socket.leave(roomName)
    console.log(`Usuario ${socket.usuario.nombre} salió del chat: ${roomName}`)
  })

  // Marcar mensajes como leídos
  socket.on("marcar_leidos", async (data) => {
    try {
      const { chatId, tipoChat } = data
      let query = {}

      if (tipoChat === "directo") {
        query = {
          emisor: chatId,
          receptor: socket.userId,
          tipoChat: "directo",
          leido: false,
        }
      } else {
        query = {
          receptor: chatId,
          tipoChat: tipoChat,
          emisor: { $ne: socket.userId },
          leido: false,
        }
      }

      await Mensaje.updateMany(query, { leido: true })

      // Notificar que los mensajes fueron leídos
      if (tipoChat === "directo") {
        io.to(`user_${chatId}`).emit("mensajes_leidos", {
          chatId: socket.userId,
          tipoChat: "directo",
        })
      }
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error)
    }
  })

  // Indicar que el usuario está escribiendo
  socket.on("escribiendo", (data) => {
    const { chatId, tipoChat } = data

    if (tipoChat === "directo") {
      socket.to(`user_${chatId}`).emit("usuario_escribiendo", {
        userId: socket.userId,
        nombre: socket.usuario.nombre,
      })
    } else {
      socket.to(`${tipoChat}_${chatId}`).emit("usuario_escribiendo", {
        userId: socket.userId,
        nombre: socket.usuario.nombre,
      })
    }
  })

  // Indicar que el usuario dejó de escribir
  socket.on("dejo_escribir", (data) => {
    const { chatId, tipoChat } = data

    if (tipoChat === "directo") {
      socket.to(`user_${chatId}`).emit("usuario_dejo_escribir", {
        userId: socket.userId,
      })
    } else {
      socket.to(`${tipoChat}_${chatId}`).emit("usuario_dejo_escribir", {
        userId: socket.userId,
      })
    }
  })

  // Manejar desconexión
  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.usuario.nombre} (${socket.userId})`)
  })
}
