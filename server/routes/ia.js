import express from "express"
import { generarAlertasIA, regenerarAlertasIA, enviarNotificacionIA, procesarMensajeIA, verificarConfiguracionIA, eliminarAlertasIA } from "../controllers/iaController.js"

const router = express.Router()

// Procesar mensaje con IA
router.post("/mensaje", procesarMensajeIA)

// Verificar configuración de IA
router.get("/verificar", verificarConfiguracionIA)

// Generar alertas IA
router.get("/alertas", generarAlertasIA)

// Forzar nueva generación y reemplazo
router.post("/alertas/regenerar", regenerarAlertasIA)

// Enviar notificación IA
router.post("/alertas/notificar", enviarNotificacionIA)

// Eliminar todas las alertas IA
router.delete("/alertas", eliminarAlertasIA)

export default router
