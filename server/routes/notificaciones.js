import express from "express"
import {
    getNotificaciones,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    getContadorNoLeidas,
} from "../controllers/notificacionesController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// Rutas de notificaciones
router.get("/", getNotificaciones)
router.get("/contador", getContadorNoLeidas)
router.put("/marcar-todas-leidas", marcarTodasComoLeidas)
router.put("/:id/leer", marcarComoLeida)
router.delete("/:id", eliminarNotificacion)

export default router
