import express from "express"
import {
  getEpicas,
  getEpicasByProyecto,
  getEpicaById,
  crearEpica,
  actualizarEpica,
  eliminarEpica,
} from "../controllers/epicasController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Proteger todas las rutas
router.use(authMiddleware)

router.route("/").get(getEpicas).post(crearEpica)
router.route("/proyecto/:proyectoId").get(getEpicasByProyecto)
router.route("/:id").get(getEpicaById).put(actualizarEpica).delete(eliminarEpica)

export default router
