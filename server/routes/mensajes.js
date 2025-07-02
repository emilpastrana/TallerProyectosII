import express from "express"
import {
  getChats,
  getMensajes,
  enviarMensaje,
  marcarMensajesLeidos,
  getUsuariosParaChat,
} from "../controllers/mensajesController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// Rutas de mensajes
router.get("/chats", getChats)
router.get("/usuarios", getUsuariosParaChat)
router.get("/:chatId/:tipoChat", getMensajes)
router.post("/", enviarMensaje)
router.put("/marcar-leidos", marcarMensajesLeidos)

export default router
