import express from "express"
import {
  getSprintsByProyecto,
  getSprintById,
  crearSprint,
  actualizarSprint,
  eliminarSprint,
  getHistoriasDisponibles,
  iniciarSprint,
  finalizarSprint,
  cancelarSprint,
  verificarInicioSprint,
  verificarFinalizacionSprint,
} from "../controllers/sprintsController.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Rutas protegidas
router.use(authMiddleware)

// Rutas de sprints
router.route("/proyecto/:proyectoId").get(getSprintsByProyecto)
router.route("/proyecto/:proyectoId/historias-disponibles").get(getHistoriasDisponibles)
router.route("/").post(crearSprint)
router.route("/:id").get(getSprintById).put(actualizarSprint).delete(eliminarSprint)
router.route("/:id/iniciar").post(iniciarSprint)
router.route("/:id/finalizar").post(finalizarSprint)
router.route("/:id/cancelar").post(cancelarSprint)
router.route("/:id/verificar-inicio").get(verificarInicioSprint)
router.route("/:id/verificar-finalizacion").get(verificarFinalizacionSprint)

export default router
