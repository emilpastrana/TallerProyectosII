import Notificacion from "../models/Notificacion.js"

// @desc    Obtener notificaciones del usuario
// @route   GET /api/notificaciones
// @access  Private
export const getNotificaciones = async (req, res) => {
    try {
        const usuarioId = req.usuario.id
        const { filtro = "todas", page = 1, limit = 20 } = req.query

        const query = { destinatario: usuarioId }

        // Aplicar filtros
        if (filtro !== "todas") {
            if (filtro === "no-leidas") {
                query.leida = false
            } else {
                query.tipo = filtro
            }
        }

        const notificaciones = await Notificacion.find(query)
            .populate("origen.entidadId")
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await Notificacion.countDocuments(query)
        const noLeidas = await Notificacion.countDocuments({
            destinatario: usuarioId,
            leida: false,
        })

        res.status(200).json({
            success: true,
            notificaciones,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
            },
            noLeidas,
        })
    } catch (error) {
        console.error("Error al obtener notificaciones:", error)
        res.status(500).json({
            success: false,
            message: "Error al obtener notificaciones",
            error: error.message,
        })
    }
}

// @desc    Marcar notificación como leída
// @route   PUT /api/notificaciones/:id/leer
// @access  Private
export const marcarComoLeida = async (req, res) => {
    try {
        const { id } = req.params
        const usuarioId = req.usuario.id

        const notificacion = await Notificacion.findOneAndUpdate(
            { _id: id, destinatario: usuarioId },
            { leida: true },
            { new: true },
        )

        if (!notificacion) {
            return res.status(404).json({
                success: false,
                message: "Notificación no encontrada",
            })
        }

        res.status(200).json({
            success: true,
            notificacion,
        })
    } catch (error) {
        console.error("Error al marcar notificación como leída:", error)
        res.status(500).json({
            success: false,
            message: "Error al marcar notificación como leída",
            error: error.message,
        })
    }
}

// @desc    Marcar todas las notificaciones como leídas
// @route   PUT /api/notificaciones/marcar-todas-leidas
// @access  Private
export const marcarTodasComoLeidas = async (req, res) => {
    try {
        const usuarioId = req.usuario.id

        await Notificacion.updateMany({ destinatario: usuarioId, leida: false }, { leida: true })

        res.status(200).json({
            success: true,
            message: "Todas las notificaciones marcadas como leídas",
        })
    } catch (error) {
        console.error("Error al marcar todas las notificaciones como leídas:", error)
        res.status(500).json({
            success: false,
            message: "Error al marcar todas las notificaciones como leídas",
            error: error.message,
        })
    }
}

// @desc    Eliminar notificación
// @route   DELETE /api/notificaciones/:id
// @access  Private
export const eliminarNotificacion = async (req, res) => {
    try {
        const { id } = req.params
        const usuarioId = req.usuario.id

        const notificacion = await Notificacion.findOneAndDelete({
            _id: id,
            destinatario: usuarioId,
        })

        if (!notificacion) {
            return res.status(404).json({
                success: false,
                message: "Notificación no encontrada",
            })
        }

        res.status(200).json({
            success: true,
            message: "Notificación eliminada",
        })
    } catch (error) {
        console.error("Error al eliminar notificación:", error)
        res.status(500).json({
            success: false,
            message: "Error al eliminar notificación",
            error: error.message,
        })
    }
}

// @desc    Crear notificación
// @route   POST /api/notificaciones
// @access  Private (interno)
export const crearNotificacion = async (destinatario, tipo, titulo, mensaje, origen = null, accion = null) => {
    try {
        const nuevaNotificacion = new Notificacion({
            destinatario,
            tipo,
            titulo,
            mensaje,
            origen,
            accion,
        })

        await nuevaNotificacion.save()
        return nuevaNotificacion
    } catch (error) {
        console.error("Error al crear notificación:", error)
        throw error
    }
}

// @desc    Obtener contador de notificaciones no leídas
// @route   GET /api/notificaciones/contador
// @access  Private
export const getContadorNoLeidas = async (req, res) => {
    try {
        const usuarioId = req.usuario.id
        const contador = await Notificacion.countDocuments({
            destinatario: usuarioId,
            leida: false,
        })

        res.status(200).json({
            success: true,
            contador,
        })
    } catch (error) {
        console.error("Error al obtener contador de notificaciones:", error)
        res.status(500).json({
            success: false,
            message: "Error al obtener contador de notificaciones",
            error: error.message,
        })
    }
}
