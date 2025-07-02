import express from "express"
import {
  getHistorias,
  getHistoriasByProyecto,
  getHistoriasByEpica,
  getHistoriaById,
  crearHistoria,
  actualizarHistoria,
  eliminarHistoria,
  getHistoriasSinSprint,
} from "../controllers/historiasController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Proteger todas las rutas
router.use(authMiddleware)

router.route("/").get(getHistorias).post(crearHistoria)
router.route("/proyecto/:proyectoId").get(getHistoriasByProyecto)
router.route("/proyecto/:proyectoId/sin-sprint").get(getHistoriasSinSprint)
router.route("/epica/:epicaId").get(getHistoriasByEpica)
router.route("/:id").get(getHistoriaById).put(actualizarHistoria).delete(eliminarHistoria)

export default router
